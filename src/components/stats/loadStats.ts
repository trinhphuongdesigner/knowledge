import "server-only";
import { db } from "@/lib/db";
import { todayVN } from "@/lib/dates";
import { buildStats } from "@/lib/stats";
import type { StudyStatsDTO } from "@/lib/validators";

/** Đọc StudyDay (tối đa 400 ngày, đúng thời hạn giữ của cron cleanup) và tính thống kê. */
export async function loadStudyStats(userId: string): Promise<StudyStatsDTO> {
  const rows = await db.studyDay.findMany({
    where: { userId },
    select: { day: true, reviewed: true, correct: true, goal: true },
    orderBy: { day: "asc" },
    take: 400,
  });
  return buildStats(rows, todayVN());
}
