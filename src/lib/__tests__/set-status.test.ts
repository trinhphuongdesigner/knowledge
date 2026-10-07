import { describe, expect, it } from "vitest";
import { QUIZ_PASS_PCT, computeSetStatus, quizRunPct } from "../set-status";

describe("computeSetStatus", () => {
  it("is mastered only when every card is known", () => {
    expect(computeSetStatus({ cardIds: ["a", "b"], known: ["a", "b", "x"], quizBestPct: null }).mastered).toBe(true);
    expect(computeSetStatus({ cardIds: ["a", "b"], known: ["a"], quizBestPct: null }).mastered).toBe(false);
  });
  it("empty set is never mastered", () => {
    expect(computeSetStatus({ cardIds: [], known: [], quizBestPct: null }).mastered).toBe(false);
  });
  it("quizPassed uses the threshold", () => {
    expect(computeSetStatus({ cardIds: ["a"], known: [], quizBestPct: QUIZ_PASS_PCT }).quizPassed).toBe(true);
    expect(computeSetStatus({ cardIds: ["a"], known: [], quizBestPct: QUIZ_PASS_PCT - 1 }).quizPassed).toBe(false);
    expect(computeSetStatus({ cardIds: ["a"], known: [], quizBestPct: null }).quizPassed).toBe(false);
  });
  it("counts only known ids that still exist", () => {
    const s = computeSetStatus({ cardIds: ["a", "b", "c"], known: ["a", "x"], quizBestPct: null });
    expect([s.knownCount, s.cardCount]).toEqual([1, 3]);
  });
  it("inProgress: started with unknown cards, or mastered without a passing quiz", () => {
    const base = { cardIds: ["a", "b"], started: true };
    expect(computeSetStatus({ ...base, known: [], quizBestPct: null, started: false }).inProgress).toBe(false);
    expect(computeSetStatus({ ...base, known: ["a"], quizBestPct: null }).inProgress).toBe(true);
    expect(computeSetStatus({ ...base, known: ["a", "b"], quizBestPct: null }).inProgress).toBe(true);
    expect(computeSetStatus({ ...base, known: ["a", "b"], quizBestPct: QUIZ_PASS_PCT - 1 }).inProgress).toBe(true);
    expect(computeSetStatus({ ...base, known: ["a", "b"], quizBestPct: QUIZ_PASS_PCT }).inProgress).toBe(false);
    // Passing the quiz alone is not enough while cards are still unknown.
    expect(computeSetStatus({ ...base, known: ["a"], quizBestPct: 100 }).inProgress).toBe(true);
  });
  it("a 1-card set (no quiz possible) is done once mastered", () => {
    expect(computeSetStatus({ cardIds: ["a"], known: ["a"], quizBestPct: null, started: true }).inProgress).toBe(false);
  });
});

describe("quizRunPct", () => {
  const cardIds = ["a", "b", "c", "d"];
  it("scores a full run", () => {
    expect(quizRunPct({ cardIds, passed: ["a", "b", "c"], failed: ["d"] })).toBe(75);
  });
  it("returns null for partial runs", () => {
    expect(quizRunPct({ cardIds, passed: ["a"], failed: ["b"] })).toBeNull();
  });
  it("passed wins over failed and duplicates/unknown ids are ignored", () => {
    expect(quizRunPct({ cardIds, passed: ["a", "a", "b", "z"], failed: ["a", "c", "d"] })).toBe(50);
  });
  it("returns null for an empty set", () => {
    expect(quizRunPct({ cardIds: [], passed: [], failed: [] })).toBeNull();
  });
});
