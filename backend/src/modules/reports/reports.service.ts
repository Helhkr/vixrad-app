import { Injectable } from "@nestjs/common";

import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class ReportsService {
  constructor(private readonly templatesService: TemplatesService) {}

  private stripDiacritics(input: string): string {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  private hasTemplateIndicationSection(markdown: string): boolean {
    const normalized = this.stripDiacritics(markdown);
    return /\*\*\s*indicacao\s*:\s*\*\*/i.test(normalized);
  }

  private composeOutput(params: {
    templateMarkdown: string;
    indication?: string;
    findings?: string;
  }): string {
    let out = params.templateMarkdown.trimEnd();

    const indication = params.indication?.trim();
    if (indication && !this.hasTemplateIndicationSection(out)) {
      out += `\n\n**Indicação clínica:** ${indication}`;
    }

    const findings = params.findings?.trim();
    if (findings) {
      out += `\n\n**ACHADOS DO EXAME:**\n\n${findings}`;
    }

    return out.trim() + "\n";
  }

  generateStructuredBaseReport(params: {
    examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
    templateId: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT";
    contrast?: "with" | "without";
    notes?: string;
    findings?: string;
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

    const reportText = this.composeOutput({
      templateMarkdown: rendered.markdown,
      indication: params.indication,
      findings: params.findings,
    });

    return {
      reportText,
    };
  }
}
