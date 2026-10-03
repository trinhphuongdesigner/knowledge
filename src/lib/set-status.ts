export const QUIZ_PASS_PCT = 75;

export type SetStatus = { mastered: boolean; quizBestPct: number | null; quizPassed: boolean };

/** mastered: set has ≥1 card and every card id is in known. quizPassed: quizBestPct >= QUIZ_PASS_PCT. */
export function computeSetStatus(input: {
  cardIds: readonly string[];
  known: readonly string[];
  quizBestPct: number | null;
}): SetStatus {
  const known = new Set(input.known);
  const mastered = input.cardIds.length > 0 && input.cardIds.every((id) => known.has(id));
  return {
    mastered,
    quizBestPct: input.quizBestPct,
    quizPassed: input.quizBestPct !== null && input.quizBestPct >= QUIZ_PASS_PCT,
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
