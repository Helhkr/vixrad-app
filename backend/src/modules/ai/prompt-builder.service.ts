import { Injectable } from "@nestjs/common";

import type { ExamType } from "../templates/templates.service";

@Injectable()
export class PromptBuilderService {
  buildPrompt(params: {
    examType: ExamType;
    templateId: string;
    templateBaseReport: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT";
    contrast?: "with" | "without";
    findings: string;
  }): string {
    const lines: string[] = [];

    lines.push(
      "Você é um assistente médico que redige laudos estruturados em português (pt-BR).",
      "O médico é a fonte primária de verdade. Não invente achados nem conclusões.",
      "Use SOMENTE os achados fornecidos para redigir e organizar o texto.",
      "Não inclua dados identificáveis de paciente.",
      "",
      `Modalidade: ${params.examType}`,
      `TemplateId: ${params.templateId}`,
    );

    const indication = params.indication?.trim();
    if (indication) {
      lines.push("", "Indicação clínica:", indication);
    }

    const meta: string[] = [];
    if (params.contrast) meta.push(`contraste=${params.contrast}`);
    if (params.sex) meta.push(`sexo=${params.sex}`);
    if (params.side) meta.push(`lado=${params.side}`);
    if (meta.length > 0) {
      lines.push("", `Metadados: ${meta.join(", ")}`);
    }

    lines.push(
      "",
      "Template base (normal):",
      params.templateBaseReport.trimEnd(),
      "",
      "Achados do médico:",
      params.findings.trim(),
      "",
      "Tarefa:",
      "- Redigir o laudo final estruturado, mantendo o estilo do template base.",
      "- Incorporar os achados do médico na seção apropriada.",
      "- Não adicionar informações não fornecidas.",
    );

    return lines.join("\n").trim() + "\n";
  }
}
