import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { GenerateReportDto } from "./dto/generate-report.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard, TrialGuard)
  @HttpCode(200)
  @Post("generate")
  generate(@Body() dto: GenerateReportDto) {
    return this.reportsService.generateStructuredBaseReport({
      examType: dto.examType,
      templateId: dto.templateId,
    });
  }
}
