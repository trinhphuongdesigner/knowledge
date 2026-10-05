import { addDays, dayKey } from "./dates";
import type { StudyStatsDTO } from "./validators";

export const STATS_DAYS = 90;

export type StudyDayRow = { day: Date; reviewed: number; correct: number; goal: number };

/**
 * Ngày giữ được chuỗi: số thẻ đã thuộc (`correct`) đạt mục tiêu của CHÍNH ngày đó.
 * `goal` được ghi vào StudyDay khi ôn / đổi cài đặt trong ngày, nên đổi mục tiêu về sau
 * không làm thay đổi kết quả của các ngày đã qua.
 */
export function metGoal(r: Pick<StudyDayRow, "correct" | "goal">): boolean {
  return r.correct > 0 && r.correct >= r.goal;
}

/**
 * Streak từ danh sách ngày đạt mục tiêu (khoá "YYYY-MM-DD", không cần sắp xếp, trùng được).
 * `current`: chuỗi kết thúc hôm nay hoặc hôm qua (hôm nay chưa đạt thì chuỗi vẫn "còn sống").
 * `longest`: chuỗi liên tiếp dài nhất.
 */
export function computeStreak(days: readonly string[], today: Date): { current: number; longest: number } {
  const set = new Set(days);
  if (set.size === 0) return { current: 0, longest: 0 };

  const sorted = [...set].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const expected = dayKey(addDays(new Date(`${sorted[i - 1]}T00:00:00Z`), 1));
    run = sorted[i] === expected ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  let cursor = today;
  if (!set.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  let current = 0;
  while (set.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}

/** Gộp các dòng StudyDay thành StudyStatsDTO (chuỗi 90 ngày lấp số 0, độ chính xác 0..1). */
export function buildStats(rows: readonly StudyDayRow[], today: Date): StudyStatsDTO {
  const byDay = new Map<string, StudyDayRow>();
  let totalReviewed = 0;
  let totalCorrect = 0;
  for (const r of rows) {
    const key = dayKey(r.day);
    const prev = byDay.get(key);
    byDay.set(
      key,
      prev ? { day: r.day, reviewed: prev.reviewed + r.reviewed, correct: prev.correct + r.correct, goal: r.goal } : r,
    );
    totalReviewed += r.reviewed;
    totalCorrect += r.correct;
  }

  const met = [...byDay.entries()].filter(([, r]) => metGoal(r)).map(([k]) => k);
  const { current, longest } = computeStreak(met, today);

  const days: StudyStatsDTO["days"] = [];
  for (let i = STATS_DAYS - 1; i >= 0; i--) {
    const key = dayKey(addDays(today, -i));
    const r = byDay.get(key);
    days.push({ day: key, reviewed: r?.reviewed ?? 0, correct: r?.correct ?? 0 });
  }

  return {
    streak: current,
    longestStreak: longest,
    days,
    totalReviewed,
    accuracy: totalReviewed > 0 ? Math.min(1, totalCorrect / totalReviewed) : 0,
  };
}

/**
 * Có nên gửi email nhắc học hôm nay không: chưa học thẻ nào hôm nay
 * và (đang có thẻ đến hạn hoặc ít nhất có bộ thẻ để học).
 */
export function needsReminder(s: { doneToday: number; dueCount: number; hasCards: boolean; goal: number }): boolean {
  if (s.doneToday > 0 || s.doneToday >= s.goal) return false;
  return s.dueCount > 0 || s.hasCards;
}
