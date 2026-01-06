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

  async generateStructuredBaseReport(params: {
    examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
    templateId: string;
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT";
    contrast?: "with" | "without";
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

    const reportText = await this.aiService.generateReport({
      prompt,
      baseInput,
      findings,
    });

    return {
      reportText,
    };
  }
}
