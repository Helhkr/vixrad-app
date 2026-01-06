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
