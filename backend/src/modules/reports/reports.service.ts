import { Injectable } from "@nestjs/common";

import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class ReportsService {
  constructor(private readonly templatesService: TemplatesService) {}

  generateStructuredBaseReport(params: {
    examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
    templateId: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT";
    contrast?: "with" | "without";
    notes?: string;
  }) {
    const rendered = this.templatesService.renderResolvedMarkdown({
      examType: params.examType,
      templateId: params.templateId,
      indication: params.indication,
      sex: params.sex,
      side: params.side,
      contrast: params.contrast,
      notes: params.notes,
    });

    return {
      reportText: rendered.markdown,
    };
  }
}
