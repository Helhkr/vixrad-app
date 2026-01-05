import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
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
  generate(@Body() dto: GenerateReportDto) {
    return this.reportsService.generateStructuredBaseReport({
      examType: dto.examType,
      templateId: dto.templateId,
      indication: dto.indication,
      sex: dto.sex,
      side: dto.side,
      contrast: dto.contrast,
      notes: dto.notes,
      findings: dto.findings,
    });
  }
}
