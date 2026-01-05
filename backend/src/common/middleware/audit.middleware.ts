import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { NextFunction, Request, Response } from "express";

type JwtPayload = {
  sub?: string;
};

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  private extractUserId(req: Request): string | undefined {
    const header = req.header("authorization") ?? req.header("Authorization");
    if (!header) return undefined;

    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return undefined;

    const token = match[1];

    try {
      const secret = process.env.JWT_SECRET ?? "dev-secret-change-me";
      const payload = this.jwtService.verify<JwtPayload>(token, { secret });
      return payload?.sub;
    } catch {
      return undefined;
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

      const body = (req as any).body ?? {};

      const auditEvent = {
        timestamp: new Date().toISOString(),
        durationMs: Math.round(durationMs),
        userId: this.extractUserId(req),
        endpoint: req.originalUrl ?? req.url,
        method: req.method,
        templateId: typeof body.templateId === "string" ? body.templateId : undefined,
        examType: typeof body.examType === "string" ? body.examType : undefined,
      };

      this.logger.log(JSON.stringify(auditEvent));
    });

    next();
  }
}
