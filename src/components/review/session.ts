/** Logic thuần cho phiên ôn hằng ngày (không phụ thuộc DB / React). */
import { nextReview, type Grade, type SrsState } from "../../lib/srs";

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

/** "10 phút", "3 giờ", "1 ngày", "3 ngày", "2 tháng", "1 năm". */
export function formatDelay(ms: number): string {
  if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MIN_MS))} phút`;
  if (ms < DAY_MS) return `${Math.round(ms / HOUR_MS)} giờ`;
  const days = Math.round(ms / DAY_MS);
  if (days < 30) return `${days} ngày`;
  if (days < 365) return `${Math.max(1, Math.round(days / 30))} tháng`;
  return `${Math.max(1, Math.round(days / 365))} năm`;
}

export const GRADE_LABELS: Record<Grade, string> = { 0: "Lại", 1: "Khó", 2: "Được", 3: "Dễ" };

/** Nhãn khoảng cách đến lần ôn kế tiếp cho từng nút bấm. */
export function previewLabels(state: SrsState, now: Date = new Date()): Record<Grade, string> {
  const out = {} as Record<Grade, string>;
  for (const g of [0, 1, 2, 3] as const) {
    out[g] = formatDelay(nextReview(state, g, now).due.getTime() - now.getTime());
  }
  return out;
}

/**
 * Phiên ôn: toàn bộ thẻ đến hạn (đã sắp từ cũ → mới), rồi thêm thẻ mới cho đến khi
 * tổng số thẻ đã ôn hôm nay + trong phiên đạt `goal`. Thẻ đến hạn luôn được giữ đủ.
 */
export function buildSession<T>(due: T[], fresh: T[], opts: { goal: number; doneToday: number }): T[] {
  const remaining = Math.max(0, opts.goal - opts.doneToday);
  const room = Math.max(0, remaining - due.length);
  return [...due, ...fresh.slice(0, room)];
}

export type ReviewOnly = "starred" | "hard";

export function parseOnly(v: string | string[] | undefined): ReviewOnly | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "starred" || s === "hard" ? s : undefined;
}
