import { describe, expect, it } from "vitest";
import { buildStats, computeStreak } from "../stats";

const today = new Date("2026-10-10T00:00:00Z");
const d = (s: string) => new Date(`${s}T00:00:00Z`);

describe("computeStreak", () => {
  it("is 0 for no days", () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0 });
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-10-08", "2026-10-09", "2026-10-10"], today)).toEqual({ current: 3, longest: 3 });
  });

  it("keeps the streak alive when only yesterday was studied", () => {
    expect(computeStreak(["2026-10-08", "2026-10-09"], today)).toEqual({ current: 2, longest: 2 });
  });

  it("breaks when the last study day is 2+ days ago", () => {
    expect(computeStreak(["2026-10-07", "2026-10-08"], today)).toEqual({ current: 0, longest: 2 });
  });

  it("tracks the longest run separately from the current one", () => {
    const days = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-10-09", "2026-10-10"];
    expect(computeStreak(days, today)).toEqual({ current: 2, longest: 4 });
  });

  it("handles unsorted and duplicate input, and month boundaries", () => {
    expect(computeStreak(["2026-10-01", "2026-09-30", "2026-10-01", "2026-09-29"], d("2026-10-01"))).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("a single isolated day today counts as 1", () => {
    expect(computeStreak(["2026-10-10"], today)).toEqual({ current: 1, longest: 1 });
  });
});

describe("buildStats", () => {
  it("returns zeros for no rows with a 90-day series", () => {
    const s = buildStats([], today);
    expect(s.days).toHaveLength(90);
    expect(s.days[89]).toEqual({ day: "2026-10-10", reviewed: 0, correct: 0 });
    expect(s.days[0].day).toBe("2026-07-13");
    expect(s).toMatchObject({ streak: 0, longestStreak: 0, totalReviewed: 0, accuracy: 0 });
  });

  it("fills gaps and computes totals, accuracy, streak", () => {
    const s = buildStats(
      [
        { day: d("2026-10-10"), reviewed: 10, correct: 8 },
        { day: d("2026-10-09"), reviewed: 10, correct: 5 },
        { day: d("2026-10-05"), reviewed: 20, correct: 20 },
      ],
      today,
    );
    expect(s.totalReviewed).toBe(40);
    expect(s.accuracy).toBeCloseTo(33 / 40);
    expect(s.streak).toBe(2);
    expect(s.longestStreak).toBe(2);
    expect(s.days.find((x) => x.day === "2026-10-08")).toEqual({ day: "2026-10-08", reviewed: 0, correct: 0 });
    expect(s.days.find((x) => x.day === "2026-10-05")?.reviewed).toBe(20);
  });

  it("keeps older history in totals and longest streak but outside the 90-day series", () => {
    const rows = [0, 1, 2, 3, 4].map((i) => ({ day: d(`2026-05-0${i + 1}`), reviewed: 5, correct: 5 }));
    const s = buildStats(rows, today);
    expect(s.longestStreak).toBe(5);
    expect(s.totalReviewed).toBe(25);
    expect(s.days.every((x) => x.reviewed === 0)).toBe(true);
  });

  it("ignores rows with 0 reviewed for the streak", () => {
    const s = buildStats([{ day: d("2026-10-10"), reviewed: 0, correct: 0 }], today);
    expect(s.streak).toBe(0);
  });
});

import { needsReminder } from "../stats";

describe("needsReminder", () => {
  it("reminds users with due cards who have not studied", () => {
    expect(needsReminder({ doneToday: 0, dueCount: 5, hasCards: true, goal: 20 })).toBe(true);
  });
  it("reminds users with cards but nothing due (daily goal not hit)", () => {
    expect(needsReminder({ doneToday: 0, dueCount: 0, hasCards: true, goal: 20 })).toBe(true);
  });
  it("skips users who already studied today", () => {
    expect(needsReminder({ doneToday: 3, dueCount: 5, hasCards: true, goal: 20 })).toBe(false);
  });
  it("skips users without any cards", () => {
    expect(needsReminder({ doneToday: 0, dueCount: 0, hasCards: false, goal: 20 })).toBe(false);
  });
});
