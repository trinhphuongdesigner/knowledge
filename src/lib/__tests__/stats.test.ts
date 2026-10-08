import { describe, expect, it } from "vitest";
import { buildStats, computeStreak, metGoal } from "../stats";

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

describe("metGoal", () => {
  it("needs correct >= goal", () => {
    expect(metGoal({ correct: 20, goal: 20 })).toBe(true);
    expect(metGoal({ correct: 19, goal: 20 })).toBe(false);
    expect(metGoal({ correct: 0, goal: 0 })).toBe(false);
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
        { day: d("2026-10-10"), reviewed: 10, correct: 8, goal: 5 },
        { day: d("2026-10-09"), reviewed: 10, correct: 5, goal: 5 },
        { day: d("2026-10-05"), reviewed: 20, correct: 20, goal: 20 },
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
    const rows = [0, 1, 2, 3, 4].map((i) => ({ day: d(`2026-05-0${i + 1}`), reviewed: 5, correct: 5, goal: 5 }));
    const s = buildStats(rows, today);
    expect(s.longestStreak).toBe(5);
    expect(s.totalReviewed).toBe(25);
    expect(s.days.every((x) => x.reviewed === 0)).toBe(true);
  });

  it("only counts days whose correct count met that day's goal", () => {
    // Day 1 met the goal, days 2–3 studied but fell short → the streak resets.
    const s = buildStats(
      [
        { day: d("2026-10-08"), reviewed: 25, correct: 20, goal: 20 },
        { day: d("2026-10-09"), reviewed: 15, correct: 10, goal: 20 },
        { day: d("2026-10-10"), reviewed: 30, correct: 19, goal: 20 },
      ],
      today,
    );
    expect(s.streak).toBe(0);
    expect(s.longestStreak).toBe(1);
  });

  it("judges each day against the goal stored for that day, not the current one", () => {
    // 7 days at goal 10, then 3 days at goal 20 — all met → 10, not 3.
    const rows = Array.from({ length: 10 }, (_, i) => ({
      day: d(`2026-10-${String(i + 1).padStart(2, "0")}`),
      reviewed: i < 7 ? 12 : 22,
      correct: i < 7 ? 10 : 20,
      goal: i < 7 ? 10 : 20,
    }));
    const s = buildStats(rows, today);
    expect(s.streak).toBe(10);
    expect(s.longestStreak).toBe(10);
  });

  it("keeps the streak alive while today's goal is not met yet", () => {
    const s = buildStats(
      [
        { day: d("2026-10-09"), reviewed: 20, correct: 20, goal: 20 },
        { day: d("2026-10-10"), reviewed: 5, correct: 5, goal: 20 },
      ],
      today,
    );
    expect(s.streak).toBe(1);
  });

  it("ignores rows with 0 reviewed for the streak", () => {
    const s = buildStats([{ day: d("2026-10-10"), reviewed: 0, correct: 0, goal: 20 }], today);
    expect(s.streak).toBe(0);
  });
});

import { needsReminder } from "../stats";

describe("needsReminder", () => {
  it("reminds users with due cards who have not studied", () => {
    expect(needsReminder({ doneToday: 0, dueCount: 5 })).toBe(true);
  });
  it("skips users with nothing due", () => {
    expect(needsReminder({ doneToday: 0, dueCount: 0 })).toBe(false);
  });
  it("skips users who already studied today", () => {
    expect(needsReminder({ doneToday: 3, dueCount: 5 })).toBe(false);
  });
});
