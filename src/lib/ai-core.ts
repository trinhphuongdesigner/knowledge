/** Phần thuần của gợi ý AI (không import DB / mạng) — test được bằng vitest. */
import { z } from "zod";

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

export const AI_ERROR_MESSAGE: Record<AiErrorCode, string> = {
  disabled: "Tính năng AI chưa được bật",
  rate_limited: "AI đang bận, vui lòng thử lại sau ít phút",
  upstream: "Không kết nối được AI, vui lòng thử lại",
  invalid: "AI trả về kết quả không hợp lệ, vui lòng thử lại",
};

const clean = (max: number) => z.string().transform((s) => s.trim()).pipe(z.string().max(max));

export const suggestionSchema = z.object({
  answer: clean(300).pipe(z.string().min(1)),
  explanation: clean(1000).default(""),
  partOfSpeech: clean(100).default(""),
  phonetic: clean(200).optional(),
});

export const SYSTEM_PROMPT =
  "Bạn là trợ lý tạo thẻ ghi nhớ cho người Việt học tập. Chỉ trả về MỘT đối tượng JSON hợp lệ, không kèm lời giải thích hay khối mã.";

export function buildPrompt(input: { term: string; english: boolean }): string {
  const term = input.term.trim().slice(0, 200);
  const shape = input.english
    ? `{"answer": string, "explanation": string, "partOfSpeech": string, "phonetic": string}`
    : `{"answer": string, "explanation": string, "partOfSpeech": ""}`;
  const rules = input.english
    ? [
        `Thuật ngữ tiếng Anh: "${term}".`,
        `- answer: nghĩa tiếng Việt ngắn gọn, nêu các nghĩa phổ biến nhất, tối đa 120 ký tự.`,
        `- explanation: một câu ví dụ tiếng Anh tự nhiên có chứa từ/cụm đó, xuống dòng rồi kèm bản dịch tiếng Việt (có thể dùng Markdown, ngắn gọn).`,
        `- partOfSpeech: từ loại bằng tiếng Anh (noun, verb, adjective, adverb, phrase...).`,
        `- phonetic: phiên âm IPA dạng /.../ nếu chắc chắn, nếu không thì chuỗi rỗng.`,
      ]
    : [
        `Thuật ngữ (có thể là CNTT/kỹ thuật): "${term}".`,
        `- answer: định nghĩa tiếng Việt ngắn gọn, chính xác, tối đa 200 ký tự.`,
        `- explanation: giải thích hoặc ví dụ ngắn (Markdown được phép, tối đa vài câu).`,
        `- partOfSpeech: luôn là chuỗi rỗng.`,
      ];
  return [...rules, `Trả về JSON đúng dạng: ${shape}`].join("\n");
}

export function buildRequestBody(input: { term: string; english: boolean }, model: string) {
  return {
    model,
    max_tokens: AI_MAX_TOKENS,
    system: SYSTEM_PROMPT,
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
