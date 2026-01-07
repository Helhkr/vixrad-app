import { BadRequestException, Injectable } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { load as yamlLoad } from "js-yaml";

export type ExamType = "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
export type RequireState = "required" | "optional" | "none" | "fixed";

export type TemplateRequires = {
  indication: RequireState;
  sex: RequireState;
  contrast: RequireState;
  side: RequireState;
  incidence: RequireState;
  decubitus: RequireState;
};

export type TemplateMeta = {
  exam_type: ExamType;
  requires: TemplateRequires;
};

export type TemplateListItem = {
  id: string;
  name: string;
  examType: ExamType;
};

export type TemplateDetail = {
  id: string;
  name: string;
  examType: ExamType;
  requires: TemplateRequires;
};

export type RenderInput = {
  examType: ExamType;
  templateId: string;
  indication?: string;
  sex?: "M" | "F";
  side?: "RIGHT" | "LEFT";
  contrast?: "with" | "without";
  notes?: string;
  incidence?: string;
  decubitus?: "ventral" | "dorsal" | "lateral";
};

type IfNode = {
  type: "if";
  condition: string;
  thenNodes: AstNode[];
  elseNodes: AstNode[];
};

type TextNode = {
  type: "text";
  value: string;
};

type AstNode = IfNode | TextNode;

const SUPPORTED_EXAM_TYPES: ExamType[] = ["CT", "XR", "US", "MR", "MG", "DXA", "NM"];
const SUPPORTED_REQUIRE_STATES: RequireState[] = ["required", "optional", "none", "fixed"];
const SUPPORTED_CONDITIONS = new Set([
  "INDICACAO",
  "CONTRASTE",
  "SEXO_MASCULINO",
  "SEXO_FEMININO",
  "NOTAS",
  "INCIDENCIA",
  "DECUBITUS",
]);

const IF_TOKEN_RE = /<!--\s*(IF\s+[A-Z0-9_]+|ELSE|ENDIF\s+[A-Z0-9_]+)\s*-->/g;
const IF_RE = /^<!--\s*IF\s+([A-Z0-9_]+)\s*-->$/;
const ELSE_RE = /^<!--\s*ELSE\s*-->$/;
const ENDIF_RE = /^<!--\s*ENDIF\s+([A-Z0-9_]+)\s*-->$/;

@Injectable()
export class TemplatesService {
  private stripDiacritics(input: string): string {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  private sanitizeTemplateName(name: string): string {
    return name.replace(/\{\{.*?\}\}/g, "").replace(/\s+/g, " ").trim();
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

  private resolveTemplatesDir(examType: ExamType): string | null {
    const folder = `docs/clinical/${examType.toLowerCase()}`;
    const candidates = [
      path.resolve(process.cwd(), folder),
      path.resolve(process.cwd(), "../", folder),
      path.resolve(process.cwd(), "../../", folder),
    ];

    const found = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());
    return found ?? null;
  }

  private getTemplatePath(templateId: string, examType: ExamType): string {
    const safeId = templateId.replace(/[^a-zA-Z0-9._-]/g, "");
    if (safeId !== templateId) {
      throw new BadRequestException("templateId inválido");
    }

    const dir = this.resolveTemplatesDir(examType);
    if (!dir) {
      throw new BadRequestException("templateId inválido");
    }
    return path.join(dir, `${templateId}.md`);
  }

  private assertTemplateIdIsSafe(templateId: string): void {
    const safeId = templateId.replace(/[^a-zA-Z0-9._-]/g, "");
    if (safeId !== templateId) {
      throw new BadRequestException("templateId inválido");
    }
  }

  private resolveExamTypeForTemplateId(templateId: string): ExamType {
    this.assertTemplateIdIsSafe(templateId);

    for (const examType of SUPPORTED_EXAM_TYPES) {
      const dir = this.resolveTemplatesDir(examType);
      if (!dir) continue;

      const candidate = path.join(dir, `${templateId}.md`);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return examType;
      }
    }

    throw new BadRequestException("templateId inválido");
  }

  loadTemplateSource(templateId: string, examType: ExamType): string {
    const filePath = this.getTemplatePath(templateId, examType);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException("templateId inválido");
    }
    const source = fs.readFileSync(filePath, "utf-8");
    if (source.trim().length === 0) {
      throw new BadRequestException("Template vazio");
    }
    return source;
  }

  parseFrontMatter(source: string): { meta: TemplateMeta; body: string } {
    if (!source.startsWith("---")) {
      throw new BadRequestException("Template sem YAML front matter no topo");
    }

    const lines = source.split(/\r?\n/);
    if (lines[0].trim() !== "---") {
      throw new BadRequestException("YAML front matter inválido: delimitador inicial ausente");
    }

    const endIndex = lines.findIndex((l, idx) => idx > 0 && l.trim() === "---");
    if (endIndex === -1) {
      throw new BadRequestException("YAML front matter inválido: delimitador final ausente");
    }

    const yamlText = lines.slice(1, endIndex).join("\n");
    const body = lines.slice(endIndex + 1).join("\n");

    let parsed: unknown;
    try {
      parsed = yamlLoad(yamlText);
    } catch {
      throw new BadRequestException("YAML front matter inválido");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new BadRequestException("YAML front matter inválido");
    }

    const meta = parsed as Partial<TemplateMeta>;

    if (!meta.exam_type || !SUPPORTED_EXAM_TYPES.includes(meta.exam_type as ExamType)) {
      throw new BadRequestException("YAML: exam_type inválido");
    }

    if (!meta.requires || typeof meta.requires !== "object") {
      throw new BadRequestException("YAML: requires inválido");
    }

    const requires = meta.requires as Partial<TemplateRequires>;

    // Validar que campos presentes têm valores válidos, usar "none" como padrão para campos faltantes
    const fullRequires: TemplateRequires = {
      indication: requires.indication ?? "none",
      sex: requires.sex ?? "none",
      contrast: requires.contrast ?? "none",
      side: requires.side ?? "none",
      incidence: requires.incidence ?? "none",
      decubitus: requires.decubitus ?? "none",
    };

    for (const [key, value] of Object.entries(fullRequires)) {
      if (!SUPPORTED_REQUIRE_STATES.includes(value as RequireState)) {
        throw new BadRequestException(`YAML: requires.${key} inválido`);
      }
    }

    return {
      meta: {
        exam_type: meta.exam_type as ExamType,
        requires: fullRequires,
      },
      body,
    };
  }

  resolveRequires(meta: TemplateMeta): TemplateRequires {
    return meta.requires;
  }

  private assertInputMeetsRequires(meta: TemplateMeta, input: RenderInput): void {
    const req = meta.requires;

    if (req.indication === "required" && !input.indication) {
      throw new BadRequestException("requires.indication: obrigatório");
    }

    if (req.sex === "required" && !input.sex) {
      throw new BadRequestException("requires.sex: obrigatório");
    }

    if (req.side === "required" && !input.side) {
      throw new BadRequestException("requires.side: obrigatório");
    }

    if (req.contrast === "required" && !input.contrast) {
      throw new BadRequestException("requires.contrast: obrigatório");
    }

    if (req.incidence === "required" && !input.incidence) {
      throw new BadRequestException("requires.incidence: obrigatório");
    }

    if (req.decubitus === "required" && !input.decubitus) {
      throw new BadRequestException("requires.decubitus: obrigatório");
    }
  }

  private parseConditionalsToAst(markdown: string): AstNode[] {
    const nodes: AstNode[] = [];
    let current = nodes;

    const stack: Array<{ condition: string; node: IfNode; parent: AstNode[] }> = [];

    let lastIndex = 0;
    for (const match of markdown.matchAll(IF_TOKEN_RE)) {
      const token = match[0];
      const start = match.index ?? 0;

      if (start > lastIndex) {
        current.push({ type: "text", value: markdown.slice(lastIndex, start) });
      }

      const ifMatch = token.match(IF_RE);
      if (ifMatch) {
        const condition = ifMatch[1];
        if (!SUPPORTED_CONDITIONS.has(condition)) {
          throw new BadRequestException(`Condição IF não suportada: ${condition}`);
        }

        const node: IfNode = { type: "if", condition, thenNodes: [], elseNodes: [] };
        current.push(node);
        stack.push({ condition, node, parent: current });
        current = node.thenNodes;
        lastIndex = start + token.length;
        continue;
      }

      if (token.match(ELSE_RE)) {
        const top = stack[stack.length - 1];
        if (!top) {
          throw new BadRequestException("ELSE sem IF correspondente");
        }
        current = top.node.elseNodes;
        lastIndex = start + token.length;
        continue;
      }

      const endMatch = token.match(ENDIF_RE);
      if (endMatch) {
        const condition = endMatch[1];
        const top = stack.pop();
        if (!top) {
          throw new BadRequestException(`ENDIF ${condition} sem IF correspondente`);
        }
        if (top.condition !== condition) {
          throw new BadRequestException(`ENDIF ${condition} não corresponde ao IF ${top.condition}`);
        }
        current = top.parent;
        lastIndex = start + token.length;
        continue;
      }
    }

    if (lastIndex < markdown.length) {
      current.push({ type: "text", value: markdown.slice(lastIndex) });
    }

    if (stack.length > 0) {
      throw new BadRequestException("Bloco IF sem ENDIF");
    }

    return nodes;
  }

  private evalAst(nodes: AstNode[], flags: Record<string, boolean>): string {
    let out = "";
    for (const node of nodes) {
      if (node.type === "text") {
        out += node.value;
        continue;
      }

      const branch = flags[node.condition] ? node.thenNodes : node.elseNodes;
      out += this.evalAst(branch, flags);
    }
    return out;
  }

  private resolvePlaceholders(markdown: string, values: Record<string, string | undefined>): string {
    return markdown.replace(/\{\{([A-Z0-9_]+)\}\}/g, (full, key: string) => {
      const value = values[key];
      if (value === undefined) {
        throw new BadRequestException(`Placeholder sem valor: {{${key}}}`);
      }
      return value;
    });
  }

  private enforceBoldSectionLabels(markdown: string): string {
    const rules: Array<{ re: RegExp; replacement: string }> = [
      { re: /^\s*(?:\*\*)?\s*Técnica:\s*(?:\*\*)?/gmi, replacement: "**Técnica:** " },
      { re: /^\s*(?:\*\*)?\s*Análise:\s*(?:\*\*)?/gmi, replacement: "**Análise:** " },
      { re: /^\s*(?:\*\*)?\s*Impressão diagnóstica:\s*(?:\*\*)?/gmi, replacement: "**Impressão diagnóstica:** " },
      { re: /^\s*(?:\*\*)?\s*Notas:\s*(?:\*\*)?/gmi, replacement: "**Notas:** " },
    ];
    let out = markdown;
    for (const { re, replacement } of rules) {
      out = out.replace(re, replacement);
    }
    return out;
  }

  private extractTitle(bodyMarkdown: string): string | null {
    for (const line of bodyMarkdown.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return trimmed.replace(/^#\s+/, "").trim() || null;
      }
    }
    return null;
  }

  listTemplates(examType: ExamType): TemplateListItem[] {
    console.log(`[listTemplates] examType=${examType}`);
    if (!SUPPORTED_EXAM_TYPES.includes(examType)) {
      throw new BadRequestException("examType inválido");
    }

    const dir = this.resolveTemplatesDir(examType);
    console.log(`[listTemplates] dir=${dir}`);
    if (!dir) return [];
    const entries = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .sort((a, b) => a.localeCompare(b));

    console.log(`[listTemplates] found ${entries.length} .md files`);

    const out: TemplateListItem[] = [];
    for (const fileName of entries) {
      const templateId = fileName.replace(/\.md$/, "");
      console.log(`[listTemplates] processing ${templateId}...`);
      try {
        const source = this.loadTemplateSource(templateId, examType);
        console.log(`[listTemplates] loaded source for ${templateId}, parsing...`);
        const parsed = this.parseFrontMatter(source);

        if (parsed.meta.exam_type !== examType) {
          console.warn(`[listTemplates] Template ${templateId} exam_type mismatch: ${parsed.meta.exam_type} !== ${examType}`);
          continue;
        }

        const title = this.extractTitle(parsed.body);

        const name = this.sanitizeTemplateName(title ?? templateId);

        out.push({
          id: templateId,
          name,
          examType: parsed.meta.exam_type,
        });
        console.log(`[listTemplates] added ${templateId}`);
      } catch (err: any) {
        console.error(`[listTemplates] Error loading template ${templateId}:`, err.message);
        continue;
      }
    }

    console.log(`[listTemplates] returning ${out.length} templates`);
    return out;
  }

  getTemplateDetail(templateId: string, examType?: ExamType): TemplateDetail {
    const resolvedExamType = examType ?? this.resolveExamTypeForTemplateId(templateId);

    const source = this.loadTemplateSource(templateId, resolvedExamType);
    const parsed = this.parseFrontMatter(source);

    const title = this.extractTitle(parsed.body);
    const name = this.sanitizeTemplateName(title ?? templateId);

    return {
      id: templateId,
      name,
      examType: parsed.meta.exam_type,
      requires: parsed.meta.requires,
    };
  }

  renderResolvedMarkdown(input: RenderInput): { meta: TemplateMeta; markdown: string } {
    const source = this.loadTemplateSource(input.templateId, input.examType);
    const parsed = this.parseFrontMatter(source);

    if (parsed.meta.exam_type !== input.examType) {
      throw new BadRequestException("templateId incompatível com examType");
    }

    this.assertInputMeetsRequires(parsed.meta, input);

    const flags: Record<string, boolean> = {
      INDICACAO: Boolean(input.indication),
      NOTAS: Boolean(input.notes),
      SEXO_FEMININO: input.sex === "F",
      SEXO_MASCULINO: input.sex === "M",
      CONTRASTE:
        parsed.meta.requires.contrast === "fixed"
          ? true
          : input.contrast === "with"
            ? true
            : false,
      INCIDENCIA: Boolean(input.incidence),
      DECUBITUS: Boolean(input.decubitus),
    };

    const ast = this.parseConditionalsToAst(parsed.body);
    const withoutConditionals = this.evalAst(ast, flags);

    const incidenciaMap: Record<string, string> = {
      "PA e Perfil": "Radiografia em incidências posteroanterior (PA) e perfil",
      "AP": "Radiografia em incidência anteroposterior (AP)",
      "PA": "Radiografia em incidência posteroanterior (PA)",
      "Perfil": "Radiografia em incidência de perfil",
      "Obliqua": "Radiografia em incidência oblíqua",
      "Ortostática": "Radiografia em incidência ortostática",
    };

    const values: Record<string, string | undefined> = {
      INDICACAO: input.indication,
      NOTAS: input.notes,
      SEXO: input.sex === "F" ? "FEMININO" : input.sex === "M" ? "MASCULINO" : undefined,
      LADO: input.side === "RIGHT" ? "DIREITO" : input.side === "LEFT" ? "ESQUERDO" : undefined,
      INCIDENCIA: input.incidence ? incidenciaMap[input.incidence] || input.incidence : undefined,
      DECUBITUS: input.decubitus ? (input.decubitus === "ventral" ? "ventral" : input.decubitus === "dorsal" ? "dorsal" : "lateral") : undefined,
      DECUBITUS_UPPER: input.decubitus ? (input.decubitus === "ventral" ? "VENTRAL" : input.decubitus === "dorsal" ? "DORSAL" : "LATERAL") : undefined,
    };

    const resolved = this.resolvePlaceholders(withoutConditionals, values);
    const formatted = this.enforceBoldSectionLabels(resolved);
    return { meta: parsed.meta, markdown: formatted.trim() + "\n" };
  }

  renderNormalReport(input: RenderInput): string {
    const rendered = this.renderResolvedMarkdown(input);
    return this.composeOutput({ templateMarkdown: rendered.markdown, indication: input.indication });
  }

  renderFullReport(input: RenderInput & { findings: string }): string {
    const rendered = this.renderResolvedMarkdown(input);
    return this.composeOutput({
      templateMarkdown: rendered.markdown,
      indication: input.indication,
      findings: input.findings,
    });
  }
}
