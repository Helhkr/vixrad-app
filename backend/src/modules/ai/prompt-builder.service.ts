import { Injectable } from "@nestjs/common";

import type { ExamType } from "../templates/templates.service";

@Injectable()
export class PromptBuilderService {
  private getGlobalRules(): string {
    return [
      "Você é um assistente especializado em redação técnica de laudos médicos.",
      "Sua função é exclusivamente redigir, organizar e padronizar textos médicos",
      "com base nas informações fornecidas pelo médico.",
      "",
      "REGRAS OBRIGATÓRIAS:",
      "- NÃO inclua dados de identificação do paciente.",
      "- NÃO inclua nome do paciente, data, número de prontuário ou nome do médico.",
      "- NÃO invente achados, medidas ou conclusões, a não ser que explicitamente solicitado.",
      "- NÃO introduza diagnósticos que não estejam explicitamente mencionados, a não ser que solicitado explicitamente.",
      "- NÃO faça recomendações clínicas ou terapêuticas, a não ser que explicitamente solicitado.",
      "- NÃO utilize linguagem coloquial.",
      "- Utilize linguagem técnica médica formal.",
      "- Caso uma informação não tenha sido fornecida, NÃO a presuma, a não ser que explicitamente solicitado.",
    ].join("\n");
  }

  private getModalityContext(examType: ExamType): string {
    switch (examType) {
      case "CT":
        return [
          "MODALIDADE: Tomografia Computadorizada",
          "Utilize estrutura típica de laudo tomográfico.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia radiológica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "XR":
        return [
          "MODALIDADE: Radiografia",
          "Utilize estrutura típica de laudo radiográfico.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia radiológica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "US":
        return [
          "MODALIDADE: Ultrassonografia",
          "Utilize estrutura típica de laudo ultrassonográfico.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia radiológica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "MR":
        return [
          "MODALIDADE: Ressonância Magnética",
          "Utilize estrutura típica de laudo de ressonância magnética.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia radiológica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "MG":
        return [
          "MODALIDADE: Mamografia",
          "Utilize estrutura típica de laudo mamográfico.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia radiológica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "DXA":
        return [
          "MODALIDADE: Densitometria Óssea",
          "Utilize estrutura típica de laudo densitométrico.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia técnica padronizada.",
          "Evite especulações.",
        ].join("\n");
      case "NM":
        return [
          "MODALIDADE: Medicina Nuclear",
          "Utilize estrutura típica de laudo de medicina nuclear.",
          "Priorize descrição objetiva dos achados.",
          "Utilize terminologia técnica padronizada.",
          "Evite especulações.",
        ].join("\n");
    }
  }

  private getOutputInstructions(): string {
    return [
      "INSTRUÇÕES DE SAÍDA:",
      "- Gere apenas o texto final do laudo.",
      "- Organize o texto de forma clara e técnica.",
      "- Não inclua títulos extras, comentários ou explicações.",
      "- Não repita instruções ou regras.",
    ].join("\n");
  }

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
    const globalRules = this.getGlobalRules();
    const modalityContext = this.getModalityContext(params.examType);
    const templateBase = `TEMPLATE BASE:\n${params.templateBaseReport.trimEnd()}`;

    const indication = params.indication?.trim();
    const indicationBlock = indication ? `INDICAÇÃO CLÍNICA:\n${indication}` : "";

    const findings = params.findings?.trim();
    const findingsBlock = findings
      ? `ACHADOS DO EXAME (fornecidos pelo médico):\n${findings}`
      : "";

    const outputInstructions = this.getOutputInstructions();

    return [globalRules, modalityContext, templateBase, indicationBlock, findingsBlock, outputInstructions]
      .filter(Boolean)
      .join("\n\n")
      .trim()
      .concat("\n");
  }
}
