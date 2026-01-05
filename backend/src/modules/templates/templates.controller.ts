import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesService } from "./templates.service";
import type { ExamType } from "./templates.service";

export type TemplateListItem = {
  id: string;
  name: string;
  examType: string;
};

export type TemplateRequires = {
  indication: string;
  sex: string;
  contrast: string;
  side: string;
};

export type TemplateDetailItem = {
  id: string;
  name: string;
  examType: string;
  requires: TemplateRequires;
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

  @UseGuards(JwtAuthGuard, TrialGuard)
  @Get(":id")
  getTemplate(@Param("id") id: string, @Query("examType") examType?: string): TemplateDetailItem {
    const allowed: ExamType[] = ["CT", "XR", "US", "MR", "MG", "DXA", "NM"];
    const parsedExamType = examType ? (examType as ExamType) : undefined;

    if (parsedExamType && !allowed.includes(parsedExamType)) {
      throw new BadRequestException("examType inválido");
    }

    const t = this.templatesService.getTemplateDetail(id, parsedExamType);
    return {
      id: t.id,
      name: t.name,
      examType: t.examType,
      requires: t.requires,
    };
  }
}
