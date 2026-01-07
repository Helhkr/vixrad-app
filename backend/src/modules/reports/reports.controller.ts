import { Body, Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors, Res, Logger } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { ReportsRateLimitGuard } from "../security/reports-rate-limit.guard";
import { GenerateReportDto } from "./dto/generate-report.dto";
import { ReportsService } from "./reports.service";
import { AiService } from "../ai/ai.service";

@Controller("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly aiService: AiService,
  ) {}
  private readonly logger = new Logger(ReportsController.name);

  @UseGuards(JwtAuthGuard, TrialGuard, ReportsRateLimitGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post("generate")
  @UseInterceptors(
    FileInterceptor("indicationFile", {
      // Practical cap aligned with inline processing
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
      fileFilter: (_req, file, cb) => {
        const allowed = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ];
        const ok = allowed.includes(file.mimetype);
        cb(ok ? null : new Error("Tipo de arquivo inválido: apenas PDF ou imagem (JPEG/PNG/WebP)") as any, ok);
      },
    }),
  )
  async generate(
    @Body() dto: GenerateReportDto,
    @UploadedFile() file?: Express.Multer.File,
    @Res({ passthrough: true }) res?: Response,
  ) {
    this.logger.log(`[generate] Received DTO: ${JSON.stringify(dto)}`);
    this.logger.log(`[generate] incidence value: "${dto.incidence}" type: ${typeof dto.incidence}`);
    
    // Set model header early so it is present even if an exception is thrown later
    try {
      const model = await this.aiService.getResolvedModel();
      if (res) res.setHeader("X-Gemini-Model", model);
      this.logger.log(`Resolved Gemini model for request: ${model}`);
    } catch {}

    // Add approximate token estimate header for observability
    try {
      const tokenEstimate = this.aiService.estimateTokensForGenerate({
        findings: dto.findings ?? undefined,
        indication: dto.indication ?? undefined,
        hasAttachment: Boolean(file),
      });
      if (res) res.setHeader("X-Token-Estimate", String(tokenEstimate));
      this.logger.log(`Token estimate for request: ${tokenEstimate}`);
    } catch {}

    const result = await this.reportsService.generateStructuredBaseReport({
      examType: dto.examType,
      templateId: dto.templateId,
      indication: dto.indication,
      sex: dto.sex,
      side: dto.side,
      contrast: dto.contrast,
      notes: dto.notes,
      findings: dto.findings,
      indicationFile: file,
    });
    try {
      const usedModel = this.aiService.getLastUsedModel();
      if (usedModel && res) {
        res.setHeader("X-Gemini-Model", usedModel);
        this.logger.log(`Final model used for request: ${usedModel}`);
      }
    } catch {}
    return result;
  }
}
