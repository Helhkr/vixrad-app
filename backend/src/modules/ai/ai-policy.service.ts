import { Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../common/prisma/prisma.service";
import { AccessService } from "../auth/access.service";

export type AiCallPurpose = "REPORT_GENERATION" | "INDICATION_FROM_TEXT" | "INDICATION_FROM_FILE";

export type AiRoutingDecision = {
  usageId: string | null;
  requestedModel: string;
  fallbackModel: string;
  modelCandidates: string[];
  windowStart: Date;
  windowEnd: Date;
  role: "ADMIN" | "TRIAL" | "BLUE";
  quotaLimited: boolean;
  failSafeUsed: boolean;
};

@Injectable()
export class AiPolicyService {
  private readonly logger = new Logger(AiPolicyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
  ) {}

  private getPreferredModel(): string {
    return (process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview").replace(/^models\//, "");
  }

  private getFallbackModel(): string {
    return (process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-2.5-flash-lite").replace(/^models\//, "");
  }

  private getPreferredModelLimit(): number {
    const raw = (process.env.GEMINI_PREFERRED_MODEL_REQUEST_LIMIT ?? "3000").trim();
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 3000;
  }

  private reservationTtlMs(): number {
    const raw = (process.env.GEMINI_QUOTA_RESERVATION_TTL_MS ?? "300000").trim();
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 10_000 ? n : 300_000; // 5 min
  }

  private async advisoryLockForUser(tx: Prisma.TransactionClient, userId: string): Promise<void> {
    // Serialize quota decisions per user to avoid race conditions.
    await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext($1))`, userId);
  }

  async beginAiCall(params: {
    userId: string;
    purpose: AiCallPurpose;
  }): Promise<AiRoutingDecision> {
    const preferredModel = this.getPreferredModel();
    const fallbackModel = this.getFallbackModel();

    try {
      const ctx = await this.accessService.getUserAccessContext(params.userId);
      const limit = this.getPreferredModelLimit();
      const now = new Date();

      const ttlMs = this.reservationTtlMs();
      const expiresAt = new Date(now.getTime() + ttlMs);

      // Admin: no quota enforcement (but still log usage rows for future dashboard)
      if (ctx.role === "ADMIN") {
        const row = await this.prisma.aiRequestUsage.create({
          data: {
            userId: params.userId,
            purpose: params.purpose as any,
            status: "PENDING",
            windowStart: ctx.windowStart,
            windowEnd: ctx.windowEnd,
            requestedModel: preferredModel,
            expiresAt,
          },
        });

        return {
          usageId: row.id,
          requestedModel: preferredModel,
          fallbackModel,
          modelCandidates: [preferredModel, fallbackModel],
          windowStart: ctx.windowStart,
          windowEnd: ctx.windowEnd,
          role: ctx.role,
          quotaLimited: false,
          failSafeUsed: false,
        };
      }

      // Quota enforcement for TRIAL + BLUE
      const decision = await this.prisma.$transaction(async (tx) => {
        await this.advisoryLockForUser(tx, params.userId);

        const activeCount = await tx.aiRequestUsage.count({
          where: {
            userId: params.userId,
            requestedModel: preferredModel,
            windowStart: ctx.windowStart,
            windowEnd: ctx.windowEnd,
            OR: [
              { status: "SUCCESS" },
              { status: "PENDING", expiresAt: { gt: now } },
            ],
          },
        });

        const quotaLimited = activeCount >= limit;
        const requestedModel = quotaLimited ? fallbackModel : preferredModel;

        const row = await tx.aiRequestUsage.create({
          data: {
            userId: params.userId,
            purpose: params.purpose as any,
            status: "PENDING",
            windowStart: ctx.windowStart,
            windowEnd: ctx.windowEnd,
            requestedModel,
            expiresAt,
          },
        });

        return { rowId: row.id, requestedModel, quotaLimited };
      });

      return {
        usageId: decision.rowId,
        requestedModel: decision.requestedModel,
        fallbackModel,
        modelCandidates: [decision.requestedModel],
        windowStart: ctx.windowStart,
        windowEnd: ctx.windowEnd,
        role: ctx.role,
        quotaLimited: decision.quotaLimited,
        failSafeUsed: false,
      };
    } catch (err: any) {
      // Fail-safe: route to cheap model and log.
      this.logger.warn(
        `Fail-safe routing triggered for user=${params.userId} purpose=${params.purpose}: ${err?.message ?? String(err)}`,
      );

      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.reservationTtlMs());
        const row = await this.prisma.aiRequestUsage.create({
          data: {
            userId: params.userId,
            purpose: params.purpose as any,
            status: "PENDING",
            windowStart: now,
            windowEnd: now,
            requestedModel: fallbackModel,
            expiresAt,
            failSafeUsed: true,
            errorMessage: err?.message ? String(err.message) : undefined,
          },
        });

        return {
          usageId: row.id,
          requestedModel: fallbackModel,
          fallbackModel,
          modelCandidates: [fallbackModel],
          windowStart: now,
          windowEnd: now,
          role: "BLUE",
          quotaLimited: true,
          failSafeUsed: true,
        };
      } catch (logErr: any) {
        this.logger.warn(`Fail-safe logging failed: ${logErr?.message ?? String(logErr)}`);
        const now = new Date();
        return {
          usageId: null,
          requestedModel: fallbackModel,
          fallbackModel,
          modelCandidates: [fallbackModel],
          windowStart: now,
          windowEnd: now,
          role: "BLUE",
          quotaLimited: true,
          failSafeUsed: true,
        };
      }
    }
  }

  async markSuccess(params: {
    usageId: string | null;
    usedModel: string;
    usage: {
      promptTokens: number | null;
      outputTokens: number | null;
      totalTokens: number | null;
      source: "usageMetadata" | "countTokens" | "none";
    };
  }): Promise<void> {
    if (!params.usageId) return;

    await this.prisma.aiRequestUsage.update({
      where: { id: params.usageId },
      data: {
        status: "SUCCESS",
        usedModel: params.usedModel,
        promptTokens: params.usage.promptTokens ?? undefined,
        outputTokens: params.usage.outputTokens ?? undefined,
        totalTokens: params.usage.totalTokens ?? undefined,
        usageSource: params.usage.source,
      },
    });
  }

  async markFailure(params: { usageId: string | null; error: unknown }): Promise<void> {
    if (!params.usageId) return;
    const msg = params.error instanceof Error ? params.error.message : typeof params.error === "string" ? params.error : "Erro";

    await this.prisma.aiRequestUsage.update({
      where: { id: params.usageId },
      data: {
        status: "FAILED",
        errorMessage: msg,
      },
    });
  }
}
