import { db } from "./db";

export const RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CleanupResult = { sessions: number; loginAttempts: number };

/** Deletes expired sessions and LoginAttempt rows older than RETENTION_DAYS. */
export async function runCleanup(now = new Date()): Promise<CleanupResult> {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS);
  const [sessions, loginAttempts] = await Promise.all([
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);
  return { sessions: sessions.count, loginAttempts: loginAttempts.count };
}
