import { db } from "../db";

export const WINDOW_LOGIN_MS = 15 * 60 * 1000;
export const WINDOW_REGISTER_MS = 60 * 60 * 1000;
export const MAX_EMAIL_FAILURES = 5;
export const MAX_IP_FAILURES = 20;
export const MAX_REGISTER_PER_IP = 5;
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000;
/** Marker stored in LoginAttempt.email for registration attempts. */
const REGISTER_MARKER = "register:attempt";

export const RATE_LIMIT_MESSAGE = "Thử lại sau ít phút";

// ── Pure threshold logic (unit-tested) ────────────────────────────────────
export function isLoginBlocked(counts: { emailFailures: number; ipFailures: number | null }): boolean {
  return counts.emailFailures >= MAX_EMAIL_FAILURES || (counts.ipFailures ?? 0) >= MAX_IP_FAILURES;
}

export function isRegisterBlocked(ipAttempts: number | null): boolean {
  return (ipAttempts ?? 0) >= MAX_REGISTER_PER_IP;
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

export async function checkLoginAllowed(email: string, ip: string | null): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_LOGIN_MS);
  const [emailFailures, ipFailures] = await Promise.all([
    db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    ip ? db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }) : Promise.resolve(null),
  ]);
  return !isLoginBlocked({ emailFailures, ipFailures });
}

export async function recordLoginAttempt(email: string, ip: string | null, success: boolean): Promise<void> {
  await db.loginAttempt.create({ data: { email, ip, success } });
  if (success) await db.loginAttempt.deleteMany({ where: { email, success: false } });
  if (Math.random() < 0.05) await cleanup().catch(() => undefined);
}

export async function checkRegisterAllowed(ip: string | null): Promise<boolean> {
  if (!ip) return true;
  const n = await db.loginAttempt.count({
    where: { email: REGISTER_MARKER, ip, createdAt: { gte: new Date(Date.now() - WINDOW_REGISTER_MS) } },
  });
  return !isRegisterBlocked(n);
}

export async function recordRegisterAttempt(ip: string | null): Promise<void> {
  await db.loginAttempt.create({ data: { email: REGISTER_MARKER, ip, success: true } });
  if (Math.random() < 0.05) await cleanup().catch(() => undefined);
}
