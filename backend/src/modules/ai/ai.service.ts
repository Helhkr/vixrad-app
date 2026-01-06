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
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada");
    }

    const model = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-pro";
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 20000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model,
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: params.prompt }],
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
      }

      const data = (await res.json()) as any;
      const parts = data?.candidates?.[0]?.content?.parts;
      const out = Array.isArray(parts)
        ? parts
            .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
            .join("")
            .trim()
        : "";

      if (!out) {
        throw new Error("Gemini retornou resposta vazia");
      }

      return out.endsWith("\n") ? out : `${out}\n`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      throw new Error(`Falha ao gerar com IA (${msg})`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
