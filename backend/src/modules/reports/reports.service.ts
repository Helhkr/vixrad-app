import { BadRequestException, Injectable } from "@nestjs/common";

import { AiService } from "../ai/ai.service";
import { PromptBuilderService } from "../ai/prompt-builder.service";
import { FileExtractionService } from "../ai/file-extraction.service";
import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly aiService: AiService,
    private readonly fileExtractionService: FileExtractionService,
  ) {}

  private sanitizeAiReport(text: string, opts: { hasFindings: boolean }): string {
    let out = (text ?? "").replace(/\r\n/g, "\n");

    // Ensure one blank line before section labels 'Análise:' and 'Impressão diagnóstica:'
    const ensureBlankBefore = (labelRe: RegExp) => {
      out = out.replace(new RegExp(`([^\n])\n(${labelRe.source})`, labelRe.flags), (_m, prev: string, label: string) => {
        return `${prev}\n\n${label}`;
      });
    };

    // Match bolded or plain labels, with optional surrounding asterisks
    const analiseLabel = /\s*(?:\*\*)?\s*Análise:\s*(?:\*\*)?/;
    const impLabel = /\s*(?:\*\*)?\s*Impressão diagnóstica:\s*(?:\*\*)?/;
    ensureBlankBefore(analiseLabel);
    ensureBlankBefore(impLabel);

    // If there are findings, remove generic normality filler sentences in Impression
    if (opts.hasFindings) {
      const patterns = [
        /\n?\s*Exame\s+(?:tomogr[aá]fico\s+)?com\s+os\s+demais\s+achados\s+dentro\s+dos\s+limites\s+da\s+normalidade\.?\s*$/gim,
        /\n?\s*Demais\s+achados\s+dentro\s+dos\s+limites\s+da\s+normalidade\.?\s*$/gim,
      ];
      for (const re of patterns) {
        out = out.replace(re, "\n");
      }
      // Clean up excessive blank lines (max two in a row)
      out = out.replace(/\n{3,}/g, "\n\n");
    }

    // Trim trailing spaces per line
    out = out
      .split("\n")
      .map((l) => l.replace(/\s+$/g, ""))
      .join("\n")
      .trimEnd();

    // Ensure final newline
    if (!out.endsWith("\n")) out += "\n";
    return out;
  }

  async generateStructuredBaseReport(params: {
    examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
    templateId: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT" | "BILATERAL";
    contrast?: "with" | "without";
    incidence?: string;
    decubitus?: "ventral" | "dorsal" | "lateral";
    notes?: string;
    findings?: string | null;
    indicationFile?: Express.Multer.File;
  }) {
    let indication = params.indication;

    // Se houver arquivo, enviar para a IA para gerar indicação diretamente do documento
    if (params.indicationFile) {
      try {
        indication = await this.aiService.generateIndicationFromFile(params.indicationFile);
      } catch (err: any) {
        // Preserve upstream HTTP errors (e.g., 429 rate limit) and map unknowns to 400
        if (err && typeof err === "object" && (err.name === "HttpException" || err.status)) {
          throw err;
        }
        const msg = err?.message || "Falha ao processar arquivo de indicação";
        throw new BadRequestException(msg);
      }
    }

    const baseInput = {
      examType: params.examType,
      templateId: params.templateId,
      indication,
      sex: params.sex,
      side: params.side,
      contrast: params.contrast,
      incidence: params.incidence,
      decubitus: params.decubitus,
      notes: params.notes,
    } as const;

    const findings = typeof params.findings === "string" ? params.findings.trim() : "";

    if (!findings || findings.length === 0) {
      return {
        reportText: this.templatesService.renderNormalReport(baseInput),
      };
    }

    const templateBaseReport = this.templatesService.renderNormalReport(baseInput);
    const prompt = this.promptBuilderService.buildPrompt({
      examType: params.examType,
      templateId: params.templateId,
      templateBaseReport,
      indication,
      sex: params.sex,
      side: params.side,
      contrast: params.contrast,
      findings,
    });

    let reportText = await this.aiService.generateReport({
      prompt,
      baseInput,
      findings,
    });

    // Normalize spacing and remove redundant impression sentences when findings exist
    reportText = this.sanitizeAiReport(reportText, { hasFindings: findings.length > 0 });

    return { reportText };
  }
}
