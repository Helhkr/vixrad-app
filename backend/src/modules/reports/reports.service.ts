import { BadRequestException, Injectable } from "@nestjs/common";

import { AiService } from "../ai/ai.service";
import { AiPolicyService } from "../ai/ai-policy.service";
import { PromptBuilderService } from "../ai/prompt-builder.service";
import { FileExtractionService } from "../ai/file-extraction.service";
import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly aiService: AiService,
    private readonly aiPolicyService: AiPolicyService,
    private readonly fileExtractionService: FileExtractionService,
  ) {}

  private sanitizeAiReport(
    text: string,
    opts: {
      hasFindings: boolean;
      templateBaseReport?: string;
    },
  ): string {
    let out = (text ?? "").replace(/\r\n/g, "\n");

    const extractTemplateTitle = (src?: string): string | null => {
      const s = (src ?? "").replace(/\r\n/g, "\n");
      const m = s.match(/^\s*#\s+.+$/m);
      return m ? m[0].trim() : null;
    };

    const ensureTitleAtTop = (src: string, title: string | null): string => {
      if (!title) return src;
      const trimmedStart = src.replace(/^\s+/, "");
      const firstNonEmptyLine = (trimmedStart.match(/^\s*[^\n]+/m)?.[0] ?? "").trim();
      const hasTitleAlready = /^#\s+/.test(firstNonEmptyLine);
      if (hasTitleAlready) return src;
      return `${title}\n${src.trimStart()}`;
    };

    const normalizeSectionLabels = (src: string): string => {
      let s = src;

      // Normalize label spellings and remove accidental bold markers around labels
      // Technique/Indication should be inline: **Label:** text
      const inlineLabels: Array<{ re: RegExp; replacement: string }> = [
        { re: /^\s*(?:\*\*)?\s*T[eé]cnica\s*:\s*(?:\*\*)?\s*$/gim, replacement: "**Técnica:**" },
        { re: /^\s*(?:\*\*)?\s*Indica[cç][aã]o\s*:\s*(?:\*\*)?\s*$/gim, replacement: "**Indicação:**" },
        { re: /^\s*(?:\*\*)?\s*Notas\s*:\s*(?:\*\*)?\s*$/gim, replacement: "**Notas:**" },
      ];

      for (const { re, replacement } of inlineLabels) {
        // If label is alone on a line and the next line has content, join them.
        s = s.replace(new RegExp(`${re.source}\\n+([^\\n].*)`, re.flags), (_m, nextLine: string) => {
          return `${replacement} ${nextLine.trim()}`;
        });
        // If label already has text on same line, just normalize bolding.
        s = s.replace(
          new RegExp(`^\\s*(?:\\*\\*)?\\s*(${replacement.replace(/\*\*/g, "").replace(/\s+/g, "\\s+")})\\s*:\\s*(?:\\*\\*)?\\s*(.+)$`, "gim"),
          (_m, _label: string, rest: string) => `${replacement} ${rest.trim()}`,
        );
      }

      // Analysis/Impression should be block-style:
      // **Análise:**\n\ntext
      // **Impressão diagnóstica:**\ntext (but we keep a blank line too for readability)
      s = s.replace(/^\s*(?:\*\*)?\s*An[aá]lise\s*:\s*(?:\*\*)?\s*$/gim, "**Análise:**");
      s = s.replace(/^\s*(?:\*\*)?\s*Impress[aã]o\s+diagn[oó]stica\s*:\s*(?:\*\*)?\s*$/gim, "**Impressão diagnóstica:**");

      // Ensure spacing after block labels
      s = s.replace(/^(\*\*Análise:\*\*)\s*\n(?!\n)/gim, "$1\n\n");
      s = s.replace(/^(\*\*Impressão diagnóstica:\*\*)\s*\n(?!\n)/gim, "$1\n");

      return s;
    };

    out = ensureTitleAtTop(out, extractTemplateTitle(opts.templateBaseReport));
    out = normalizeSectionLabels(out);

    // Ensure one blank line before section labels 'Análise:' and 'Impressão diagnóstica:'
    const ensureBlankBefore = (labelRe: RegExp) => {
      out = out.replace(new RegExp(`([^\n])\n(${labelRe.source})`, labelRe.flags), (_m, prev: string, label: string) => {
        return `${prev}\n\n${label}`;
      });

      // Also handle cases where the model places the label mid-line with lots of spaces.
      out = out.replace(new RegExp(`([^\n])\s+(${labelRe.source})`, labelRe.flags), (_m, prev: string, label: string) => {
        return `${prev}\n\n${label}`;
      });
    };

    // Match bolded or plain labels, with optional surrounding asterisks
    const tecnicaLabel = /\s*(?:\*\*)?\s*Técnica:\s*(?:\*\*)?/;
    const indicacaoLabel = /\s*(?:\*\*)?\s*Indicação:\s*(?:\*\*)?/;
    const notasLabel = /\s*(?:\*\*)?\s*Notas:\s*(?:\*\*)?/;
    const analiseLabel = /\s*(?:\*\*)?\s*Análise:\s*(?:\*\*)?/;
    const impLabel = /\s*(?:\*\*)?\s*Impressão diagnóstica:\s*(?:\*\*)?/;

    ensureBlankBefore(tecnicaLabel);
    ensureBlankBefore(indicacaoLabel);
    ensureBlankBefore(notasLabel);
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
    userId?: string;
    examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
    templateId: string;
    type?: "convencional" | "digital" | "3d";
    indication?: string;
    sex?: "M" | "F";
    side?: "RIGHT" | "LEFT" | "BILATERAL";
    contrast?: "with" | "without";
    incidence?: string;
    decubitus?: "ventral" | "dorsal" | "lateral";
    notes?: string;
    academic?: boolean;
    findings?: string | null;
    indicationFile?: Express.Multer.File;
    ecgGating?: "omit" | "without" | "with";
    phases?: "omit" | "without" | "with";
    coil?: "omit" | "1.5T" | "3.0T";
    sedation?: "omit" | "without" | "with";
    artifactSourceEnabled?: boolean;
    artifactSourceTypes?: Array<
      | "Movimento"
      | "Beam hardening"
      | "Susceptibilidade magnética"
      | "Aliasing"
      | "Deslocamento químico"
      | "Volume parcial"
      | "Ghosting"
      | "Truncamento"
      | "Zipper"
      | "Ruído"
      | "Interferência de radiofrequência"
      | "Crosstalk"
    >;
  }) {
    const aiCalls: Array<{
      purpose: "indication_from_file" | "report_generation";
      model: string;
      usage: {
        promptTokens: number | null;
        outputTokens: number | null;
        totalTokens: number | null;
        source: "usageMetadata" | "countTokens" | "none";
      };
    }> = [];

    let indication = params.indication;

    // Se houver arquivo, enviar para a IA para gerar indicação diretamente do documento
    if (params.indicationFile) {
      let usageId: string | null = null;
      try {
        const route = await this.aiPolicyService.beginAiCall({
          userId: params.userId ?? "unknown",
          purpose: "INDICATION_FROM_FILE",
        });
        usageId = route.usageId;

        const ind = await this.aiService.generateIndicationFromFile(params.indicationFile, {
          modelCandidates: route.modelCandidates,
        });

        await this.aiPolicyService.markSuccess({
          usageId,
          usedModel: ind.usedModel,
          usage: ind.usage,
        });

        indication = ind.text;
        aiCalls.push({
          purpose: "indication_from_file",
          model: ind.usedModel,
          usage: ind.usage,
        });
      } catch (err: any) {
        try {
          await this.aiPolicyService.markFailure({ usageId, error: err });
        } catch {}
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
      type: params.type,
      indication,
      sex: params.sex,
      side: params.side,
      contrast: (() => {
        const tpl = this.templatesService.getTemplateDetail(params.templateId, params.examType);
        return tpl.requires.contrast === "fixed" ? "with" : params.contrast;
      })(),
      incidence: params.incidence,
      decubitus: params.decubitus,
      notes: params.notes,
      ecgGating: params.ecgGating,
      phases: params.phases,
      coil: params.coil,
      sedation: params.sedation,
      artifactSourceEnabled: params.artifactSourceEnabled,
      artifactSourceTypes: params.artifactSourceTypes,
    } as const;

    const findings = typeof params.findings === "string" ? params.findings.trim() : "";

    if (!findings || findings.length === 0) {
      return {
        reportText: this.templatesService.renderNormalReport(baseInput),
        aiCalls: aiCalls.length > 0 ? aiCalls : undefined,
      };
    }

    if (!params.userId) {
      throw new BadRequestException("Usuário inválido para chamada de IA");
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
      academic: params.academic,
      findings,
    });

    const route = await this.aiPolicyService.beginAiCall({
      userId: params.userId,
      purpose: "REPORT_GENERATION",
    });

    let reportText = "";

    try {
      const gen = await this.aiService.generateReport({
        prompt,
        baseInput,
        findings,
        modelCandidates: route.modelCandidates,
      });

      await this.aiPolicyService.markSuccess({
        usageId: route.usageId,
        usedModel: gen.usedModel,
        usage: gen.usage,
      });
      aiCalls.push({
        purpose: "report_generation",
        model: gen.usedModel,
        usage: gen.usage,
      });

      reportText = gen.text;
    } catch (err: any) {
      try {
        await this.aiPolicyService.markFailure({ usageId: route.usageId, error: err });
      } catch {}
      throw err;
    }

    // Normalize spacing and remove redundant impression sentences when findings exist
    reportText = this.sanitizeAiReport(reportText, {
      hasFindings: findings.length > 0,
      templateBaseReport,
    });

    return { reportText, aiCalls };
  }
}
