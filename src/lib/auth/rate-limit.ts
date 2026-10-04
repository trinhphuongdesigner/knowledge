import { db } from "../db";

export const WINDOW_LOGIN_MS = 15 * 60 * 1000;
export const MAX_EMAIL_FAILURES = 5;
export const MAX_IP_FAILURES = 20;
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000; // opportunistic; the daily cron (lib/cleanup.ts) is the 30-day backstop
/** LoginAttempt.email cho lần thử mà token không hợp lệ (chưa biết email). */
export const INVALID_TOKEN_MARKER = "google:invalid";

// ── Pure threshold logic (unit-tested) ────────────────────────────────────
export function isLoginBlocked(counts: { emailFailures: number; ipFailures: number | null }): boolean {
  return counts.emailFailures >= MAX_EMAIL_FAILURES || (counts.ipFailures ?? 0) >= MAX_IP_FAILURES;
}

/** First hop of x-forwarded-for, then x-real-ip. */
export function getClientIp(h: { get(name: string): string | null }): string | null {
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;
  return h.get("x-real-ip")?.trim() || null;
}

// ── DB-backed ─────────────────────────────────────────────────────────────
async function cleanup() {
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - CLEANUP_AFTER_MS) } } });
}

/** `email` = null khi chưa xác minh được token (chỉ giới hạn theo IP). */
export async function checkLoginAllowed(email: string | null, ip: string | null): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_LOGIN_MS);
  const [emailFailures, ipFailures] = await Promise.all([
    email
      ? db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } })
      : Promise.resolve(0),
    ip ? db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }) : Promise.resolve(null),
  ]);
  return !isLoginBlocked({ emailFailures, ipFailures });
}

export async function recordLoginAttempt(email: string, ip: string | null, success: boolean): Promise<void> {
  await db.loginAttempt.create({ data: { email, ip, success } });
  if (success) await db.loginAttempt.deleteMany({ where: { email, success: false } });
  if (Math.random() < 0.05) await cleanup().catch(() => undefined);
}
