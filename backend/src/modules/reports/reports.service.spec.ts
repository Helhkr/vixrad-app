import { ReportsService } from "./reports.service";

const makeTemplatesServiceStub = (opts: { normal: string; full: string; contrast?: "required" | "fixed" }) =>
  ({
    renderNormalReport: () => opts.normal,
    renderFullReport: () => opts.full,
    getTemplateDetail: () => ({ requires: { contrast: opts.contrast ?? "required" } }),
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

const makeAiPolicyServiceStub = () =>
  ({
    beginAiCall: jest.fn(async () => ({
      usageId: "usage-1",
      requestedModel: "gemini-test",
      fallbackModel: "gemini-test",
      modelCandidates: ["gemini-test"],
      windowStart: new Date("2026-01-01T00:00:00.000Z"),
      windowEnd: new Date("2026-02-01T00:00:00.000Z"),
      role: "BLUE",
      quotaLimited: false,
      failSafeUsed: false,
    })),
    markSuccess: jest.fn(async () => undefined),
    markFailure: jest.fn(async () => undefined),
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
      makeAiPolicyServiceStub(),
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
      makeAiPolicyServiceStub(),
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
      makeAiPolicyServiceStub(),
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
      makeAiPolicyServiceStub(),
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      userId: "user-1",
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
      makeAiPolicyServiceStub(),
      makeFileExtractionServiceStub(),
    );

    const result = await svc.generateStructuredBaseReport({
      userId: "user-1",
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
