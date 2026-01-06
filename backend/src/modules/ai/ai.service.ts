import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import type { RenderInput } from "../templates/templates.service";

@Injectable()
export class AiService {
  private normalizeModel(raw: string | undefined): string {
    const trimmed = (raw ?? "").trim();
    const model = trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed;

    if (!model) return "gemini-2.5-pro";

    // Backwards-compatible aliases
    if (model === "gemini-1.5-pro" || model === "gemini-1.5-pro-latest") return "gemini-2.5-pro";
    if (model === "gemini-1.5-flash" || model === "gemini-1.5-flash-latest") return "gemini-2.5-flash";

    return model;
  }

  async generateReport(params: {
    prompt: string;
    baseInput: RenderInput;
    findings: string;
  }): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException("IA não configurada no servidor (GEMINI_API_KEY ausente)");
    }

    const model = this.normalizeModel(process.env.GEMINI_MODEL);
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
        // Avoid logging/reporting large bodies. Extract the minimal error info.
        let geminiMessage = "";
        let geminiReason = "";
        try {
          const errJson = (await res.json()) as any;
          geminiMessage = typeof errJson?.error?.message === "string" ? errJson.error.message : "";
          const details = Array.isArray(errJson?.error?.details) ? errJson.error.details : [];
          geminiReason =
            typeof details?.[0]?.reason === "string"
              ? details[0].reason
              : typeof details?.[0]?.metadata?.reason === "string"
                ? details[0].metadata.reason
                : "";
        } catch {
          // ignore
        }

        const isApiKeyInvalid =
          geminiReason === "API_KEY_INVALID" ||
          geminiMessage.toLowerCase().includes("api key expired") ||
          geminiMessage.toLowerCase().includes("api_key_invalid");

        if (isApiKeyInvalid) {
          throw new ServiceUnavailableException("Chave da IA (Gemini) inválida/expirada. Atualize GEMINI_API_KEY.");
        }

        throw new BadGatewayException(
          `Falha ao chamar a IA (Gemini): ${res.status} ${res.statusText}${geminiMessage ? ` - ${geminiMessage}` : ""}`,
        );
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
      if (e instanceof ServiceUnavailableException || e instanceof BadGatewayException) {
        throw e;
      }

      const isAbortError = typeof e === "object" && e !== null && (e as any).name === "AbortError";
      if (isAbortError) {
        throw new GatewayTimeoutException("Timeout ao chamar a IA (Gemini)");
      }

      const msg = e instanceof Error ? e.message : "erro desconhecido";
      throw new BadGatewayException(`Falha ao gerar com IA (${msg})`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
