import { describe, expect, it } from "vitest";
import { buildHistory, countExisting, percentOf, type HistoryRow } from "../history";

const row = (o: Partial<HistoryRow>): HistoryRow => ({
  setId: "s1",
  title: "Bộ 1",
  category: { name: "Tiếng Anh", color: "BLUE" as const, isEnglish: true },
  cardIds: ["a", "b", "c", "d"],
  known: [],
  unknown: [],
  completedAt: null,
  updatedAt: new Date("2026-01-01"),
  ...o,
});

describe("percentOf", () => {
  it("handles zero total and rounds", () => {
    expect(percentOf(0, 0)).toBe(0);
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(5, 3)).toBe(100);
  });
});

describe("countExisting", () => {
  it("ignores stale and duplicate ids", () => {
    expect(countExisting(["a", "a", "x", "b"], new Set(["a", "b"]))).toBe(2);
  });
});

describe("buildHistory", () => {
  it("filters stale ids and marks completion", () => {
    const { items } = buildHistory([
      row({ known: ["a", "b", "c", "d", "gone"] }),
      row({ setId: "s2", cardIds: ["a", "b"], known: ["a"] }),
      row({ setId: "s3", cardIds: [], known: ["z"] }),
    ]);
    const by = Object.fromEntries(items.map((i) => [i.setId, i]));
    expect(by.s1).toMatchObject({ known: 4, total: 4, percent: 100, status: "completed" });
    expect(by.s2).toMatchObject({ known: 1, percent: 50, status: "learning" });
    expect(by.s3).toMatchObject({ known: 0, total: 0, percent: 0, status: "learning" });
  });

  it("orders by last studied desc and aggregates words vs cards", () => {
    const other = { name: "Toán", color: "ROSE" as const, isEnglish: false };
    const { items, summary } = buildHistory([
      row({ setId: "old", known: ["a"], updatedAt: new Date("2026-01-01") }),
      row({ setId: "new", category: other, known: ["a", "b"], updatedAt: new Date("2026-02-01") }),
    ]);
    expect(items.map((i) => i.setId)).toEqual(["new", "old"]);
    expect(summary).toEqual({ sets: 2, known: 3, total: 8, percent: 38, knownWords: 1, knownCards: 2 });
  });

  it("handles empty input", () => {
    expect(buildHistory([]).summary).toMatchObject({ sets: 0, known: 0, total: 0, percent: 0 });
  });
});
