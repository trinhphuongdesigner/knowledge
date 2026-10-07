export const QUIZ_PASS_PCT = 75;

/** Bộ dưới 2 thẻ không làm kiểm tra được (khớp canQuiz ở trang chi tiết). */
export const QUIZ_MIN_CARDS = 2;

export type SetStatus = {
  mastered: boolean;
  quizBestPct: number | null;
  quizPassed: boolean;
  /** Số thẻ (còn tồn tại) đã thuộc / tổng số thẻ. */
  knownCount: number;
  cardCount: number;
  /** Đã bắt đầu học nhưng chưa xong: còn thẻ chưa thuộc, hoặc thuộc hết mà chưa đạt kiểm tra. */
  inProgress: boolean;
};

/**
 * mastered: set has ≥1 card and every card id is in known. quizPassed: quizBestPct >= QUIZ_PASS_PCT.
 * started: the user has touched the set (flashcards or quiz); an untouched set is "chưa học", not in progress.
 */
export function computeSetStatus(input: {
  cardIds: readonly string[];
  known: readonly string[];
  quizBestPct: number | null;
  started?: boolean;
}): SetStatus {
  const known = new Set(input.known);
  const cardCount = input.cardIds.length;
  const knownCount = input.cardIds.filter((id) => known.has(id)).length;
  const mastered = cardCount > 0 && knownCount === cardCount;
  const quizPassed = input.quizBestPct !== null && input.quizBestPct >= QUIZ_PASS_PCT;
  const done = mastered && (quizPassed || cardCount < QUIZ_MIN_CARDS);
  return {
    mastered,
    quizBestPct: input.quizBestPct,
    quizPassed,
    knownCount,
    cardCount,
    inProgress: !!input.started && cardCount > 0 && !done,
  };
}

/** Score of a quiz run, or null when the run did not cover every card of the set. */
export function quizRunPct(input: {
  cardIds: readonly string[];
  passed: readonly string[];
  failed: readonly string[];
}): number | null {
  const cards = new Set(input.cardIds);
  if (cards.size === 0) return null;
  // Same semantics as the PATCH route: passed wins over failed.
  const passed = new Set(input.passed.filter((id) => cards.has(id)));
  const failed = new Set(input.failed.filter((id) => cards.has(id) && !passed.has(id)));
  if (passed.size + failed.size < cards.size) return null;
  return Math.round((passed.size / cards.size) * 100);
}
