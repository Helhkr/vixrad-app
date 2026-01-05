import { ReportsService } from "./reports.service";

const makeTemplatesServiceStub = (markdown: string) =>
  ({
    renderResolvedMarkdown: () => ({
      meta: {
        exam_type: "CT",
        requires: {
          indication: "optional",
          sex: "none",
          contrast: "required",
          side: "none",
        },
      },
      markdown,
    }),
  }) as any;

describe("ReportsService output composition", () => {
  it("returns only resolved template when no indication/findings", () => {
    const svc = new ReportsService(makeTemplatesServiceStub("# T\n\nA\n") as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
    });

    expect(result.reportText).toBe("# T\n\nA\n");
  });

  it("adds indication block when indication is provided", () => {
    const svc = new ReportsService(makeTemplatesServiceStub("# T\n\nA\n") as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      indication: "Dor lombar",
    });

    expect(result.reportText).toContain("**INDICAÇÃO CLÍNICA:** Dor lombar");
  });

  it("adds findings block when findings is provided", () => {
    const svc = new ReportsService(makeTemplatesServiceStub("# T\n\nA\n") as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      findings: "Achados compatíveis com hérnia discal",
    });

    expect(result.reportText).toContain("**ACHADOS DO EXAME:**");
    expect(result.reportText).toContain("Achados compatíveis com hérnia discal");
  });

  it("adds indication then findings in correct order", () => {
    const svc = new ReportsService(makeTemplatesServiceStub("# T\n\nA\n") as any);

    const result = svc.generateStructuredBaseReport({
      examType: "CT",
      templateId: "ct-cranio-normal-v1",
      contrast: "without",
      indication: "Dor lombar",
      findings: "Achados compatíveis com hérnia discal",
    });

    const posInd = result.reportText.indexOf("**INDICAÇÃO CLÍNICA:**");
    const posFind = result.reportText.indexOf("**ACHADOS DO EXAME:**");

    expect(posInd).toBeGreaterThan(-1);
    expect(posFind).toBeGreaterThan(-1);
    expect(posInd).toBeLessThan(posFind);
  });
});
