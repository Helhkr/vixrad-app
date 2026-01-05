import { Logger } from "@nestjs/common";

import { AuditMiddleware } from "./audit.middleware";

describe("AuditMiddleware", () => {
  it("logs only metadata (includes userId/templateId/examType and excludes findings/indication/reportText)", (done) => {
    const logs: string[] = [];
    const spy = jest
      .spyOn(Logger.prototype, "log")
      .mockImplementation((message: any) => logs.push(String(message)));

    const jwtServiceStub = {
      verify: () => ({ sub: "user-123" }),
    } as any;

    const middleware = new AuditMiddleware(jwtServiceStub);

    const req: any = {
      method: "POST",
      originalUrl: "/reports/generate",
      header: (name: string) => (name.toLowerCase() === "authorization" ? "Bearer x.y.z" : undefined),
      body: {
        templateId: "ct-cranio-normal-v1",
        examType: "CT",
        indication: "Dor lombar",
        findings: "Texto sensível",
        reportText: "Laudo completo",
      },
    };

    const handlers: Record<string, Array<() => void>> = {};
    const res: any = {
      on: (event: string, handler: () => void) => {
        handlers[event] = handlers[event] ?? [];
        handlers[event].push(handler);
      },
    };

    middleware.use(req, res, () => {
      for (const handler of handlers.finish ?? []) handler();

      expect(logs.length).toBe(1);
      const json = JSON.parse(logs[0]);

      expect(json.userId).toBe("user-123");
      expect(json.templateId).toBe("ct-cranio-normal-v1");
      expect(json.examType).toBe("CT");
      expect(json.endpoint).toBe("/reports/generate");
      expect(typeof json.timestamp).toBe("string");
      expect(typeof json.durationMs).toBe("number");

      const logLine = logs[0];
      expect(logLine).not.toContain("findings");
      expect(logLine).not.toContain("indication");
      expect(logLine).not.toContain("reportText");

      spy.mockRestore();
      done();
    });
  });
});
