import { Controller, Get, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TrialGuard } from "../auth/guards/trial.guard";
import { TemplatesService } from "./templates.service";

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
  listTemplates(): TemplateListItem[] {
    return this.templatesService.listTemplates().map((t) => ({
      id: t.id,
      name: t.name,
      examType: t.examType,
    }));
  }
}
