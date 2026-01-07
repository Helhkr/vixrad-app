import { ReportsService } from "./reports.service";

const makeTemplatesServiceStub = (opts: { normal: string; full: string }) =>
  ({
    renderNormalReport: () => opts.normal,
    renderFullReport: () => opts.full,
  }) as any;

const makePromptBuilderStub = () =>
  ({
    buildPrompt: () => "PROMPT\n",
  }) as any;

const makeAiServiceStub = (reportText: string) =>
  ({
    generateReport: jest.fn(async () => ({
      text: reportText,
      usedModel: "gemini-test",
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30, source: "usageMetadata" },
    })),
  }) as any;

const makeFileExtractionServiceStub = () =>
  ({
    // Not used in these tests
  }) as any;

describe("ReportsService routing (normal vs full)", () => {
  it("returns normal report when no findings", async () => {
    const ai = makeAiServiceStub("AI\n");
    const svc = new ReportsService(
      makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any,
      makePromptBuilderStub(),
      ai,
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
    });

    expect(result.reportText).toBe("NORMAL\n");
    expect(ai.generateReport).not.toHaveBeenCalled();
  });

  it("returns normal report when findings is null", async () => {
    const ai = makeAiServiceStub("AI\n");
    const svc = new ReportsService(
      makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any,
      makePromptBuilderStub(),
      ai,
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: null,
    });

    expect(result.reportText).toBe("NORMAL\n");
    expect(ai.generateReport).not.toHaveBeenCalled();
  });

  it("returns normal report when findings is empty/whitespace", async () => {
    const ai = makeAiServiceStub("AI\n");
    const svc = new ReportsService(
      makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any,
      makePromptBuilderStub(),
      ai,
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "   ",
    });

    expect(result.reportText).toBe("NORMAL\n");
    expect(ai.generateReport).not.toHaveBeenCalled();
  });

  it("routes to AI when findings is provided", async () => {
    const ai = makeAiServiceStub("AI\n");
    const svc = new ReportsService(
      makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any,
      makePromptBuilderStub(),
      ai,
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "Achados compatíveis com hérnia discal",
    });

    expect(result.reportText).toBe("AI\n");
    expect(ai.generateReport).toHaveBeenCalledTimes(1);
  });

  it("normalizes AI markdown (title + bold section labels)", async () => {
    const rawAi =
      "Técnica:\nExame realizado em tomógrafo multidetectores.\n\n" +
      "Indicação:\nTrauma\n\n" +
      "Análise:\nAchados descritos aqui.\n\n" +
      "Impressão diagnóstica:\nConclusão aqui.";

    const ai = makeAiServiceStub(rawAi);
    const svc = new ReportsService(
      makeTemplatesServiceStub({ normal: "# TOMOGRAFIA COMPUTADORIZADA DO CRÂNIO\n**Técnica:** X\n", full: "FULL\n" }) as any,
      makePromptBuilderStub(),
      ai,
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "Algum achado",
    });

    expect(result.reportText).toContain("# TOMOGRAFIA COMPUTADORIZADA DO CRÂNIO");
    expect(result.reportText).toContain("**Técnica:** Exame realizado em tomógrafo multidetectores.");
    expect(result.reportText).toContain("**Indicação:** Trauma");
    expect(result.reportText).toContain("**Análise:**");
    expect(result.reportText).toContain("**Impressão diagnóstica:**");
  });
});
