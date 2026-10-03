import { db } from "./db";
import { addDays } from "./dates";
import { notificationCutoffs } from "./notifications-core";

export const RETENTION_DAYS = 30;
export const AI_USAGE_RETENTION_DAYS = 30;
export const STUDY_DAY_RETENTION_DAYS = 400;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CleanupResult = {
  sessions: number;
  loginAttempts: number;
  aiUsage: number;
  studyDays: number;
  notifications: number;
};

/** Ghi lần chạy gần nhất của một cron vào JobRun (kể cả khi lỗi, ok=false). Không bao giờ ném lỗi. */
export async function recordJobRun(name: string, ok: boolean, result: unknown, now = new Date()): Promise<void> {
  const data = { lastRunAt: now, ok, result: JSON.parse(JSON.stringify(result ?? null)) ?? undefined };
  try {
    await db.jobRun.upsert({ where: { name }, create: { name, ...data }, update: data });
  } catch (e) {
    console.error(`[jobrun] không ghi được JobRun "${name}"`, e);
  }
}

/**
 * Xoá: session hết hạn, LoginAttempt > 30 ngày,
 * AiUsage > 30 ngày, StudyDay > 400 ngày,
 * Notification đã đọc > 30 ngày hoặc bất kỳ > 90 ngày. Ghi JobRun "cleanup" (cả khi lỗi, rồi ném lại lỗi).
 */
export async function runCleanup(now = new Date()): Promise<CleanupResult> {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * DAY_MS);
  const nc = notificationCutoffs(now);
  const day = (n: number) => addDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), -n);
  try {
    const [sessions, loginAttempts, aiUsage, studyDays, notifications] = await Promise.all([
      db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
      db.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      db.aiUsage.deleteMany({ where: { day: { lt: day(AI_USAGE_RETENTION_DAYS) } } }),
      db.studyDay.deleteMany({ where: { day: { lt: day(STUDY_DAY_RETENTION_DAYS) } } }),
      db.notification.deleteMany({
        where: { OR: [{ readAt: { not: null }, createdAt: { lt: nc.read } }, { createdAt: { lt: nc.all } }] },
      }),
    ]);
    const result: CleanupResult = {
      sessions: sessions.count,
      loginAttempts: loginAttempts.count,
      aiUsage: aiUsage.count,
      studyDays: studyDays.count,
      notifications: notifications.count,
    };
    await recordJobRun("cleanup", true, result, now);
    return result;
  } catch (e) {
    await recordJobRun("cleanup", false, { error: e instanceof Error ? e.message : String(e) }, now);
    throw e;
  }
}
