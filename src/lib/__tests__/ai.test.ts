import { describe, expect, it } from "vitest";
import {
  AiError,
  AI_MAX_TOKENS,
  buildPrompt,
  buildRequestBody,
  errorFromStatus,
  extractJson,
  parseSuggestion,
  textFromResponse,
} from "../ai-core";

describe("buildPrompt", () => {
  it("English prompt asks for meaning, example, POS, IPA", () => {
    const p = buildPrompt({ term: " resilient ", english: true });
    expect(p).toContain('"resilient"');
    expect(p).toContain("120");
    expect(p).toContain("phonetic");
  });
  it("non-English prompt asks for a definition", () => {
    const p = buildPrompt({ term: "idempotent", english: false });
    expect(p).toContain("định nghĩa");
    expect(p).not.toContain("IPA");
  });
  it("request body is small and uses the given model", () => {
    const b = buildRequestBody({ term: "a", english: true }, "claude-haiku-4-5");
    expect(b.model).toBe("claude-haiku-4-5");
    expect(b.max_tokens).toBe(AI_MAX_TOKENS);
    expect(b.messages[0].role).toBe("user");
  });
});

describe("extractJson / parseSuggestion", () => {
  const obj = { answer: "kiên cường", explanation: "She is resilient.", partOfSpeech: "adjective", phonetic: "/rɪˈzɪliənt/" };
  it("parses raw, fenced and chatty JSON", () => {
    const raw = JSON.stringify(obj);
    expect(extractJson(raw)).toEqual(obj);
    expect(extractJson("```json\n" + raw + "\n```")).toEqual(obj);
    expect(extractJson("Đây là kết quả: " + raw + " Hết.")).toEqual(obj);
  });
  it("throws invalid on garbage", () => {
    expect(() => extractJson("không có json")).toThrow(AiError);
  });
  it("validates and trims", () => {
    const r = parseSuggestion(JSON.stringify({ ...obj, answer: "  ok  " }), true);
    expect(r).toEqual({ ...obj, answer: "ok" });
  });
  it("drops POS and phonetic for non-English; drops empty phonetic", () => {
    expect(parseSuggestion(JSON.stringify(obj), false)).toEqual({
      answer: obj.answer,
      explanation: obj.explanation,
      partOfSpeech: "",
    });
    expect(parseSuggestion(JSON.stringify({ ...obj, phonetic: "" }), true)).not.toHaveProperty("phonetic");
  });
  it("rejects missing answer / wrong types", () => {
    expect(() => parseSuggestion(JSON.stringify({ explanation: "x" }), true)).toThrow(AiError);
    expect(() => parseSuggestion(JSON.stringify({ answer: 5 }), true)).toThrow(AiError);
    expect(() => parseSuggestion(JSON.stringify({ answer: "   " }), true)).toThrow(AiError);
  });
});

describe("textFromResponse / errorFromStatus", () => {
  it("joins text blocks", () => {
    expect(
      textFromResponse({ content: [{ type: "text", text: "a" }, { type: "tool_use" }, { type: "text", text: "b" }] }),
    ).toBe("ab");
  });
  it("throws on malformed body", () => {
    expect(() => textFromResponse(null)).toThrow(AiError);
    expect(() => textFromResponse({})).toThrow(AiError);
  });
  it("maps statuses", () => {
    expect(errorFromStatus(429).code).toBe("rate_limited");
    expect(errorFromStatus(529).code).toBe("rate_limited");
    expect(errorFromStatus(500).code).toBe("upstream");
    expect(errorFromStatus(401).code).toBe("upstream");
  });
});
