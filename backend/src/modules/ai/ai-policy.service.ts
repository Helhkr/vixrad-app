import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../common/prisma/prisma.service";

export type AiCallPurpose = "REPORT_GENERATION" | "INDICATION_FROM_TEXT" | "INDICATION_FROM_FILE";

export type AiRoutingDecision = {
  usageId: string | null;
  requestedModel: string;
  fallbackModel: string;
  modelCandidates: string[];
  windowStart: Date;
  windowEnd: Date;
};

@Injectable()
export class AiPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  private getPreferredModel(): string {
    return (process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview").replace(/^models\//, "");
  }

  private getFallbackModel(): string {
    return (process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-2.5-flash-lite").replace(/^models\//, "");
  }

  private buildModelCandidates(preferredModel: string, fallbackModel: string): string[] {
    return [preferredModel, fallbackModel].filter((model, index, arr) => !!model && arr.indexOf(model) === index);
  }

  async beginAiCall(params: {
    userId: string;
    purpose: AiCallPurpose;
  }): Promise<AiRoutingDecision> {
    const preferredModel = this.getPreferredModel();
    const fallbackModel = this.getFallbackModel();
    const modelCandidates = this.buildModelCandidates(preferredModel, fallbackModel);
    const now = new Date();

    const row = await this.prisma.aiRequestUsage.create({
      data: {
        userId: params.userId,
        purpose: params.purpose as any,
        status: "PENDING",
        windowStart: now,
        windowEnd: now,
        requestedModel: preferredModel,
      },
    });

    return {
      usageId: row.id,
      requestedModel: preferredModel,
      fallbackModel,
      modelCandidates,
      windowStart: now,
      windowEnd: now,
    };
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
