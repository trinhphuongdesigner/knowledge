import { describe, expect, it } from "vitest";
import { AiError } from "../ai-core";
import { decryptSecret, encryptSecret, keyHint } from "../ai-crypto";
import {
  AI_COOLDOWN_MS,
  buildProviderCall,
  classifyHttpFailure,
  errorSnippet,
  missingConfig,
  textFromProviderResponse,
} from "../ai-providers";

const input = { term: "resilient", english: true, locale: "vi" } as const;

describe("buildProviderCall", () => {
  it("Anthropic: default endpoint, headers and model", () => {
    const c = buildProviderCall({ kind: "ANTHROPIC", apiKey: " sk-ant ", baseUrl: null, model: null }, input);
    expect(c.url).toBe("https://api.anthropic.com/v1/messages");
    expect(c.headers["x-api-key"]).toBe("sk-ant");
    expect((c.body as { model: string }).model).toBe("claude-haiku-4-5");
  });
  it("Anthropic: base URL with or without /v1", () => {
    const a = buildProviderCall({ kind: "ANTHROPIC", apiKey: "k", baseUrl: "https://proxy.dev/", model: "m" }, input);
    const b = buildProviderCall({ kind: "ANTHROPIC", apiKey: "k", baseUrl: "https://proxy.dev/v1", model: "m" }, input);
    expect(a.url).toBe("https://proxy.dev/v1/messages");
    expect(b.url).toBe("https://proxy.dev/v1/messages");
  });
  it("OpenAI: bearer auth, system + user messages, max_completion_tokens", () => {
    const c = buildProviderCall({ kind: "OPENAI", apiKey: "sk", baseUrl: null, model: "gpt-x" }, input);
    const body = c.body as { model: string; messages: { role: string }[]; max_completion_tokens?: number };
    expect(c.url).toBe("https://api.openai.com/v1/chat/completions");
    expect(c.headers.authorization).toBe("Bearer sk");
    expect(body.model).toBe("gpt-x");
    expect(body.messages.map((m) => m.role)).toEqual(["system", "user"]);
    expect(body.max_completion_tokens).toBeGreaterThan(0);
  });
  it("Grok / compatible APIs use max_tokens and their own base URL", () => {
    const g = buildProviderCall({ kind: "GROK", apiKey: "x", baseUrl: null, model: null }, input);
    expect(g.url).toBe("https://api.x.ai/v1/chat/completions");
    expect(g.body).toHaveProperty("max_tokens");
    const o = buildProviderCall(
      { kind: "OPENAI_COMPATIBLE", apiKey: "x", baseUrl: "https://openrouter.ai/api/v1", model: "a/b" },
      input,
    );
    expect(o.url).toBe("https://openrouter.ai/api/v1/chat/completions");
  });
  it("Gemini: generateContent URL, key header, system instruction", () => {
    const c = buildProviderCall({ kind: "GEMINI", apiKey: "g", baseUrl: null, model: "models/gemini-2.5-flash" }, input);
    expect(c.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
    expect(c.headers["x-goog-api-key"]).toBe("g");
    expect(c.body).toHaveProperty("systemInstruction");
  });
});

describe("missingConfig", () => {
  it("only OpenAI-compatible requires base URL and model", () => {
    expect(missingConfig({ kind: "OPENAI", baseUrl: null, model: null })).toEqual([]);
    expect(missingConfig({ kind: "OPENAI_COMPATIBLE", baseUrl: null, model: null })).toEqual(["baseUrl", "model"]);
    expect(missingConfig({ kind: "OPENAI_COMPATIBLE", baseUrl: "https://x", model: "m" })).toEqual([]);
  });
});

describe("textFromProviderResponse", () => {
  it("reads each provider's shape", () => {
    expect(
      textFromProviderResponse("ANTHROPIC", { content: [{ type: "text", text: "a" }, { type: "tool_use" }, { type: "text", text: "b" }] }),
    ).toBe("ab");
    expect(textFromProviderResponse("OPENAI", { choices: [{ message: { content: "{}" } }] })).toBe("{}");
    expect(
      textFromProviderResponse("GEMINI", {
        candidates: [{ content: { parts: [{ text: "thinking", thought: true }, { text: "x" }] } }],
      }),
    ).toBe("x");
  });
  it("accepts an OpenAI-shaped reply from an Anthropic proxy", () => {
    expect(textFromProviderResponse("ANTHROPIC", { choices: [{ message: { content: "ok" } }] })).toBe("ok");
  });
  it("throws invalid on empty / malformed bodies", () => {
    expect(() => textFromProviderResponse("OPENAI", null)).toThrow(AiError);
    expect(() => textFromProviderResponse("GEMINI", { candidates: [] })).toThrow(AiError);
  });
});

describe("classifyHttpFailure", () => {
  it("detects exhausted quota / credits", () => {
    expect(classifyHttpFailure(429, '{"error":{"code":"insufficient_quota"}}')).toBe("quota");
    expect(classifyHttpFailure(400, '{"error":{"message":"Your credit balance is too low"}}')).toBe("quota");
    expect(classifyHttpFailure(402, "")).toBe("quota");
    expect(classifyHttpFailure(429, '{"error":{"status":"RESOURCE_EXHAUSTED","message":"quota per day"}}')).toBe("quota");
  });
  it("separates short rate limits", () => {
    expect(classifyHttpFailure(429, "Rate limit reached for requests")).toBe("rate_limit");
    expect(classifyHttpFailure(429, "Quota exceeded for metric generate_requests_per_minute")).toBe("rate_limit");
  });
  it("auth, bad request, overload", () => {
    expect(classifyHttpFailure(401, "")).toBe("auth");
    expect(classifyHttpFailure(400, '{"error":{"status":"INVALID_ARGUMENT","message":"API key not valid"}}')).toBe("auth");
    expect(classifyHttpFailure(404, "model not found")).toBe("bad_request");
    expect(classifyHttpFailure(529, "")).toBe("overloaded");
    expect(classifyHttpFailure(503, "")).toBe("overloaded");
  });
  it("quota cools down longer than a rate limit; invalid output does not cool down", () => {
    expect(AI_COOLDOWN_MS.quota).toBeGreaterThan(AI_COOLDOWN_MS.rate_limit);
    expect(AI_COOLDOWN_MS.invalid).toBe(0);
  });
});

describe("errorSnippet", () => {
  it("extracts error.message from JSON bodies (incl. Gemini arrays)", () => {
    expect(errorSnippet('{"error":{"message":"bad key"}}')).toBe("bad key");
    expect(errorSnippet('[{"error":{"message":"x"}}]')).toBe("x");
    expect(errorSnippet("plain\n text")).toBe("plain text");
    expect(errorSnippet("z".repeat(500))).toHaveLength(300);
  });
});

describe("ai-crypto", () => {
  it("round-trips and uses a random IV", () => {
    const a = encryptSecret("sk-secret", "s3cret");
    expect(a).not.toContain("sk-secret");
    expect(a).not.toBe(encryptSecret("sk-secret", "s3cret"));
    expect(decryptSecret(a, "s3cret")).toBe("sk-secret");
  });
  it("fails with the wrong secret or tampered data", () => {
    const a = encryptSecret("sk-secret", "s3cret");
    expect(() => decryptSecret(a, "other")).toThrow();
    expect(() => decryptSecret(a.slice(0, -4) + "AAAA", "s3cret")).toThrow();
  });
  it("keyHint shows the last 4 characters", () => {
    expect(keyHint(" sk-abcdef1234 ")).toBe("1234");
  });
});
