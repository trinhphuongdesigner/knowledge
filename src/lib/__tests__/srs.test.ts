import { describe, expect, it } from "vitest";
import { gradeFromCorrect, INITIAL_SRS_STATE, isHard, MIN_EASE, nextReview, type SrsState } from "../srs";

const now = new Date("2026-10-02T00:00:00Z");
const DAY = 86_400_000;
const st = (p: Partial<SrsState>): SrsState => ({ ...INITIAL_SRS_STATE, ...p });

describe("nextReview", () => {
  it("Lại: lapse, reset, due in 10 minutes, ease -0.2", () => {
    const r = nextReview(st({ ease: 2.5, interval: 10, reps: 4, lapses: 1 }), 0, now);
    expect(r).toMatchObject({ ease: 2.3, interval: 0, reps: 0, lapses: 2 });
    expect(r.due.getTime() - now.getTime()).toBe(10 * 60_000);
  });
  it("ease never drops below 1.3", () => {
    expect(nextReview(st({ ease: 1.3 }), 0, now).ease).toBe(MIN_EASE);
    expect(nextReview(st({ ease: 1.35, interval: 5 }), 1, now).ease).toBe(MIN_EASE);
  });
  it("new card -> 1 day, then 3 days", () => {
    const a = nextReview(INITIAL_SRS_STATE, 2, now);
    expect(a).toMatchObject({ interval: 1, reps: 1, ease: 2.5 });
    expect(a.due.getTime() - now.getTime()).toBe(DAY);
    const b = nextReview(a, 2, now);
    expect(b).toMatchObject({ interval: 3, reps: 2 });
  });
  it("Được: interval * ease", () => {
    expect(nextReview(st({ interval: 3, reps: 2 }), 2, now)).toMatchObject({ interval: 8, ease: 2.5 });
  });
  it("Dễ: ease +0.15 and x1.2", () => {
    const r = nextReview(st({ interval: 10, reps: 3 }), 3, now);
    expect(r.ease).toBe(2.65);
    expect(r.interval).toBe(Math.round(10 * 2.65 * 1.2));
  });
  it("Khó: ease -0.15 and x0.8", () => {
    const r = nextReview(st({ interval: 10, reps: 3 }), 1, now);
    expect(r.ease).toBe(2.35);
    expect(r.interval).toBe(Math.round(10 * 2.35 * 0.8));
  });
  it("interval always grows on success", () => {
    expect(nextReview(st({ ease: 1.3, interval: 2, reps: 2 }), 1, now).interval).toBeGreaterThan(2);
  });
  it("lapses preserved on success", () => {
    expect(nextReview(st({ lapses: 3, interval: 1 }), 2, now).lapses).toBe(3);
  });
});

describe("isHard / gradeFromCorrect", () => {
  it("flags lapses >= 2 or ease < 2", () => {
    expect(isHard({ ease: 2.5, lapses: 2 })).toBe(true);
    expect(isHard({ ease: 1.9, lapses: 0 })).toBe(true);
    expect(isHard({ ease: 2.0, lapses: 1 })).toBe(false);
  });
  it("maps correctness to grade", () => {
    expect(gradeFromCorrect(true)).toBe(2);
    expect(gradeFromCorrect(false)).toBe(0);
  });
});
