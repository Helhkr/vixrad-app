import { Injectable } from "@nestjs/common";

import { TemplatesService, type RenderInput } from "../templates/templates.service";

@Injectable()
export class AiService {
  constructor(private readonly templatesService: TemplatesService) {}

  async generateReport(params: {
    prompt: string;
    baseInput: RenderInput;
    findings: string;
  }): Promise<string> {
    // Placeholder deterministic implementation: returns the composed full report.
    // The prompt is built for future LLM integration, but is not logged or persisted.
    void params.prompt;

    return this.templatesService.renderFullReport({
      ...params.baseInput,
      findings: params.findings,
    });
  }
}
