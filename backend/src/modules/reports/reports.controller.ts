import { Body, Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors, Res, Logger, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import type { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AccessGuard } from "../auth/guards/access.guard";
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

  @UseGuards(JwtAuthGuard, AccessGuard, ReportsRateLimitGuard)
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
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response,
  ) {
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
      userId: (req as any)?.user?.sub,
      examType: dto.examType,
      templateId: dto.templateId,
      type: dto.type,
      indication: dto.indication,
      sex: dto.sex,
      side: dto.side,
      contrast: dto.contrast,
      incidence: dto.incidence,
      decubitus: dto.decubitus,
      notes: dto.notes,
      academic: dto.academic,
      dxaLumbarBmd: dto.dxaLumbarBmd,
      dxaLumbarTScore: dto.dxaLumbarTScore,
      dxaLumbarZScore: dto.dxaLumbarZScore,
      dxaFemoralNeckBmd: dto.dxaFemoralNeckBmd,
      dxaFemoralNeckTScore: dto.dxaFemoralNeckTScore,
      dxaFemoralNeckZScore: dto.dxaFemoralNeckZScore,
      dxaTotalHipBmd: dto.dxaTotalHipBmd,
      dxaTotalHipTScore: dto.dxaTotalHipTScore,
      dxaTotalHipZScore: dto.dxaTotalHipZScore,
      ecgGating: dto.ecgGating,
      phases: dto.phases,
      coil: dto.coil,
      sedation: dto.sedation,
      artifactSourceEnabled: dto.artifactSourceEnabled,
      artifactSourceTypes: dto.artifactSourceTypes,
      findings: dto.findings,
      indicationFile: file,
    });

    // If Gemini was used, expose model + token usage for observability
    try {
      const calls = (result as any)?.aiCalls as
        | Array<{ purpose: string; model: string; usage?: { promptTokens: number | null; outputTokens: number | null; totalTokens: number | null } }>
        | undefined;
      if (calls && calls.length > 0 && res) {
        res.setHeader("X-Gemini-Calls", String(calls.length));

        const reportCall = calls.find((c) => c.purpose === "report_generation") ?? calls[0];
        if (reportCall?.model) {
          res.setHeader("X-Gemini-Model", reportCall.model);
          this.logger.log(`Final model used for request: ${reportCall.model}`);
        }

        const usage = reportCall?.usage;
        if (usage) {
          if (usage.promptTokens !== null) res.setHeader("X-Gemini-Prompt-Tokens", String(usage.promptTokens));
          if (usage.outputTokens !== null) res.setHeader("X-Gemini-Output-Tokens", String(usage.outputTokens));
          if (usage.totalTokens !== null) res.setHeader("X-Gemini-Total-Tokens", String(usage.totalTokens));
        }
      }
    } catch {}
    return result;
  }
}
