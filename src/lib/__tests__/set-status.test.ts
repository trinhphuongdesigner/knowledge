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
