import { describe, expect, it } from "vitest";
import { parseStudyState } from "../utils";

describe("parseStudyState", () => {
  const ids = ["a", "b", "c"];

  it("returns null for empty or unusable input", () => {
    expect(parseStudyState(null, ids)).toBeNull();
    expect(parseStudyState({ order: ["x"] }, ids)).toBeNull();
  });

  it("keeps known cards saved by a quiz (no session order yet) and starts the session fresh", () => {
    const s = parseStudyState({ order: [], known: ["b", "gone"], unknown: ["c"], index: 5 }, ids);
    expect(s).toEqual({ order: ids, known: ["b"], unknown: ["c"], index: 0, shuffle: false, swap: false });
  });

  it("queues newly added cards after a finished session so it resumes at the first new card", () => {
    const s = parseStudyState({ order: ["a", "b"], known: ["a", "b"], unknown: [], index: 2 }, ids);
    expect(s).toEqual({ order: ["a", "b", "c"], known: ["a", "b"], unknown: [], index: 2, shuffle: false, swap: false });
  });

  it("does not re-add cards that were deliberately left out of a retry session", () => {
    const s = parseStudyState({ order: ["b"], known: ["a"], unknown: ["c"], index: 0 }, ids);
    expect(s?.order).toEqual(["b"]);
  });

  it("drops stale card ids and clamps index", () => {
    const s = parseStudyState(
      { order: ["a", "gone", "b"], known: ["a", "gone"], unknown: ["a", "b"], index: 99, shuffle: true, swap: false },
      ids,
    );
    // "c" was never seen by the saved progress, so it is queued after the old order.
    expect(s).toEqual({ order: ["a", "b", "c"], known: ["a"], unknown: ["b"], index: 2, shuffle: true, swap: false });
  });
});
