import * as fs from "node:fs";
import * as path from "node:path";

import { TemplatesService } from "./templates.service";

describe("CT templates in docs/clinical/ct", () => {
  it("all CT templates parse and render without errors", () => {
    const templatesDirCandidates = [
      path.resolve(process.cwd(), "docs/clinical/ct"),
      path.resolve(process.cwd(), "../docs/clinical/ct"),
      path.resolve(process.cwd(), "../../docs/clinical/ct"),
    ];

    const templatesDir = templatesDirCandidates.find(
      (p) => fs.existsSync(p) && fs.statSync(p).isDirectory(),
    );

    expect(templatesDir).toBeTruthy();

    const service = new TemplatesService();

    const files = fs
      .readdirSync(templatesDir as string)
      .filter((f) => f.endsWith(".md"))
      .sort();

    expect(files.length).toBeGreaterThan(0);

    for (const filename of files) {
      const templateId = filename.replace(/\.md$/, "");
      const source = fs.readFileSync(path.join(templatesDir as string, filename), "utf-8");

      expect(source.trim().length).toBeGreaterThan(0);

      const parsed = service.parseFrontMatter(source);

      expect(parsed.meta.exam_type).toBe("CT");

      // Use minimal inputs that satisfy requires.
      const input: Parameters<typeof service.renderResolvedMarkdown>[0] = {
        examType: parsed.meta.exam_type,
        templateId,
      };

      if (parsed.meta.requires.contrast === "required") {
        input.contrast = "without";
      }

      if (parsed.meta.requires.indication === "required") {
        input.indication = "INDICAÇÃO TESTE";
      }

      if (parsed.meta.requires.sex === "required") {
        input.sex = "F";
      }

      if (parsed.meta.requires.side === "required") {
        input.side = "RIGHT";
      }

      expect(() => service.renderResolvedMarkdown(input)).not.toThrow();
    }
  });
});
