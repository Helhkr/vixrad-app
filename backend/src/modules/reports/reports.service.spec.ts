import { ReportsService } from "./reports.service";

const makeTemplatesServiceStub = (opts: { normal: string; full: string }) =>
  ({
    renderNormalReport: () => opts.normal,
    renderFullReport: () => opts.full,
  }) as any;

describe("ReportsService routing (normal vs full)", () => {
  it("returns normal report when no findings", () => {
    const svc = new ReportsService(makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
    });

    expect(result.reportText).toBe("NORMAL\n");
  });

  it("returns normal report when findings is null", () => {
    const svc = new ReportsService(makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: null,
    });

    expect(result.reportText).toBe("NORMAL\n");
  });

  it("returns normal report when findings is empty/whitespace", () => {
    const svc = new ReportsService(makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "   ",
    });

    expect(result.reportText).toBe("NORMAL\n");
  });

  it("returns full report when findings is provided", () => {
    const svc = new ReportsService(makeTemplatesServiceStub({ normal: "NORMAL\n", full: "FULL\n" }) as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "Achados compatíveis com hérnia discal",
    });

    expect(result.reportText).toBe("FULL\n");
  });
});
