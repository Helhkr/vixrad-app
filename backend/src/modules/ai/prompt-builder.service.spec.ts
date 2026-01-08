import { PromptBuilderService } from "./prompt-builder.service";

describe("PromptBuilderService (layered)", () => {
  it("builds prompt with 5 layers + output instructions", () => {
    const svc = new PromptBuilderService();

    const prompt = svc.buildPrompt({
      examType: "CT",
      templateId: "ct-coxa-normal-v1",
      templateBaseReport: "TEXTO NORMAL\n",
      indication: "Dor",
      findings: "Achado X",
      contrast: "with",
      sex: "F",
      side: "RIGHT",
    });

    expect(prompt).toContain("REGRAS OBRIGATÓRIAS:");
    expect(prompt).toContain("MODALIDADE: Tomografia Computadorizada");
    expect(prompt).toContain("TEMPLATE BASE:\nTEXTO NORMAL");
    expect(prompt).toContain("INDICAÇÃO CLÍNICA:\nDor");
    expect(prompt).toContain("ACHADOS DO EXAME (fornecidos pelo médico):\nAchado X");
    expect(prompt).toContain("INSTRUÇÕES DE SAÍDA:");
    expect(prompt).toContain("'Notas:'");
  });

  it("omits indication block when not provided", () => {
    const svc = new PromptBuilderService();

    const prompt = svc.buildPrompt({
      examType: "CT",
      templateId: "ct-coxa-normal-v1",
      templateBaseReport: "TEXTO NORMAL\n",
      findings: "Achado X",
    });

    expect(prompt).not.toContain("INDICAÇÃO CLÍNICA:");
    expect(prompt).toContain("ACHADOS DO EXAME (fornecidos pelo médico):\nAchado X");
  });

  it("includes academic mode instructions when academic is true", () => {
    const svc = new PromptBuilderService();

    const prompt = svc.buildPrompt({
      examType: "MR",
      templateId: "mr-cranio-normal-v1",
      templateBaseReport: "TEXTO NORMAL\n",
      findings: "Sem alterações significativas.",
      academic: true,
    });

    expect(prompt).toContain("MODO UNIVERSITÁRIO");
    expect(prompt).toContain("descrições extensas");
  });

  it("keeps strict no-diagnosis rule when academic is false", () => {
    const svc = new PromptBuilderService();

    const prompt = svc.buildPrompt({
      examType: "MR",
      templateId: "mr-cranio-normal-v1",
      templateBaseReport: "TEXTO NORMAL\n",
      findings: "Achado X",
      academic: false,
    });

    expect(prompt).toContain("NÃO introduza diagnósticos");
    expect(prompt).not.toContain("É PERMITIDO propor hipóteses diagnósticas");
  });
});
