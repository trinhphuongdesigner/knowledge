import "server-only";
import type { AiSuggestionDTO } from "./validators";
import {
  AI_ERROR_MESSAGE,
  AI_TIMEOUT_MS,
  AiError,
  DEFAULT_AI_MODEL,
  type AiPromptInput,
  buildRequestBody,
  errorFromStatus,
  parseSuggestion,
  textFromResponse,
} from "./ai-core";

export { AiError } from "./ai-core";
export type { AiErrorCode } from "./ai-core";

const API_URL = "https://api.anthropic.com/v1/messages";

export function aiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY?.trim();
}

/** Gọi Claude (Messages API qua fetch) gợi ý nghĩa/ví dụ cho một thẻ. Ném `AiError` khi lỗi. */
export async function suggestCard(input: AiPromptInput): Promise<AiSuggestionDTO> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) throw new AiError("disabled", AI_ERROR_MESSAGE.disabled);
  const model = process.env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify(buildRequestBody(input, model)),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw errorFromStatus(res.status);
    const body: unknown = await res.json().catch(() => null);
    return parseSuggestion(textFromResponse(body), input.english);
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError("upstream", AI_ERROR_MESSAGE.upstream);
  } finally {
    clearTimeout(timer);
  }
}
