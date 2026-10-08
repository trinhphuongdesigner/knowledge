import { resolveLocale } from "@/i18n/config";
import { getTFor } from "@/i18n/server";
import { recordJobRun } from "@/lib/cleanup";
import { todayVN } from "@/lib/dates";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { needsReminder } from "@/lib/stats";
import { dueTodayWhere } from "@/components/review/queries";

export const REMINDER_BATCH = 500;
const CONCURRENCY = 10;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export type ReminderResult = { checked: number; sent: number; skipped: number; failed: number };

type Candidate = { id: string; uiLanguage: string | null };

/** Nhắc học theo `uiLanguage` của NGƯỜI NHẬN (cron không có cookie/phiên). */
async function buildReminder(c: Candidate, dueCount: number) {
  const t = await getTFor(resolveLocale({ user: c, cookie: undefined }), "errors");
  return {
    type: "REVIEW_REMINDER" as const,
    title: t("notify.reminderTitle"),
    body: t("notify.reminderDue", { count: dueCount }),
    href: "/review",
  };
}

async function process1(c: Candidate, today: Date, now: Date): Promise<"sent" | "skipped" | "failed"> {
  // Cùng điều kiện với danh sách ôn hôm nay (/review) → số trong thông báo khớp số thẻ thật sự ôn.
  const [day, dueCount] = await Promise.all([
    db.studyDay.findUnique({ where: { userId_day: { userId: c.id, day: today } }, select: { reviewed: true } }),
    db.cardReview.count({ where: dueTodayWhere(c.id, now) }),
  ]);
  const doneToday = day?.reviewed ?? 0;
  if (!needsReminder({ doneToday, dueCount })) {
    await db.user.update({ where: { id: c.id }, data: { lastReminderAt: now } });
    return "skipped";
  }
  // notify() không ném lỗi: lưu thông báo trong app + đẩy tới thiết bị (nếu có); lỗi push không làm hỏng lần chạy.
  await notify(c.id, await buildReminder(c, dueCount));
  await db.user.update({ where: { id: c.id }, data: { lastReminderAt: now } });
  return "sent";
}

/** Gửi nhắc học cho user bật pushReminders, tối đa 1 lần/ngày VN, tối đa REMINDER_BATCH user mỗi lần. */
export async function runReminders(now = new Date()): Promise<ReminderResult> {
  const today = todayVN(now);
  const startOfTodayVN = new Date(today.getTime() - VN_OFFSET_MS);
  try {
    const users = await db.user.findMany({
      where: {
        pushReminders: true,
        OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: startOfTodayVN } }],
      },
      select: { id: true, uiLanguage: true },
      orderBy: [{ lastReminderAt: { sort: "asc", nulls: "first" } }, { id: "asc" }],
      take: REMINDER_BATCH,
    });
    const result: ReminderResult = { checked: users.length, sent: 0, skipped: 0, failed: 0 };
    for (let i = 0; i < users.length; i += CONCURRENCY) {
      const outcomes = await Promise.all(
        users.slice(i, i + CONCURRENCY).map((u) =>
          process1(u, today, now).catch((e) => {
            console.error("[reminders] user failed", e);
            return "failed" as const;
          }),
        ),
      );
      for (const o of outcomes) result[o]++;
    }
    await recordJobRun("reminders", true, result, now);
    return result;
  } catch (e) {
    await recordJobRun("reminders", false, { error: e instanceof Error ? e.message : String(e) }, now);
    throw e;
  }
}
