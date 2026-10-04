/** Phần thuần của gợi ý AI (không import DB / mạng) — test được bằng vitest. */
import { z } from "zod";
import type { Locale } from "@/i18n/config";

export const DEFAULT_AI_MODEL = "claude-haiku-4-5";
export const AI_TIMEOUT_MS = 10_000;
export const AI_MAX_TOKENS = 400;

export type AiErrorCode = "disabled" | "rate_limited" | "upstream" | "invalid";

export class AiError extends Error {
  readonly code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}

export const AI_ERROR_STATUS: Record<AiErrorCode, number> = {
  disabled: 503,
  rate_limited: 429,
  upstream: 502,
  invalid: 502,
};

/** English messages for logs/Error.message; API responses translate by code via AI_ERROR_KEY. */
export const AI_ERROR_MESSAGE: Record<AiErrorCode, string> = {
  disabled: "AI feature is not enabled",
  rate_limited: "AI is busy, please try again later",
  upstream: "Could not reach the AI, please try again",
  invalid: "AI returned an invalid result, please try again",
};

/** Key trong namespace errors cho từng mã lỗi AI. */
export const AI_ERROR_KEY = {
  disabled: "aiDisabled",
  rate_limited: "aiRateLimited",
  upstream: "aiUpstream",
  invalid: "aiInvalid",
} as const satisfies Record<AiErrorCode, string>;

const clean = (max: number) => z.string().transform((s) => s.trim()).pipe(z.string().max(max));

export const suggestionSchema = z.object({
  answer: clean(300).pipe(z.string().min(1)),
  explanation: clean(1000).default(""),
  partOfSpeech: clean(100).default(""),
  phonetic: clean(200).optional(),
});

/** Tên tiếng Anh của ngôn ngữ giao diện — đưa vào prompt để AI trả lời đúng ngôn ngữ người dùng cài đặt. */
export const AI_LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  vi: "Vietnamese",
  zh: "Simplified Chinese",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  fr: "French",
  th: "Thai",
};

export type AiPromptInput = { term: string; english: boolean; locale: Locale };

export function systemPrompt(locale: Locale): string {
  return `You are an assistant that creates flashcards for learners whose display language is ${AI_LANGUAGE_NAMES[locale]}. Return exactly ONE valid JSON object, with no explanation and no code block.`;
}

export function buildPrompt(input: AiPromptInput): string {
  const term = input.term.trim().slice(0, 200);
  const lang = AI_LANGUAGE_NAMES[input.locale];
  const shape = input.english
    ? `{"answer": string, "explanation": string, "partOfSpeech": string, "phonetic": string}`
    : `{"answer": string, "explanation": string, "partOfSpeech": ""}`;
  const rules = input.english
    ? [
        `English term: "${term}".`,
        input.locale === "en"
          ? `- answer: a concise English definition covering the most common senses, at most 120 characters.`
          : `- answer: a concise ${lang} meaning covering the most common senses, at most 120 characters.`,
        input.locale === "en"
          ? `- explanation: one natural English example sentence containing the word/phrase (Markdown allowed, keep it short).`
          : `- explanation: one natural English example sentence containing the word/phrase, then a line break and its ${lang} translation (Markdown allowed, keep it short).`,
        `- partOfSpeech: the part of speech in English (noun, verb, adjective, adverb, phrase...).`,
        `- phonetic: IPA transcription in the form /.../ if you are sure, otherwise an empty string.`,
      ]
    : [
        `Term (may be IT/technical): "${term}".`,
        `- answer: a short, accurate ${lang} definition, at most 200 characters.`,
        `- explanation: a short explanation or example in ${lang} (Markdown allowed, a few sentences at most).`,
        `- partOfSpeech: always an empty string.`,
      ];
  return [...rules, `Return JSON in exactly this shape: ${shape}`].join("\n");
}

export function buildRequestBody(input: AiPromptInput, model: string) {
  return {
    model,
    max_tokens: AI_MAX_TOKENS,
    system: systemPrompt(input.locale),
    messages: [{ role: "user", content: buildPrompt(input) }],
  };
}

/** Tách JSON từ phản hồi thô (có thể bọc trong ```json ... ``` hoặc kèm chữ thừa). */
export function extractJson(raw: string): unknown {
  const s = raw.trim();
  const candidates: string[] = [s];
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidates.push(fenced[1].trim());
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a !== -1 && b > a) candidates.push(s.slice(a, b + 1));
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* thử ứng viên tiếp theo */
    }
  }
  throw new AiError("invalid", AI_ERROR_MESSAGE.invalid);
}

/** Văn bản thô của AI → AiSuggestionDTO (đã validate). */
export function parseSuggestion(raw: string, english: boolean) {
  const parsed = suggestionSchema.safeParse(extractJson(raw));
  if (!parsed.success) throw new AiError("invalid", AI_ERROR_MESSAGE.invalid);
  const { answer, explanation, partOfSpeech, phonetic } = parsed.data;
  return {
    answer,
    explanation,
    partOfSpeech: english ? partOfSpeech : "",
    ...(english && phonetic ? { phonetic } : {}),
  };
}

/** Lấy phần văn bản từ body phản hồi của Messages API. */
export function textFromResponse(body: unknown): string {
  const content = (body as { content?: unknown } | null)?.content;
  if (!Array.isArray(content)) throw new AiError("invalid", AI_ERROR_MESSAGE.invalid);
  return content
    .filter((b): b is { type: "text"; text: string } => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
}

export function errorFromStatus(status: number): AiError {
  if (status === 429 || status === 529) return new AiError("rate_limited", AI_ERROR_MESSAGE.rate_limited);
  return new AiError("upstream", AI_ERROR_MESSAGE.upstream);
}
