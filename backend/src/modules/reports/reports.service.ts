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
    findings?: string | null;
  }) {
    const baseInput = {
      examType: params.examType,
      templateId: params.templateId,
      indication: params.indication,
      sex: params.sex,
      side: params.side,
      contrast: params.contrast,
      notes: params.notes,
    } as const;

    const findings = typeof params.findings === "string" ? params.findings.trim() : "";
    const reportText =
      !findings || findings.length === 0
        ? this.templatesService.renderNormalReport(baseInput)
        : this.templatesService.renderFullReport({ ...baseInput, findings });

    return {
      reportText,
    };
  }
}
