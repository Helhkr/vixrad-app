import { TemplatesService } from "./templates.service";

class InMemoryTemplatesService extends TemplatesService {
  constructor(private readonly source: string) {
    super();
  }

  override loadTemplateSource(_templateId: string, _examType: "CT" | "XR" | "US" | "MR" | "MG" | "DXA" | "NM"): string {
    return this.source;
  }
}

describe("TemplatesService", () => {
  it("parses YAML front matter and returns meta + body", () => {
    const svc = new TemplatesService();

    const src = [
      "---",
      "exam_type: CT",
      "requires:",
      "  indication: optional",
      "  sex: none",
      "  contrast: required",
      "  side: none",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA",
      "",
      "**Técnica:** ...",
    ].join("\n");

    const parsed = svc.parseFrontMatter(src);

    expect(parsed.meta.exam_type).toBe("CT");
    expect(parsed.meta.requires.contrast).toBe("required");
    expect(parsed.body).toContain("# TOMOGRAFIA COMPUTADORIZADA");
  });

  it("parses defaults.incidence when provided", () => {
    const svc = new TemplatesService();

    const src = [
      "---",
      "exam_type: XR",
      "defaults:",
      "  incidence: PA e Perfil",
      "requires:",
      "  indication: none",
      "  sex: none",
      "  contrast: none",
      "  side: none",
      "  incidence: required",
      "  decubitus: none",
      "---",
      "# XR",
      "**Técnica:** {{INCIDENCIA}}",
      "**Análise:** ok",
      "**Impressão diagnóstica:** ok",
    ].join("\n");

    const parsed = svc.parseFrontMatter(src);
    expect(parsed.meta.defaults?.incidence).toBe("PA e Perfil");
  });

  it("validates defaults.incidence values", () => {
    const svc = new TemplatesService();

    const src = [
      "---",
      "exam_type: XR",
      "defaults:",
      "  incidence: AP e Perfil",
      "requires:",
      "  indication: none",
      "  sex: none",
      "  contrast: none",
      "  side: none",
      "  incidence: required",
      "  decubitus: none",
      "---",
      "# XR",
      "**Técnica:** {{INCIDENCIA}}",
      "**Análise:** ok",
      "**Impressão diagnóstica:** ok",
    ].join("\n");

    expect(() => svc.parseFrontMatter(src)).toThrow(/defaults\.incidence/i);
  });

  it("renders {{LADO}} with gender agreement when side_gender is set", () => {
    const src = [
      "---",
      "exam_type: CT",
      "side_gender: feminine",
      "requires:",
      "  indication: none",
      "  sex: none",
      "  contrast: none",
      "  side: required",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA DA MÃO {{LADO}}",
      "**Técnica:** ok",
      "**Análise:** ok",
      "**Impressão diagnóstica:** ok",
    ].join("\n");

    const svc = new InMemoryTemplatesService(src);

    const right = svc.renderResolvedMarkdown({ examType: "CT", templateId: "any", side: "RIGHT" });
    expect(right.markdown).toContain("DA MÃO DIREITA");

    const left = svc.renderResolvedMarkdown({ examType: "CT", templateId: "any", side: "LEFT" });
    expect(left.markdown).toContain("DA MÃO ESQUERDA");

    const bilateral = svc.renderResolvedMarkdown({ examType: "CT", templateId: "any", side: "BILATERAL" });
    expect(bilateral.markdown).toContain("DA MÃO BILATERAL");
  });

  it("validates requires values", () => {
    const svc = new TemplatesService();

    const src = [
      "---",
      "exam_type: CT",
      "requires:",
      "  indication: maybe",
      "  sex: none",
      "  contrast: required",
      "  side: none",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA",
      "**Técnica:** ...",
    ].join("\n");

    expect(() => svc.parseFrontMatter(src)).toThrow(/requires\.indication/i);
  });

  it("resolves IF/ELSE/ENDIF and placeholders", () => {
    const src = [
      "---",
      "exam_type: CT",
      "requires:",
      "  indication: optional",
      "  sex: none",
      "  contrast: required",
      "  side: none",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA",
      "",
      "**Técnica:** Exame realizado",
      "<!-- IF CONTRASTE -->",
      "com contraste.",
      "<!-- ELSE -->",
      "sem contraste.",
      "<!-- ENDIF CONTRASTE -->",
      "",
      "<!-- IF INDICACAO -->",
      "**Indicação:** {{INDICACAO}}",
      "<!-- ENDIF INDICACAO -->",
      "",
      "**Análise:**",
      "",
      "Texto.",
      "",
      "**Impressão diagnóstica:**",
      "Conclusão.",
      "",
    ].join("\n");

    const svc = new InMemoryTemplatesService(src);

    const rendered = svc.renderResolvedMarkdown({
      examType: "CT",
      templateId: "any",
      contrast: "with",
      indication: "Dor",
    });

    expect(rendered.markdown).toContain("com contraste.");
    expect(rendered.markdown).not.toContain("sem contraste.");
    expect(rendered.markdown).toContain("**Indicação:** Dor");
    expect(rendered.markdown).not.toContain("<!-- IF");
  });

  it("enforces requires.* required inputs", () => {
    const src = [
      "---",
      "exam_type: CT",
      "requires:",
      "  indication: none",
      "  sex: none",
      "  contrast: required",
      "  side: none",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA",
      "**Técnica:**",
      "<!-- IF CONTRASTE -->com<!-- ELSE -->sem<!-- ENDIF CONTRASTE -->",
      "**Análise:**",
      "",
      "x",
      "**Impressão diagnóstica:**",
      "y",
    ].join("\n");

    const svc = new InMemoryTemplatesService(src);

    expect(() =>
      svc.renderResolvedMarkdown({
        examType: "CT",
        templateId: "any",
      }),
    ).toThrow(/requires\.contrast/i);
  });

  it("supports sex conditionals", () => {
    const src = [
      "---",
      "exam_type: CT",
      "requires:",
      "  indication: none",
      "  sex: required",
      "  contrast: fixed",
      "  side: none",
      "---",
      "# TOMOGRAFIA COMPUTADORIZADA",
      "**Técnica:** ok",
      "**Análise:**",
      "",
      "<!-- IF SEXO_FEMININO -->",
      "Texto feminino.",
      "<!-- ENDIF SEXO_FEMININO -->",
      "<!-- IF SEXO_MASCULINO -->",
      "Texto masculino.",
      "<!-- ENDIF SEXO_MASCULINO -->",
      "",
      "**Impressão diagnóstica:**",
      "Fim.",
    ].join("\n");

    const svc = new InMemoryTemplatesService(src);

    const female = svc.renderResolvedMarkdown({ examType: "CT", templateId: "any", sex: "F" });
    expect(female.markdown).toContain("Texto feminino.");
    expect(female.markdown).not.toContain("Texto masculino.");

    const male = svc.renderResolvedMarkdown({ examType: "CT", templateId: "any", sex: "M" });
    expect(male.markdown).toContain("Texto masculino.");
    expect(male.markdown).not.toContain("Texto feminino.");
  });

  it("resolves DECUBITUS placeholders with context-friendly casing", () => {
    const src = [
      "---",
      "exam_type: XR",
      "requires:",
      "  indication: none",
      "  sex: none",
      "  contrast: none",
      "  side: none",
      "  incidence: required",
      "  decubitus: optional",
      "---",
      "# XR",
      "**Técnica:** {{INCIDENCIA}}<!-- IF DECUBITUS --> em decúbito {{DECUBITUS}} ({{DECUBITUS_UPPER}})<!-- ENDIF DECUBITUS -->.",
      "**Análise:**",
      "ok",
      "**Impressão diagnóstica:**",
      "ok",
    ].join("\n");

    const svc = new InMemoryTemplatesService(src);

    const rendered = svc.renderResolvedMarkdown({
      examType: "XR",
      templateId: "any",
      incidence: "PA",
      decubitus: "dorsal",
    });

    expect(rendered.markdown).toContain("em decúbito dorsal");
    expect(rendered.markdown).toContain("(DORSAL)");
  });
});
