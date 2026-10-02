import { describe, expect, it } from "vitest";
import { parseStudyState } from "../utils";

describe("parseStudyState", () => {
  const ids = ["a", "b", "c"];

  it("returns null for empty or unusable input", () => {
    expect(parseStudyState(null, ids)).toBeNull();
    expect(parseStudyState({ order: ["x"] }, ids)).toBeNull();
  });

  it("drops stale card ids and clamps index", () => {
    const s = parseStudyState(
      { order: ["a", "gone", "b"], known: ["a", "gone"], unknown: ["a", "b"], index: 99, shuffle: true, swap: false },
      ids,
    );
    expect(s).toEqual({ order: ["a", "b"], known: ["a"], unknown: ["b"], index: 2, shuffle: true, swap: false });
  });
});
