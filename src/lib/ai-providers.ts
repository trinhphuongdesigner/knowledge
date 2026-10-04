/**
 * Phần thuần của nhiều nhà cung cấp AI: dựng request, đọc phản hồi, phân loại lỗi để xoay vòng key.
 * Không import DB / mạng — test được bằng vitest.
 */
import { AI_ERROR_MESSAGE, AiError, buildPrompt, buildRequestBody, systemPrompt, type AiPromptInput } from "./ai-core";

export const AI_PROVIDER_KINDS = ["ANTHROPIC", "OPENAI", "GEMINI", "GROK", "DEEPSEEK", "OPENAI_COMPATIBLE"] as const;
export type AiProviderKindName = (typeof AI_PROVIDER_KINDS)[number];

type KindInfo = {
  label: string;
  /** URL gốc mặc định, theo đúng quy ước của SDK chính thức (để admin dán base URL từ tài liệu là chạy). */
  baseUrl: string;
  /** Model mặc định khi admin để trống; "" = bắt buộc nhập. */
  model: string;
  style: "anthropic" | "openai" | "gemini";
};

export const AI_PROVIDER_INFO: Record<AiProviderKindName, KindInfo> = {
  ANTHROPIC: { label: "Claude (Anthropic)", baseUrl: "https://api.anthropic.com", model: "claude-haiku-4-5", style: "anthropic" },
  OPENAI: { label: "ChatGPT (OpenAI)", baseUrl: "https://api.openai.com/v1", model: "gpt-4.1-mini", style: "openai" },
  GEMINI: { label: "Gemini (Google)", baseUrl: "https://generativelanguage.googleapis.com", model: "gemini-2.5-flash", style: "gemini" },
  GROK: { label: "Grok (xAI)", baseUrl: "https://api.x.ai/v1", model: "grok-3-mini", style: "openai" },
  DEEPSEEK: { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat", style: "openai" },
  OPENAI_COMPATIBLE: { label: "OpenAI-compatible", baseUrl: "", model: "", style: "openai" },
};

/** Model có suy luận (reasoning) tiêu tốn token trước khi trả lời → cho dư hơn Claude. */
const OPENAI_MAX_TOKENS = 1024;
const GEMINI_MAX_TOKENS = 2048;

export type ProviderConfig = { kind: AiProviderKindName; apiKey: string; baseUrl: string | null; model: string | null };
export type ProviderCall = { url: string; headers: Record<string, string>; body: unknown };

const trimSlash = (s: string) => s.trim().replace(/\/+$/, "");

export function resolveModel(cfg: Pick<ProviderConfig, "kind" | "model">): string {
  return cfg.model?.trim() || AI_PROVIDER_INFO[cfg.kind].model;
}

export function resolveBaseUrl(cfg: Pick<ProviderConfig, "kind" | "baseUrl">): string {
  return trimSlash(cfg.baseUrl?.trim() || AI_PROVIDER_INFO[cfg.kind].baseUrl);
}

/** Cấu hình còn thiếu gì để gọi được? (OPENAI_COMPATIBLE cần cả base URL lẫn model.) */
export function missingConfig(cfg: Pick<ProviderConfig, "kind" | "baseUrl" | "model">): ("baseUrl" | "model")[] {
  const out: ("baseUrl" | "model")[] = [];
  if (!resolveBaseUrl(cfg)) out.push("baseUrl");
  if (!resolveModel(cfg)) out.push("model");
  return out;
}

export function buildProviderCall(cfg: ProviderConfig, input: AiPromptInput): ProviderCall {
  const base = resolveBaseUrl(cfg);
  const model = resolveModel(cfg);
  const key = cfg.apiKey.trim();
  switch (AI_PROVIDER_INFO[cfg.kind].style) {
    case "anthropic": {
      const url = base.endsWith("/messages") ? base : base.endsWith("/v1") ? `${base}/messages` : `${base}/v1/messages`;
      return {
        url,
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: buildRequestBody(input, model),
      };
    }
    case "gemini": {
      const root = /\/v1(beta)?$/.test(base) ? base : `${base}/v1beta`;
      const name = model.replace(/^models\//, "");
      return {
        url: `${root}/models/${encodeURIComponent(name)}:generateContent`,
        headers: { "x-goog-api-key": key, "content-type": "application/json" },
        body: {
          systemInstruction: { parts: [{ text: systemPrompt(input.locale) }] },
          contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
          generationConfig: { maxOutputTokens: GEMINI_MAX_TOKENS, responseMimeType: "application/json" },
        },
      };
    }
    case "openai": {
      const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
      // OpenAI chính chủ đã bỏ max_tokens ở các model mới; các API "tương thích" khác vẫn dùng max_tokens.
      const limit = cfg.kind === "OPENAI" ? { max_completion_tokens: OPENAI_MAX_TOKENS } : { max_tokens: OPENAI_MAX_TOKENS };
      return {
        url,
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: {
          model,
          ...limit,
          messages: [
            { role: "system", content: systemPrompt(input.locale) },
            { role: "user", content: buildPrompt(input) },
          ],
        },
      };
    }
  }
}

type Json = Record<string, unknown> | null | undefined;

function anthropicText(body: Json): string | null {
  const content = body?.content;
  if (!Array.isArray(content)) return null;
  return content
    .filter((b): b is { type: "text"; text: string } => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
}

function openaiText(body: Json): string | null {
  const choices = body?.choices;
  if (!Array.isArray(choices)) return null;
  const content = (choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content;
  return typeof content === "string" ? content : null;
}

function geminiText(body: Json): string | null {
  const candidates = body?.candidates;
  if (!Array.isArray(candidates)) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } } | undefined)?.content?.parts;
  if (!Array.isArray(parts)) return null;
  return parts
    .filter((p): p is { text: string; thought?: boolean } => typeof p?.text === "string" && !p.thought)
    .map((p) => p.text)
    .join("");
}

/** Lấy văn bản trả lời; thử cả các dạng khác vì proxy đôi khi trả dạng OpenAI cho endpoint kiểu Claude. */
export function textFromProviderResponse(kind: AiProviderKindName, raw: unknown): string {
  const body = raw as Json;
  const order = { anthropic: [anthropicText, openaiText, geminiText], openai: [openaiText, anthropicText, geminiText], gemini: [geminiText, openaiText, anthropicText] }[
    AI_PROVIDER_INFO[kind].style
  ];
  for (const read of order) {
    const text = read(body);
    if (text) return text;
  }
  throw new AiError("invalid", AI_ERROR_MESSAGE.invalid);
}

// ── Phân loại lỗi → thời gian tạm nghỉ ────────────────────────────────────────

export type AiFailureReason = "quota" | "auth" | "rate_limit" | "overloaded" | "bad_request" | "network" | "invalid";

/** Key lỗi bị bỏ qua trong khoảng này rồi mới được thử lại (admin có thể đặt lại sớm hơn). */
export const AI_COOLDOWN_MS: Record<AiFailureReason, number> = {
  quota: 60 * 60_000, // hết token/credit: thử lại sau 1 giờ
  auth: 6 * 60 * 60_000, // sai/thu hồi key: gần như chắc chắn cần admin sửa
  bad_request: 30 * 60_000, // thường là sai tên model / base URL
  rate_limit: 60_000,
  overloaded: 60_000,
  network: 30_000,
  invalid: 0, // AI trả JSON hỏng: không phạt key, chỉ chuyển sang key kế tiếp
};

const QUOTA_RE =
  /insufficient[_ ]quota|credit balance|credits?\b.*(low|exhaust|insufficient)|billing|exceeded your current quota|quota exceeded|out of credits|insufficient (balance|credits?)|payment required|usage limit|spending limit/i;
const PER_MINUTE_RE = /per[ _-]?minute|PerMinute|\brpm\b|\btpm\b|requests per min|try again in \d+(\.\d+)?\s*(ms|s\b|seconds?)/i;
const AUTH_RE = /api[_ ]key[_ ]invalid|invalid[_ ]api[_ ]key|api key not valid|incorrect api key|invalid x-api-key|authentication/i;

export function classifyHttpFailure(status: number, bodyText: string): AiFailureReason {
  if (status === 401 || status === 403) return "auth";
  if (status === 402) return "quota";
  if (status === 429) {
    if (PER_MINUTE_RE.test(bodyText)) return "rate_limit";
    return QUOTA_RE.test(bodyText) || /RESOURCE_EXHAUSTED/.test(bodyText) ? "quota" : "rate_limit";
  }
  if (status >= 400 && status < 500 && status !== 408) {
    if (QUOTA_RE.test(bodyText)) return "quota";
    if (AUTH_RE.test(bodyText)) return "auth";
    return "bad_request";
  }
  return "overloaded"; // 408, 5xx, 529…
}

/** Câu lỗi ngắn gọn từ body JSON của nhà cung cấp (để admin xem), tối đa 300 ký tự. */
export function errorSnippet(bodyText: string): string {
  let msg = bodyText;
  try {
    const parsed = JSON.parse(bodyText) as unknown;
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const err = (first as { error?: unknown } | null)?.error;
    if (typeof err === "string") msg = err;
    else if (err && typeof (err as { message?: unknown }).message === "string") msg = (err as { message: string }).message;
  } catch {
    /* body không phải JSON */
  }
  return msg.replace(/\s+/g, " ").trim().slice(0, 300);
}

