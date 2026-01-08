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
      "- Caso hajam alterações no exame, descreva-as alterações mais importantes primeiro na análise e em impressão diagnóstica",
      "- Caso haja mais de uma impressão diagnóstica, coloque cada uma delas em uma linha própria e não utilize bullets ou numerações.",
      "- Formatação das seções: cada rótulo ('Técnica:', 'Indicação:' quando houver, 'Análise:', 'Impressão diagnóstica:') deve ficar sozinho em sua linha, seguido do conteúdo nas linhas subsequentes.",
      "- Separe as seções com exatamente uma linha em branco: uma linha em branco entre 'Indicação:' e 'Análise:', e entre o final da análise e 'Impressão diagnóstica:'.",
      "- Se houver ACHADOS fornecidos (texto de achados), NÃO inclua frases genéricas como 'demais achados dentro dos limites da normalidade' na impressão diagnóstica. Resuma apenas os achados relevantes."
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
          "Descreva ossos, articulações e partes moles de forma objetiva.",
          "Use terminologia radiológica padronizada.",
          "Evite inferências diagnósticas não solicitadas.",
        ].join("\n");
      case "US":
        return [
          "MODALIDADE: Ultrassonografia",
          "Utilize estrutura típica de laudo ultrassonográfico.",
          "Descreva órgãos e estruturas com base em ecogenicidade, contornos e dimensões.",
          "Use terminologia ecográfica padronizada.",
          "Evite especulações clínicas.",
        ].join("\n");
      case "MR":
        return [
          "MODALIDADE: Ressonância Magnética",
          "Utilize estrutura típica de laudo de RM.",
          "Descreva sequências, planos e achados com clareza técnica.",
          "Use terminologia radiológica padronizada.",
          "Evite conclusões não solicitadas.",
        ].join("\n");
      case "MG":
        return [
          "MODALIDADE: Mamografia",
          "Utilize estrutura típica de laudo mamográfico.",
          "Descreva densidade, achados suspeitos e calcificações.",
          "Use terminologia BI-RADS quando aplicável.",
          "Evite recomendações clínicas não solicitadas.",
        ].join("\n");
      case "DXA":
        return [
          "MODALIDADE: Densitometria Óssea",
          "Utilize estrutura típica de laudo densitométrico.",
          "Descreva valores de densidade mineral óssea e comparações com padrões.",
          "Use terminologia técnica padronizada.",
          "Evite interpretações clínicas não solicitadas.",
        ].join("\n");
      case "NM":
        return [
          "MODALIDADE: Medicina Nuclear",
          "Utilize estrutura típica de laudo cintilográfico ou PET.",
          "Descreva captação, distribuição e intensidade dos radiotraçadores.",
          "Use terminologia nuclear padronizada.",
          "Evite inferências terapêuticas não solicitadas.",
        ].join("\n");
      default:
        return [
          "MODALIDADE: Exame de imagem",
          "Utilize estrutura típica de laudo médico técnico.",
          "Descreva achados de forma objetiva e padronizada.",
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
      "- Mantenha os rótulos das seções exatamente como no TEMPLATE BASE (sem criar novos).",
      "- Use quebras de linha conforme instruído nas REGRAS OBRIGATÓRIAS (uma linha em branco entre seções).",
      "- Na 'Impressão diagnóstica:', liste cada item em uma linha, sem bullets e sem frases de normalidade genérica quando há achados.",
    ].join("\n");
  }

  private getAcademicModeInstructions(): string {
    return [
      "MODO UNIVERSITÁRIO (quando ativado):",
      "- Você tem liberdade para propor hipóteses diagnósticas quando houver base nos achados descritos, indicando o grau de confiança (ex.: provável/possível) e citando os sinais de imagem que sustentam a hipótese.",
      "- Quando houver mais de uma hipótese plausível, você pode citar diagnósticos diferenciais relevantes de forma breve e técnica.",
      "- Priorize descrições extensas e detalhadas, com linguagem técnica completa (evite concisão excessiva).",
      "- Mesmo em exames normais, descreva de forma completa e sistemática a ausência de alterações relevantes (sem usar frases genéricas vagas).",
      "- Não invente medidas, sequências, realces, territórios vasculares ou outros detalhes não informados; se não houver base, declare a limitação/indeterminação.",
    ].join("\n");
  }

  buildPrompt(params: {
    examType: ExamType;
    templateId: string;
    templateBaseReport: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT" | "BILATERAL";
    contrast?: "with" | "without";
    academic?: boolean;
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

    const academicInstructions = params.academic ? this.getAcademicModeInstructions() : "";

    return [globalRules, modalityContext, templateBase, indicationBlock, findingsBlock, academicInstructions, outputInstructions]
      .filter(Boolean)
      .join("\n\n")
      .trim()
      .concat("\n");
  }
}
