import "server-only";
import type { AiProvider } from "@/generated/prisma/client";
import { db } from "./db";
import type { AiSuggestionDTO } from "./validators";
import { AI_ERROR_MESSAGE, AI_TIMEOUT_MS, AiError, type AiPromptInput, parseSuggestion } from "./ai-core";
import { decryptSecret, encryptSecret } from "./ai-crypto";
import {
  AI_COOLDOWN_MS,
  type AiFailureReason,
  buildProviderCall,
  classifyHttpFailure,
  errorSnippet,
  type ProviderConfig,
  textFromProviderResponse,
} from "./ai-providers";

export { AiError } from "./ai-core";
export type { AiErrorCode } from "./ai-core";

/** Tổng thời gian cho một lượt gợi ý, kể cả khi phải thử nhiều key. */
const AI_TOTAL_BUDGET_MS = 25_000;

// ── Mã hoá key ────────────────────────────────────────────────────────────────

function encryptionSecret(): string | null {
  return process.env.AI_ENCRYPTION_KEY?.trim() || null;
}

/** Thiếu AI_ENCRYPTION_KEY thì không lưu / đọc được key trong DB. */
export function aiEncryptionReady(): boolean {
  return encryptionSecret() !== null;
}

export function encryptApiKey(plain: string): string {
  const secret = encryptionSecret();
  if (!secret) throw new Error("AI_ENCRYPTION_KEY is not set");
  return encryptSecret(plain.trim(), secret);
}

// ── Danh sách key theo thứ tự ưu tiên ─────────────────────────────────────────

/** Một key có thể dùng: `id` null = key dự phòng từ env ANTHROPIC_API_KEY (không lưu trạng thái). */
type Candidate = { id: string | null; name: string; row: AiProvider | null; config: ProviderConfig | null };

const isCooling = (p: Pick<AiProvider, "cooldownUntil">, now: Date) => !!p.cooldownUntil && p.cooldownUntil > now;

/** Key dự phòng từ env — chỉ dùng khi admin chưa thêm nhà cung cấp nào (tương thích cấu hình cũ). */
function envCandidate(): Candidate | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return {
    id: null,
    name: "env:ANTHROPIC_API_KEY",
    row: null,
    config: { kind: "ANTHROPIC", apiKey: key, baseUrl: null, model: process.env.AI_MODEL?.trim() || null },
  };
}

async function loadProviders(): Promise<AiProvider[]> {
  return db.aiProvider.findMany({ orderBy: [{ priority: "asc" }, { createdAt: "asc" }] });
}

export type AiAvailability = "disabled" | "ready" | "maintenance";

/**
 * - disabled: chưa cấu hình gì (hoặc admin tắt hết) → ẩn nút AI.
 * - maintenance: có key nhưng tất cả đang tạm nghỉ vì lỗi / hết token.
 */
export async function getAiAvailability(): Promise<AiAvailability> {
  const rows = await loadProviders();
  if (rows.length === 0) return envCandidate() ? "ready" : "disabled";
  const enabled = rows.filter((r) => r.enabled);
  if (enabled.length === 0) return "disabled";
  const now = new Date();
  return enabled.some((r) => !isCooling(r, now)) ? "ready" : "maintenance";
}

// ── Gọi một nhà cung cấp ──────────────────────────────────────────────────────

class ProviderFailure extends Error {
  constructor(
    readonly reason: AiFailureReason,
    message: string,
  ) {
    super(message);
  }
}

async function callProvider(cfg: ProviderConfig, input: AiPromptInput, deadline: number): Promise<AiSuggestionDTO> {
  const call = buildProviderCall(cfg, input);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), Math.max(1_000, Math.min(AI_TIMEOUT_MS, deadline - Date.now())));
  try {
    let res: Response;
    try {
      res = await fetch(call.url, {
        method: "POST",
        headers: call.headers,
        body: JSON.stringify(call.body),
        signal: ctrl.signal,
        cache: "no-store",
      });
    } catch (e) {
      throw new ProviderFailure("network", ctrl.signal.aborted ? "Timeout" : `Network error: ${e instanceof Error ? e.message : e}`);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ProviderFailure(classifyHttpFailure(res.status, text), `HTTP ${res.status}: ${errorSnippet(text)}`);
    }
    const body: unknown = await res.json().catch(() => null);
    try {
      return parseSuggestion(textFromProviderResponse(cfg.kind, body), input.english);
    } catch {
      throw new ProviderFailure("invalid", "Invalid or empty response");
    }
  } catch (e) {
    if (e instanceof ProviderFailure) throw e;
    throw new ProviderFailure("network", ctrl.signal.aborted ? "Timeout" : String(e));
  } finally {
    clearTimeout(timer);
  }
}

function toCandidate(row: AiProvider): Candidate {
  const secret = encryptionSecret();
  let config: ProviderConfig | null = null;
  if (secret) {
    try {
      config = { kind: row.kind, apiKey: decryptSecret(row.apiKey, secret), baseUrl: row.baseUrl, model: row.model };
    } catch {
      config = null;
    }
  }
  return { id: row.id, name: row.name, row, config };
}

async function recordSuccess(id: string | null) {
  if (!id) return;
  await db.aiProvider
    .update({ where: { id }, data: { successCount: { increment: 1 }, lastSuccessAt: new Date(), cooldownUntil: null } })
    .catch(() => {});
}

async function recordFailure(id: string | null, reason: AiFailureReason | "config", message: string) {
  if (!id) return;
  const now = new Date();
  const ms = reason === "config" ? 0 : AI_COOLDOWN_MS[reason];
  await db.aiProvider
    .update({
      where: { id },
      data: {
        failCount: { increment: 1 },
        lastError: `[${reason}] ${message}`.slice(0, 500),
        lastErrorAt: now,
        ...(ms > 0 ? { cooldownUntil: new Date(now.getTime() + ms) } : {}),
      },
    })
    .catch(() => {});
}

/** Gọi một key; ghi nhận thành công / lỗi (và thời gian tạm nghỉ) vào DB. */
async function tryCandidate(c: Candidate, input: AiPromptInput, deadline: number) {
  if (!c.config) {
    const msg = aiEncryptionReady() ? "Cannot decrypt the API key (was AI_ENCRYPTION_KEY changed?)" : "AI_ENCRYPTION_KEY is not set";
    await recordFailure(c.id, "config", msg);
    throw new ProviderFailure("auth", msg);
  }
  try {
    const result = await callProvider(c.config, input, deadline);
    await recordSuccess(c.id);
    return result;
  } catch (e) {
    const f = e instanceof ProviderFailure ? e : new ProviderFailure("network", String(e));
    await recordFailure(c.id, f.reason, f.message);
    console.warn(`[ai] provider "${c.name}" failed (${f.reason}): ${f.message}`);
    throw f;
  }
}

// ── API cho route ─────────────────────────────────────────────────────────────

/**
 * Gợi ý nghĩa/ví dụ cho một thẻ. Thử lần lượt các key đang bật (theo thứ tự ưu tiên, bỏ qua key đang tạm nghỉ);
 * key lỗi bị tạm nghỉ rồi chuyển sang key kế tiếp. Hết key → AiError("maintenance").
 */
export async function suggestCard(input: AiPromptInput): Promise<AiSuggestionDTO> {
  const rows = await loadProviders();
  let candidates: Candidate[];
  if (rows.length === 0) {
    const env = envCandidate();
    if (!env) throw new AiError("disabled", AI_ERROR_MESSAGE.disabled);
    candidates = [env];
  } else {
    const enabled = rows.filter((r) => r.enabled);
    if (enabled.length === 0) throw new AiError("disabled", AI_ERROR_MESSAGE.disabled);
    const now = new Date();
    candidates = enabled.filter((r) => !isCooling(r, now)).map(toCandidate);
  }

  const deadline = Date.now() + AI_TOTAL_BUDGET_MS;
  let attempted = false;
  let onlyInvalid = true;
  for (const c of candidates) {
    if (Date.now() > deadline - 1_000) break;
    attempted = true;
    try {
      return await tryCandidate(c, input, deadline);
    } catch (e) {
      if (!(e instanceof ProviderFailure) || e.reason !== "invalid") onlyInvalid = false;
    }
  }
  // Mọi key đều chỉ trả JSON hỏng → báo "kết quả không hợp lệ" (thử lại được); còn lại coi như bảo trì.
  if (attempted && onlyInvalid) throw new AiError("invalid", AI_ERROR_MESSAGE.invalid);
  throw new AiError("maintenance", AI_ERROR_MESSAGE.maintenance);
}

export type AiProviderTestResult = { ok: true; ms: number } | { ok: false; ms: number; reason: string; error: string };

/** Admin bấm "Kiểm tra": gọi thử đúng một key (kể cả đang tắt / tạm nghỉ) và ghi nhận kết quả. */
export async function testAiProvider(id: string): Promise<AiProviderTestResult | null> {
  const row = await db.aiProvider.findUnique({ where: { id } });
  if (!row) return null;
  const started = Date.now();
  try {
    await tryCandidate(toCandidate(row), { term: "resilient", english: true, locale: "en" }, started + AI_TIMEOUT_MS);
    return { ok: true, ms: Date.now() - started };
  } catch (e) {
    const f = e instanceof ProviderFailure ? e : new ProviderFailure("network", String(e));
    return { ok: false, ms: Date.now() - started, reason: f.reason, error: f.message };
  }
}
