import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { load as yamlLoad } from "js-yaml";

export type ExamType = "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM";
export type RequireState = "required" | "optional" | "none" | "fixed";
export type SideGender = "masculine" | "feminine";

export type TemplateRequires = {
  type: RequireState;
  indication: RequireState;
  sex: RequireState;
  contrast: RequireState;
  side: RequireState;
  incidence: RequireState;
  decubitus: RequireState;
  ecg_gating: RequireState;
  phases: RequireState;
  coil: RequireState;
  sedation: RequireState;
  artifact_source: RequireState;
};

export type TemplateMeta = {
  exam_type: ExamType;
  requires: TemplateRequires;
  side_gender?: SideGender;
  defaults?: TemplateDefaults;
};

export type TemplateDefaults = {
  incidence?: string;
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
  defaults?: TemplateDefaults;
};

export type RenderInput = {
  examType: ExamType;
  templateId: string;
  type?: "convencional" | "digital" | "3d";
  indication?: string;
  sex?: "M" | "F";
  side?: "RIGHT" | "LEFT" | "BILATERAL";
  contrast?: "with" | "without";
  notes?: string;
  incidence?: string;
  decubitus?: "ventral" | "dorsal" | "lateral";
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
};

const CT_ARTIFACT_TYPES = ["Movimento", "Beam hardening"] as const;
const MR_ARTIFACT_TYPES = [
  "Movimento",
  "Susceptibilidade magnética",
  "Aliasing",
  "Deslocamento químico",
  "Volume parcial",
  "Ghosting",
  "Truncamento",
  "Zipper",
  "Ruído",
  "Interferência de radiofrequência",
  "Crosstalk",
] as const;

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
const SUPPORTED_SIDE_GENDERS: SideGender[] = ["masculine", "feminine"];
const SUPPORTED_INCIDENCES = ["PA e Perfil", "AP", "PA", "Perfil", "Obliqua", "Ortostática", "Axial"] as const;
const SUPPORTED_CONDITIONS = new Set([
  "MG_CONVENCIONAL",
  "MG_DIGITAL",
  "MG_3D",
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
  private readonly logger = new Logger(TemplatesService.name);

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

    const sideGender = (meta as any).side_gender as unknown;
    if (sideGender !== undefined) {
      if (typeof sideGender !== "string" || !SUPPORTED_SIDE_GENDERS.includes(sideGender as SideGender)) {
        throw new BadRequestException("YAML: side_gender inválido");
      }
    }

    const defaultsRaw = (meta as any).defaults as unknown;
    let defaults: TemplateDefaults | undefined;
    if (defaultsRaw !== undefined) {
      if (!defaultsRaw || typeof defaultsRaw !== "object") {
        throw new BadRequestException("YAML: defaults inválido");
      }
      const incidence = (defaultsRaw as any).incidence as unknown;
      if (incidence !== undefined) {
        if (typeof incidence !== "string" || !(SUPPORTED_INCIDENCES as readonly string[]).includes(incidence)) {
          throw new BadRequestException("YAML: defaults.incidence inválido");
        }
        defaults = { incidence };
      } else {
        defaults = {};
      }
    }

    const requires = meta.requires as Partial<TemplateRequires>;

    // Validar que campos presentes têm valores válidos, usar "none" como padrão para campos faltantes
    const fullRequires: TemplateRequires = {
      type: (requires as any).type ?? "none",
      indication: requires.indication ?? "none",
      sex: requires.sex ?? "none",
      contrast: requires.contrast ?? "none",
      side: requires.side ?? "none",
      incidence: requires.incidence ?? "none",
      decubitus: requires.decubitus ?? "none",
      ecg_gating: (requires as any).ecg_gating ?? "none",
      phases: (requires as any).phases ?? "none",
      coil: (requires as any).coil ?? "none",
      sedation: (requires as any).sedation ?? "none",
      artifact_source: (requires as any).artifact_source ?? "none",
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
        side_gender: sideGender as SideGender | undefined,
        defaults,
      },
      body,
    };
  }

  resolveRequires(meta: TemplateMeta): TemplateRequires {
    return meta.requires;
  }

  private assertInputMeetsRequires(meta: TemplateMeta, input: RenderInput): void {
    const req = meta.requires;

    if (req.type === "required" && !input.type) {
      throw new BadRequestException("requires.type: obrigatório");
    }

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

    if (req.ecg_gating === "required" && !input.ecgGating) {
      throw new BadRequestException("requires.ecg_gating: obrigatório");
    }

    if (req.phases === "required" && !input.phases) {
      throw new BadRequestException("requires.phases: obrigatório");
    }

    if (req.coil === "required" && !input.coil) {
      throw new BadRequestException("requires.coil: obrigatório");
    }

    if (req.sedation === "required" && !input.sedation) {
      throw new BadRequestException("requires.sedation: obrigatório");
    }

    if (req.artifact_source === "required" && input.artifactSourceEnabled === undefined) {
      throw new BadRequestException("requires.artifact_source: obrigatório");
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

  private toRadioFragment(choice: "omit" | "without" | "with" | undefined, fragments: { without: string; with: string }): string {
    if (!choice || choice === "omit") return "";
    return choice === "with" ? fragments.with : fragments.without;
  }

  private toFieldStrengthFragment(choice: "omit" | "1.5T" | "3.0T" | undefined): string {
    if (!choice || choice === "omit") return "";
    if (choice === "1.5T") return " Em magneto de 1,5T.";
    return " Em magneto de 3,0T.";
  }

  private formatArtifactList(items: string[]): string {
    const cleaned = items.map((s) => s.trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    if (unique.length === 0) return "";
    if (unique.length === 1) return unique[0]!;
    if (unique.length === 2) return `${unique[0]} e ${unique[1]}`;
    return `${unique.slice(0, -1).join(", ")} e ${unique[unique.length - 1]}`;
  }

  private toCtArtifactLabel(value: string): string {
    if (value === "Movimento") return "movimento";
    if (value === "Beam hardening") return "endurecimento do feixe (beam hardening)";
    return value;
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
    if (!SUPPORTED_EXAM_TYPES.includes(examType)) {
      throw new BadRequestException("examType inválido");
    }

    const dir = this.resolveTemplatesDir(examType);
    if (!dir) return [];
    const entries = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .sort((a, b) => a.localeCompare(b));

    const out: TemplateListItem[] = [];
    for (const fileName of entries) {
      const templateId = fileName.replace(/\.md$/, "");
      try {
        const source = this.loadTemplateSource(templateId, examType);
        const parsed = this.parseFrontMatter(source);

        if (parsed.meta.exam_type !== examType) {
          this.logger.warn(`Template ${templateId} exam_type mismatch: ${parsed.meta.exam_type} !== ${examType}`);
          continue;
        }

        const title = this.extractTitle(parsed.body);

        const name = this.sanitizeTemplateName(title ?? templateId);

        out.push({
          id: templateId,
          name,
          examType: parsed.meta.exam_type,
        });
      } catch (err: any) {
        this.logger.warn(`Error loading template ${templateId}: ${err?.message ?? String(err)}`);
        continue;
      }
    }
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
      defaults: parsed.meta.defaults,
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
      MG_CONVENCIONAL: input.type === "convencional",
      MG_DIGITAL: input.type === "digital",
      MG_3D: input.type === "3d",
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
      "Axial": "Radiografia em incidência axial",
    };

    const sideLabel = (() => {
      if (!input.side) return undefined;

      const agreement = parsed.meta.side_gender ?? "masculine";
      const isFeminine = agreement === "feminine";

      if (input.side === "BILATERAL") {
        return "BILATERAL";
      }

      if (input.side === "RIGHT") {
        return isFeminine ? "DIREITA" : "DIREITO";
      }

      if (input.side === "LEFT") {
        return isFeminine ? "ESQUERDA" : "ESQUERDO";
      }
      return undefined;
    })();

    const values: Record<string, string | undefined> = {
      INDICACAO: input.indication,
      NOTAS: input.notes,
      TYPE: input.type === "convencional" ? "CONVENCIONAL" : input.type === "digital" ? "DIGITAL" : input.type === "3d" ? "3D" : undefined,
      SEXO: input.sex === "F" ? "FEMININO" : input.sex === "M" ? "MASCULINO" : undefined,
      LADO: sideLabel,
      INCIDENCIA: input.incidence ? incidenciaMap[input.incidence] || input.incidence : undefined,
      DECUBITUS: input.decubitus ? (input.decubitus === "ventral" ? "ventral" : input.decubitus === "dorsal" ? "dorsal" : "lateral") : undefined,
      DECUBITUS_UPPER: input.decubitus ? (input.decubitus === "ventral" ? "VENTRAL" : input.decubitus === "dorsal" ? "DORSAL" : "LATERAL") : undefined,
    };

    // MR-specific technical fragments
    const ecg = this.toRadioFragment(input.ecgGating, {
      without: " Sem sincronização eletrocardiográfica.",
      with: " Com sincronização eletrocardiográfica.",
    });
    const phases = this.toRadioFragment(input.phases, {
      without: " Sem aquisição dinâmica pós-contraste.",
      with: " Com aquisição dinâmica pós-contraste em múltiplas fases.",
    });
    const coil = this.toFieldStrengthFragment(input.coil);
    const sedation = this.toRadioFragment(input.sedation, {
      without: " Exame realizado sem sedação.",
      with: " Exame realizado sob sedação.",
    });

    const artifactEnabled = Boolean(input.artifactSourceEnabled);
    const artifactTypes = Array.isArray(input.artifactSourceTypes) ? (input.artifactSourceTypes as string[]) : [];

    if (artifactEnabled && artifactTypes.length > 0) {
      const allowed = new Set<string>(input.examType === "CT" ? CT_ARTIFACT_TYPES : input.examType === "MR" ? MR_ARTIFACT_TYPES : []);
      for (const t of artifactTypes) {
        if (!allowed.has(t)) {
          throw new BadRequestException(`artifactSourceTypes inválido para ${input.examType}: ${t}`);
        }
      }
    }
    const artifactListRaw = input.examType === "CT" ? artifactTypes.map((t) => this.toCtArtifactLabel(t)) : artifactTypes;
    const artifactList = this.formatArtifactList(artifactListRaw);
    const artifact = artifactEnabled
      ? artifactList
        ? ` Observam-se artefatos de ${artifactList}, que limitam parcialmente a avaliação.`
        : " Observam-se artefatos que limitam parcialmente a avaliação."
      : "";

    values.ECG_GATING = ecg;
    values.PHASES = phases;
    values.COIL = coil;
    values.SEDATION = sedation;
    values.ARTIFACT_SOURCE = artifact;

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
