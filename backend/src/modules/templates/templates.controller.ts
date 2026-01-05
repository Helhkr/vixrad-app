import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesService } from "./templates.service";
import type { ExamType } from "./templates.service";

export type TemplateListItem = {
  id: string;
  name: string;
  examType: string;
};

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UseGuards(JwtAuthGuard, TrialGuard)
  @Get()
  listTemplates(@Query("examType") examType?: string): TemplateListItem[] {
    if (!examType) {
      throw new BadRequestException("examType is required");
    }

    const allowed: ExamType[] = ["CT", "XR", "US", "MR", "MG", "DXA", "NM"];
    if (!allowed.includes(examType as ExamType)) {
      throw new BadRequestException("examType inválido");
    }

    return this.templatesService.listTemplates(examType as ExamType).map((t) => ({
      id: t.id,
      name: t.name,
      examType: t.examType,
    }));
  }
}
