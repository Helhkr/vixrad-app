import { BadRequestException, Controller, Get, Param, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AccessGuard } from "../auth/guards/access.guard";
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
  incidence: string;
  decubitus: string;
};

export type TemplateDefaults = {
  incidence?: string;
};

export type TemplateDetailItem = {
  id: string;
  name: string;
  examType: string;
  requires: TemplateRequires;
  defaults?: TemplateDefaults;
};

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UseGuards(JwtAuthGuard, AccessGuard)
  @Get()
  listTemplates(@Query("examType") examType?: string): TemplateListItem[] {
    console.log(`[TemplatesController] listTemplates called with examType=${examType}`);
    if (!examType) {
      throw new BadRequestException("examType is required");
    }

    const allowed: ExamType[] = ["CT", "XR", "US", "MR", "MG", "DXA", "NM"];
    if (!allowed.includes(examType as ExamType)) {
      throw new BadRequestException("examType inválido");
    }

    const templates = this.templatesService.listTemplates(examType as ExamType);
    console.log(`[TemplatesController] Found ${templates.length} templates for ${examType}`);
    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      examType: t.examType,
    }));
  }

  @UseGuards(JwtAuthGuard, AccessGuard)
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
      defaults: t.defaults,
    };
  }
}
