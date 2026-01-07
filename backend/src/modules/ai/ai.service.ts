import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import type { RenderInput } from "../templates/templates.service";

type GeminiTokenUsage = {
  promptTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  source: "usageMetadata" | "countTokens" | "none";
};

type GeminiGenerateResult = {
  text: string;
  usedModel: string;
  usage: GeminiTokenUsage;
};

@Injectable()
export class AiService {
  private sanitizeIndication(raw: string): string {
    let s = typeof raw === "string" ? raw : "";
    s = s.trim();
    // Remove common prefixes that models might add
    s = s.replace(/^(indica[cç][aã]o|indication|indicacao)\s*:?\s*/i, "");
    s = s.replace(/^INDICAÇÃO\s*:?\s*/i, "");
    s = s.replace(/^INDICAÇÃO CLÍNICA RESUMIDA\s*:?\s*/i, "");
    // Strip surrounding quotes
    s = s.replace(/^\s*"|"\s*$/g, "");
    // Keep only the first sentence/line
    const firstSegment = s.split(/[\.!?\n\r]/)[0] ?? s;
    s = firstSegment.trim();
    // Limit to ~15 words to keep concise
    const words = s.split(/\s+/);
    if (words.length > 15) {
      s = words.slice(0, 15).join(" ");
    }
    return s.trim();
  }
  private modelsCache?: { names: string[]; fetchedAt: number };

  private normalizeModel(raw: string | undefined): string {
    const trimmed = (raw ?? "").trim();
    const model = trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed;

    if (!model) return "gemini-2.5-pro";

    // Backwards-compatible aliases
    if (model === "gemini-1.5-pro" || model === "gemini-1.5-pro-latest") return "gemini-2.5-pro";
    if (model === "gemini-1.5-flash" || model === "gemini-1.5-flash-latest") return "gemini-2.5-flash";

    return model;
  }

  private async fetchAvailableModels(apiKey: string): Promise<string[]> {
    // Cache for 15 minutes
    const now = Date.now();
    if (this.modelsCache && now - this.modelsCache.fetchedAt < 15 * 60 * 1000) {
      return this.modelsCache.names;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, { method: "GET", signal: controller.signal });
      if (!res.ok) {
        // On error, return empty to allow fallback
        return [];
      }
      const json = (await res.json()) as any;
      const names = Array.isArray(json?.models)
        ? json.models
            .map((m: any) => (typeof m?.name === "string" ? m.name : ""))
            .filter((n: string) => !!n)
            .map((n: string) => (n.startsWith("models/") ? n.slice("models/".length) : n))
        : [];
      this.modelsCache = { names, fetchedAt: now };
      return names;
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  private chooseBestModel(available: string[]): string {
    // Preference order: Pro variants first, then Flash
    const ranking = [
      "gemini-3.0-pro-exp",
      "gemini-3.0-pro",
      "gemini-3.0-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ];
    for (const candidate of ranking) {
      if (available.includes(candidate)) return candidate;
    }
    // Fallback if list is empty or none matched
    return "gemini-2.5-pro";
  }

  private async resolveModel(): Promise<string> {
    const envModel = this.normalizeModel(process.env.GEMINI_MODEL);
    if (envModel) return envModel;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return "gemini-2.5-pro";
    const available = await this.fetchAvailableModels(apiKey);
    return this.chooseBestModel(available);
  }

  // Expose selected model for controllers/services that want to log or set headers
  public async getResolvedModel(): Promise<string> {
    return this.resolveModel();
  }

  // Expose the last actually-used model (after a successful request)
  public getLastUsedModel(): string | undefined {
    // NOTE: kept for backwards compatibility with older controller logic.
    // Prefer returning the used model from the call result to avoid cross-request races.
    return undefined;
  }

  private parseUsageMetadata(data: any): GeminiTokenUsage {
    const u = data?.usageMetadata;
    const prompt = typeof u?.promptTokenCount === "number" ? u.promptTokenCount : null;
    const output = typeof u?.candidatesTokenCount === "number" ? u.candidatesTokenCount : null;
    const total = typeof u?.totalTokenCount === "number" ? u.totalTokenCount : null;
    const hasAny = prompt !== null || output !== null || total !== null;
    return {
      promptTokens: prompt,
      outputTokens: output,
      totalTokens: total,
      source: hasAny ? "usageMetadata" : "none",
    };
  }

  private isCountTokensFallbackEnabled(): boolean {
    const raw = (process.env.GEMINI_COUNT_TOKENS_FALLBACK ?? "1").trim().toLowerCase();
    return raw !== "0" && raw !== "false" && raw !== "no";
  }

  private async countTokens(params: { apiKey: string; model: string; body: any; timeoutMs: number }): Promise<number | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.max(1000, params.timeoutMs));
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        params.model,
      )}:countTokens?key=${encodeURIComponent(params.apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params.body),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const json = (await res.json()) as any;
      const n = typeof json?.totalTokens === "number" ? json.totalTokens : null;
      return n;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildCandidates(envModel: string | undefined, available: string[]): string[] {
    const env = this.normalizeModel(envModel);
    const ranking = [
      "gemini-3.0-pro-exp",
      "gemini-3.0-pro",
      "gemini-3.0-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
    ];
    const inAvailable = ranking.filter((m) => available.includes(m));
    const base = inAvailable.length > 0 ? inAvailable : ranking;
    const withEnvFirst = env ? [env, ...base.filter((m) => m !== env)] : base;
    return Array.from(new Set(withEnvFirst));
  }

  private async tryModelsGenerate({
    apiKey,
    timeoutMs,
    candidates,
    buildBody,
  }: {
    apiKey: string;
    timeoutMs: number;
    candidates: string[];
    buildBody: (model: string) => any;
  }): Promise<GeminiGenerateResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 20000);
    let lastErr: Error | HttpException | BadGatewayException | undefined;
    try {
      for (const model of candidates) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent?key=${encodeURIComponent(apiKey)}`;
        try {
          const requestBody = buildBody(model);
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          if (!res.ok) {
            // Parse minimal error info
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

            // Fallback-worthy statuses: 429 (quota), 404 (model not found), 403 (no permission/quota)
            if (res.status === 429 || res.status === 404 || res.status === 403) {
              lastErr = new HttpException(
                `Falha no modelo ${model}: ${res.status} ${res.statusText}${geminiMessage ? ` - ${geminiMessage}` : ""}`,
                res.status,
              );
              continue; // try next candidate
            }

            // Other errors: record and continue trying next
            lastErr = new BadGatewayException(
              `Falha ao chamar a IA (Gemini) em ${model}: ${res.status} ${res.statusText}${geminiMessage ? ` - ${geminiMessage}` : ""}`,
            );
            continue;
          }

          const data = (await res.json()) as any;
          const parts = data?.candidates?.[0]?.content?.parts;
          const out = Array.isArray(parts)
            ? parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim()
            : "";
          if (!out) {
            lastErr = new BadGatewayException("Gemini retornou resposta vazia");
            continue;
          }

          let usage = this.parseUsageMetadata(data);
          if (usage.source === "none" && this.isCountTokensFallbackEnabled()) {
            const ctTimeout = Math.min(8000, Math.max(1500, Number.isFinite(timeoutMs) ? timeoutMs / 2 : 8000));
            const promptTokens = await this.countTokens({ apiKey, model, body: requestBody, timeoutMs: ctTimeout });
            const outputTokens = await this.countTokens({
              apiKey,
              model,
              timeoutMs: ctTimeout,
              body: {
                contents: [
                  {
                    role: "user",
                    parts: [{ text: out }],
                  },
                ],
              },
            });
            const total =
              typeof promptTokens === "number" && typeof outputTokens === "number"
                ? promptTokens + outputTokens
                : null;
            usage = {
              promptTokens: promptTokens ?? null,
              outputTokens: outputTokens ?? null,
              totalTokens: total,
              source: "countTokens",
            };
          }

          return {
            text: out.endsWith("\n") ? out : `${out}\n`,
            usedModel: model,
            usage,
          };
        } catch (e) {
          const isAbortError = typeof e === "object" && e !== null && (e as any).name === "AbortError";
          if (isAbortError) {
            lastErr = new GatewayTimeoutException("Timeout ao chamar a IA (Gemini)");
            // On timeout, try next candidate quickly
            continue;
          }
          lastErr = e as any;
          continue;
        }
      }
      // Exhausted all candidates: if we saw any 429/403, surface 429 to user, else surface last error
      if (lastErr instanceof HttpException && (lastErr.getStatus?.() === 429 || lastErr.getStatus?.() === 403)) {
        throw new HttpException(
          "Limite de requisições da IA. Tente novamente em ~1 minuto.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (lastErr) throw lastErr;
      throw new BadGatewayException("Falha desconhecida ao chamar a IA (sem modelos disponíveis)");
    } finally {
      clearTimeout(timeout);
    }
  }

  // Rough token estimator for observability: ~4 chars/token heuristic
  private estimateTokens(text?: string): number {
    const s = (text ?? "").trim();
    if (!s) return 0;
    return Math.ceil(s.length / 4);
  }

  // Public estimator for request inputs (does not inspect templates/prompts inside service)
  public estimateTokensForGenerate(input: {
    findings?: string;
    indication?: string;
    hasAttachment?: boolean;
  }): number {
    const baseOverhead = 200; // system + instruction overhead (approx)
    const f = this.estimateTokens(input.findings);
    const i = this.estimateTokens(input.indication);
    const attach = input.hasAttachment ? 100 : 0; // small bump for inline attachments metadata
    return baseOverhead + f + i + attach;
  }

  async generateReport(params: {
    prompt: string;
    baseInput: RenderInput;
    findings: string;
    modelCandidates?: string[];
  }): Promise<GeminiGenerateResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException("IA não configurada no servidor (GEMINI_API_KEY ausente)");
    }

    const candidates = Array.isArray(params.modelCandidates) && params.modelCandidates.length > 0
      ? params.modelCandidates.map((m) => this.normalizeModel(m))
      : this.buildCandidates(this.normalizeModel(process.env.GEMINI_MODEL), await this.fetchAvailableModels(apiKey));
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");

    const result = await this.tryModelsGenerate({
      apiKey,
      timeoutMs,
      candidates,
      buildBody: () => ({
        contents: [
          {
            role: "user",
            parts: [{ text: params.prompt }],
          },
        ],
      }),
    });
    return result;
  }

  async generateIndicationFromText(extractedText: string, opts?: { modelCandidates?: string[] }): Promise<GeminiGenerateResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException("IA não configurada no servidor (GEMINI_API_KEY ausente)");
    }

    const candidates = Array.isArray(opts?.modelCandidates) && opts!.modelCandidates!.length > 0
      ? opts!.modelCandidates!.map((m) => this.normalizeModel(m))
      : this.buildCandidates(this.normalizeModel(process.env.GEMINI_MODEL), await this.fetchAvailableModels(apiKey));
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");

    const prompt = `Leia o texto abaixo (pedido/prontuário) e escreva APENAS UMA frase curta com a indicação clínica, em português brasileiro.

  Regras:
  - Seja conciso (máx. ~12 palavras).
  - Não inclua prefixos como "Indicação:".
  - Não explique, não liste, não detalhe.
  - Retorne somente a frase final, sem aspas.

  Texto:
  ${extractedText}`;

    const result = await this.tryModelsGenerate({
      apiKey,
      timeoutMs,
      candidates,
      buildBody: () => ({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });
    const out = this.sanitizeIndication(result.text);
    if (!out) {
      throw new BadGatewayException("IA retornou indicação vazia");
    }
    return { ...result, text: out };
  }

  async generateIndicationFromFile(file: Express.Multer.File, opts?: { modelCandidates?: string[] }): Promise<GeminiGenerateResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException("IA não configurada no servidor (GEMINI_API_KEY ausente)");
    }

    const candidates = Array.isArray(opts?.modelCandidates) && opts!.modelCandidates!.length > 0
      ? opts!.modelCandidates!.map((m) => this.normalizeModel(m))
      : this.buildCandidates(this.normalizeModel(process.env.GEMINI_MODEL), await this.fetchAvailableModels(apiKey));
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");

    const prompt = `Leia o documento anexado (pedido/prontuário) e escreva APENAS UMA frase curta com a indicação clínica, em português brasileiro.

  Regras:
  - Seja conciso (máx. ~12 palavras).
  - Não inclua prefixos como "Indicação:".
  - Não explique, não liste, não detalhe.
  - Retorne somente a frase final, sem aspas.`;

    const base64Data = file.buffer.toString("base64");

    const result = await this.tryModelsGenerate({
      apiKey,
      timeoutMs,
      candidates,
      buildBody: () => ({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.mimetype,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });
    const out = this.sanitizeIndication(result.text);
    if (!out) {
      throw new BadGatewayException("IA retornou indicação vazia");
    }
    return { ...result, text: out };
  }
}
