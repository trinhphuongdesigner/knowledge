/** Lặp lại ngắt quãng kiểu SM-2 đơn giản. Thuần, không phụ thuộc DB. */

/** 0 = Lại, 1 = Khó, 2 = Được, 3 = Dễ */
export type Grade = 0 | 1 | 2 | 3;

export type SrsState = { ease: number; interval: number; reps: number; lapses: number };
export type SrsResult = SrsState & { due: Date };

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const LAPSE_DELAY_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const INITIAL_SRS_STATE: SrsState = { ease: DEFAULT_EASE, interval: 0, reps: 0, lapses: 0 };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function nextReview(state: SrsState, grade: Grade, now: Date = new Date()): SrsResult {
  if (grade === 0) {
    return {
      ease: round2(Math.max(MIN_EASE, state.ease - 0.2)),
      interval: 0,
      reps: 0,
      lapses: state.lapses + 1,
      due: new Date(now.getTime() + LAPSE_DELAY_MS),
    };
  }
  const delta = grade === 3 ? 0.15 : grade === 1 ? -0.15 : 0;
  const ease = round2(Math.max(MIN_EASE, state.ease + delta));
  const factor = grade === 3 ? 1.2 : grade === 1 ? 0.8 : 1;
  let interval: number;
  if (state.interval < 1) interval = 1;
  else if (state.interval === 1) interval = 3;
  else interval = Math.max(state.interval + 1, Math.round(state.interval * ease * factor));
  return {
    ease,
    interval,
    reps: state.reps + 1,
    lapses: state.lapses,
    due: new Date(now.getTime() + interval * DAY_MS),
  };
}

/** Đúng liên tiếp chừng này lần (reps reset về 0 mỗi lần quên) thì thẻ hết "khó". */
export const HARD_RECOVERED_REPS = 3;
export const HARD_MIN_LAPSES = 2;
export const HARD_MAX_EASE = 2.0;

/**
 * Thẻ "khó": quên nhiều lần hoặc ease thấp, VÀ chưa nhớ lại ổn định.
 * lapses chỉ tăng và lật thẻ / kiểm tra chỉ chấm 0|2 (không bao giờ kéo ease lên), nên thiếu điều kiện reps
 * thì thẻ đã khó sẽ khó mãi dù đã trả lời đúng nhiều lần.
 */
export function isHard(state: Pick<SrsState, "ease" | "lapses" | "reps">): boolean {
  return (state.lapses >= HARD_MIN_LAPSES || state.ease < HARD_MAX_EASE) && state.reps < HARD_RECOVERED_REPS;
}

export function gradeFromCorrect(correct: boolean): Grade {
  return correct ? 2 : 0;
}
