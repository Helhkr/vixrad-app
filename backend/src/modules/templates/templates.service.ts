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

export type RenderInput = {
  examType: ExamType;
  templateId: string;
  indication?: string;
  sex?: "M" | "F";
  side?: "RIGHT" | "LEFT";
  contrast?: "with" | "without";
  notes?: string;
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
]);

const IF_TOKEN_RE = /<!--\s*(IF\s+[A-Z0-9_]+|ELSE|ENDIF\s+[A-Z0-9_]+)\s*-->/g;
const IF_RE = /^<!--\s*IF\s+([A-Z0-9_]+)\s*-->$/;
const ELSE_RE = /^<!--\s*ELSE\s*-->$/;
const ENDIF_RE = /^<!--\s*ENDIF\s+([A-Z0-9_]+)\s*-->$/;

@Injectable()
export class TemplatesService {
  private resolveTemplatesDir(): string {
    const candidates = [
      path.resolve(process.cwd(), "docs/clinical/ct"),
      path.resolve(process.cwd(), "../docs/clinical/ct"),
      path.resolve(process.cwd(), "../../docs/clinical/ct"),
    ];

    const found = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());
    if (!found) {
      throw new Error(
        `Clinical templates directory not found. Tried: ${candidates.join(", ")}.`,
      );
    }

    return found;
  }

  private getTemplatePath(templateId: string): string {
    const safeId = templateId.replace(/[^a-zA-Z0-9._-]/g, "");
    if (safeId !== templateId) {
      throw new BadRequestException("templateId inválido");
    }

    const dir = this.resolveTemplatesDir();
    return path.join(dir, `${templateId}.md`);
  }

  loadTemplateSource(templateId: string): string {
    const filePath = this.getTemplatePath(templateId);
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
    const missing = (k: keyof TemplateRequires) => requires[k] === undefined;
    if (missing("indication") || missing("sex") || missing("contrast") || missing("side")) {
      throw new BadRequestException("YAML: requires incompleto");
    }

    for (const [key, value] of Object.entries(requires)) {
      if (!SUPPORTED_REQUIRE_STATES.includes(value as RequireState)) {
        throw new BadRequestException(`YAML: requires.${key} inválido`);
      }
    }

    return {
      meta: {
        exam_type: meta.exam_type as ExamType,
        requires: requires as TemplateRequires,
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

  private extractTitle(bodyMarkdown: string): string | null {
    for (const line of bodyMarkdown.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return trimmed.replace(/^#\s+/, "").trim() || null;
      }
    }
    return null;
  }

  listTemplates(): TemplateListItem[] {
    const dir = this.resolveTemplatesDir();
    const entries = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .sort((a, b) => a.localeCompare(b));

    const out: TemplateListItem[] = [];
    for (const fileName of entries) {
      const templateId = fileName.replace(/\.md$/, "");
      const source = this.loadTemplateSource(templateId);
      const parsed = this.parseFrontMatter(source);
      const title = this.extractTitle(parsed.body);

      out.push({
        id: templateId,
        name: title ?? templateId,
        examType: parsed.meta.exam_type,
      });
    }

    return out;
  }

  renderResolvedMarkdown(input: RenderInput): { meta: TemplateMeta; markdown: string } {
    const source = this.loadTemplateSource(input.templateId);
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
    };

    const ast = this.parseConditionalsToAst(parsed.body);
    const withoutConditionals = this.evalAst(ast, flags);

    const values: Record<string, string | undefined> = {
      INDICACAO: input.indication,
      NOTAS: input.notes,
      SEXO: input.sex === "F" ? "FEMININO" : input.sex === "M" ? "MASCULINO" : undefined,
      LADO: input.side === "RIGHT" ? "DIREITO" : input.side === "LEFT" ? "ESQUERDO" : undefined,
    };

    const resolved = this.resolvePlaceholders(withoutConditionals, values);

    return { meta: parsed.meta, markdown: resolved.trim() + "\n" };
  }
}
