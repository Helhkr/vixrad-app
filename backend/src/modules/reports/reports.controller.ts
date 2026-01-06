import { Body, Controller, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { ReportsRateLimitGuard } from "../security/reports-rate-limit.guard";
import { GenerateReportDto } from "./dto/generate-report.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard, TrialGuard, ReportsRateLimitGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post("generate")
  @UseInterceptors(
    FileInterceptor("indicationFile", {
      // Gemini supports PDFs up to 50MB inline; keep a practical cap
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
      fileFilter: (_req, file, cb) => {
        const ok = file.mimetype === "application/pdf";
        cb(ok ? null : new Error("Tipo de arquivo inválido: apenas PDF é suportado") as any, ok);
      },
    }),
  )
  async generate(@Body() dto: GenerateReportDto, @UploadedFile() file?: Express.Multer.File) {
    return this.reportsService.generateStructuredBaseReport({
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
  }
}
