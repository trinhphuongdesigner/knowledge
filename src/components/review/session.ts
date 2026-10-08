/** Logic thuần cho phiên ôn hằng ngày (không phụ thuộc DB / React). */
import type { TFunction } from "../../i18n/translate";
import { LAPSE_DELAY_MS, nextReview, type Grade, type SrsState } from "../../lib/srs";

export type ReviewT = TFunction<"review">;

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

/** "10 min", "3 hours", "1 day", "3 days", "2 months", "1 year" (translated). */
export function formatDelay(ms: number, t: ReviewT): string {
  if (ms < HOUR_MS) return t("delay.minutes", { count: Math.max(1, Math.round(ms / MIN_MS)) });
  if (ms < DAY_MS) return t("delay.hours", { count: Math.round(ms / HOUR_MS) });
  const days = Math.round(ms / DAY_MS);
  if (days < 30) return t("delay.days", { count: days });
  if (days < 365) return t("delay.months", { count: Math.max(1, Math.round(days / 30)) });
  return t("delay.years", { count: Math.max(1, Math.round(days / 365)) });
}

/** Translation keys (namespace "review") of the grade button labels. */
export const GRADE_KEYS = { 0: "grade.again", 1: "grade.hard", 2: "grade.good", 3: "grade.easy" } as const satisfies Record<Grade, string>;

/**
 * Nhãn khoảng cách đến lần ôn kế tiếp cho từng nút bấm. Tính theo `interval` (số ngày lịch),
 * không theo `due - now`: hạn rơi vào 0:00 nên học lúc 21:00 thì "1 ngày" chỉ còn 3 giờ.
 * `due` = hạn hiện tại của thẻ, để tính cả phần cộng thêm khi ôn trễ giống server. Không tính fuzz (±5%).
 */
export function previewLabels(state: SrsState, t: ReviewT, now: Date = new Date(), due?: Date): Record<Grade, string> {
  const out = {} as Record<Grade, string>;
  for (const g of [0, 1, 2, 3] as const) {
    out[g] = formatDelay(g === 0 ? LAPSE_DELAY_MS : nextReview(state, g, now, due).interval * DAY_MS, t);
  }
  return out;
}

/**
 * Thẻ bấm "Lại" được đưa xuống cuối phiên (với trạng thái sau khi quên): phiên hôm nay chỉ xong
 * khi mọi thẻ đến hạn đã được nhớ lại ít nhất một lần.
 */
export function requeueLapse<T extends { state: SrsState }>(queue: readonly T[], index: number, grade: Grade): T[] {
  const item = queue[index];
  if (grade !== 0 || !item) return [...queue];
  return [...queue, { ...item, state: nextReview(item.state, 0) }];
}

export type ReviewOnly = "starred" | "hard";

export function parseOnly(v: string | string[] | undefined): ReviewOnly | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "starred" || s === "hard" ? s : undefined;
}

/** Cách ôn thẻ tiếng Anh: gõ từ từ nghĩa tiếng Việt, hoặc lật thẻ tự chấm. */
export type ReviewMode = "typing" | "flip";

export const REVIEW_MODE_STORAGE_KEY = "review-mode";

export function parseReviewMode(v: string | null | undefined): ReviewMode {
  return v === "flip" ? "flip" : "typing";
}

/**
 * Điểm SRS tự chấm từ kết quả gõ: sai/bỏ qua → Lại, đúng nhờ gợi ý → Khó, đúng → Được.
 * "Dễ" chỉ có khi người dùng chủ động bấm "Quá dễ" sau khi trả lời đúng.
 */
export function typingGrade(result: { correct: boolean; hintsUsed: number }): Grade {
  if (!result.correct) return 0;
  return result.hintsUsed > 0 ? 1 : 2;
}
