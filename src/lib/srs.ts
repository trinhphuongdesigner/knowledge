/** Lặp lại ngắt quãng kiểu SM-2 (gần với Anki v2). Thuần, không phụ thuộc DB. */
import { dayKey, daysBetweenVN, startOfDayVN, todayVN } from "./dates";

/** 0 = Lại, 1 = Khó, 2 = Được, 3 = Dễ */
export type Grade = 0 | 1 | 2 | 3;

export type SrsState = { ease: number; interval: number; reps: number; lapses: number };
export type SrsResult = SrsState & { due: Date };

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const LAPSE_DELAY_MS = 10 * 60 * 1000;

export const INITIAL_SRS_STATE: SrsState = { ease: DEFAULT_EASE, interval: 0, reps: 0, lapses: 0 };

const LAPSE_EASE_PENALTY = 0.2;
const HARD_EASE_DELTA = -0.15;
const EASY_EASE_DELTA = 0.15;
/** "Được" kéo ease thấp dần về lại DEFAULT_EASE — lật thẻ / kiểm tra chỉ chấm 0|2 nên không có cách nào khác để ease đi lên. */
const GOOD_EASE_RECOVERY = 0.05;
const HARD_FACTOR = 1.2;
const EASY_BONUS = 1.3;
/** Thẻ mới / đang học lại: Khó, Được → 1 ngày; Dễ → 4 ngày. */
const NEW_EASY_INTERVAL = 4;
/** Bước thứ hai (interval 1): Khó 2, Được 3, Dễ 5 ngày (mức tối thiểu, ôn trễ có thể dài hơn). */
const SECOND_STEP = { 1: 2, 2: 3, 3: 5 } as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Ease mới sau một lần trả lời đúng. */
function nextEase(ease: number, grade: 1 | 2 | 3): number {
  if (grade === 1) return round2(Math.max(MIN_EASE, ease + HARD_EASE_DELTA));
  if (grade === 3) return round2(Math.max(MIN_EASE, ease + EASY_EASE_DELTA));
  return ease < DEFAULT_EASE ? round2(Math.min(DEFAULT_EASE, ease + GOOD_EASE_RECOVERY)) : ease;
}

/**
 * Khoảng cách mới (ngày) cho cả ba nút đúng, tính cùng lúc để luôn có Khó < Được < Dễ.
 * `delay` = số ngày thẻ đã quá hạn mà vẫn nhớ → được cộng thêm (Khó 1/4, Được 1/2, Dễ toàn bộ).
 */
function successIntervals(state: SrsState, delay: number): Record<1 | 2 | 3, number> {
  const ivl = state.interval;
  if (ivl < 1) return { 1: 1, 2: 1, 3: NEW_EASY_INTERVAL };
  const min = ivl === 1 ? SECOND_STEP : { 1: ivl + 1, 2: 0, 3: 0 };
  const hard = Math.max(min[1], Math.round((ivl + delay / 4) * HARD_FACTOR));
  const good = Math.max(min[2], hard + 1, Math.round((ivl + delay / 2) * nextEase(state.ease, 2)));
  const easy = Math.max(min[3], good + 1, Math.round((ivl + delay) * nextEase(state.ease, 3) * EASY_BONUS));
  return { 1: hard, 2: good, 3: easy };
}

/**
 * Trạng thái sau một lần trả lời. `prevDue` = hạn cũ của thẻ: trả lời đúng khi đã quá hạn thì
 * những ngày trễ đó được tính là thời gian thẻ vẫn nhớ (không truyền = coi như ôn đúng hạn).
 */
export function nextReview(state: SrsState, grade: Grade, now: Date = new Date(), prevDue?: Date): SrsResult {
  if (grade === 0) {
    // Đang học lại (đã quên, chưa nhớ lại lần nào): quên tiếp trong lúc học lại không phạt thêm,
    // nếu không mỗi lần bấm "Lại" trong cùng một phiên lại trừ ease / cộng lapses một lần nữa.
    const relearning = state.interval === 0 && state.lapses > 0;
    return {
      ease: relearning ? state.ease : round2(Math.max(MIN_EASE, state.ease - LAPSE_EASE_PENALTY)),
      interval: 0,
      reps: 0,
      lapses: relearning ? state.lapses : state.lapses + 1,
      due: new Date(now.getTime() + LAPSE_DELAY_MS),
    };
  }
  const delay = state.interval >= 1 && prevDue ? Math.max(0, daysBetweenVN(prevDue, now)) : 0;
  const interval = successIntervals(state, delay)[grade];
  return {
    ease: nextEase(state.ease, grade),
    interval,
    reps: state.reps + 1,
    lapses: state.lapses,
    // Hạn theo ngày lịch giờ VN: "sau 1 ngày" = từ 0:00 ngày mai, không phải đủ 24 giờ.
    due: startOfDayVN(now, interval),
  };
}

/** Băm chuỗi FNV-1a 32 bit — đủ để rải đều, không dùng cho bảo mật. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Lệch ngẫu nhiên nhưng tất định (theo `seed`) khoảng ±5% để các thẻ học cùng ngày không dồn hết
 * vào cùng một ngày đến hạn. Dưới 3 ngày giữ nguyên; từ 7 ngày lệch ít nhất ±1 ngày.
 */
export function fuzzInterval(interval: number, seed: string): number {
  if (interval < 3) return interval;
  const range = Math.max(interval >= 7 ? 1 : 0, Math.round(interval * 0.05));
  if (range === 0) return interval;
  return interval + (hash32(seed) % (2 * range + 1)) - range;
}

/**
 * Thẻ có thuộc lượt ôn hôm nay không: hạn rơi vào hôm nay hoặc đã quá hạn, hoặc thẻ đang học lại
 * sau khi quên (interval 0) — kể cả khi 10 phút chờ sau lần quên vắt qua nửa đêm.
 */
export function isDueToday(review: { due: Date; interval: number }, now: Date = new Date()): boolean {
  return review.interval === 0 || review.due < startOfDayVN(now, 1);
}

/**
 * Lịch mới sau một lần trả lời, hoặc null nếu giữ nguyên lịch cũ. `prev` = null: thẻ chưa từng được ôn.
 * Trả lời ĐÚNG khi thẻ chưa đến hạn (ôn sớm qua học thẻ / kiểm tra) không tính là một chu kỳ — nếu không,
 * học rồi kiểm tra vài lần trong cùng một ngày sẽ đẩy thẻ 1 → 3 → 8 ngày mà chưa hề cách quãng.
 * Trả lời SAI thì luôn về đầu chu kỳ, vì người học đã quên thật.
 * `cardId`: có thì rải hạn bằng fuzzInterval (seed = cardId + ngày VN), không bao giờ ngắn hơn interval cũ + 1.
 */
export function scheduleReview(
  prev: (SrsState & { due: Date }) | null,
  grade: Grade,
  now: Date = new Date(),
  opts: { cardId?: string } = {},
): SrsResult | null {
  if (prev && grade > 0 && !isDueToday(prev, now)) return null;
  const res = nextReview(prev ?? INITIAL_SRS_STATE, grade, now, prev?.due);
  if (grade === 0 || opts.cardId === undefined) return res;
  const fuzzed = fuzzInterval(res.interval, `${opts.cardId}:${dayKey(todayVN(now))}`);
  const interval = Math.max(fuzzed, (prev?.interval ?? 0) + 1);
  return interval === res.interval ? res : { ...res, interval, due: startOfDayVN(now, interval) };
}

/** Đúng liên tiếp chừng này lần (reps reset về 0 mỗi lần quên) thì thẻ hết "khó". */
export const HARD_RECOVERED_REPS = 3;
export const HARD_MIN_LAPSES = 2;
export const HARD_MAX_EASE = 2.0;

/**
 * Thẻ "khó": quên nhiều lần hoặc ease thấp, VÀ chưa nhớ lại ổn định.
 * lapses chỉ tăng và lật thẻ / kiểm tra chỉ chấm 0|2 (ease chỉ hồi rất chậm), nên thiếu điều kiện reps
 * thì thẻ đã khó sẽ khó mãi dù đã trả lời đúng nhiều lần.
 */
export function isHard(state: Pick<SrsState, "ease" | "lapses" | "reps">): boolean {
  return (state.lapses >= HARD_MIN_LAPSES || state.ease < HARD_MAX_EASE) && state.reps < HARD_RECOVERED_REPS;
}

export function gradeFromCorrect(correct: boolean): Grade {
  return correct ? 2 : 0;
}
