import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASE,
  fuzzInterval,
  gradeFromCorrect,
  INITIAL_SRS_STATE,
  isDueToday,
  isHard,
  MIN_EASE,
  nextReview,
  scheduleReview,
  type Grade,
  type SrsState,
} from "../srs";

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
    // Hạn rơi vào 0:00 (giờ VN) của ngày hôm sau, không phải đúng 24 giờ sau.
    expect(a.due.toISOString()).toBe("2026-10-02T17:00:00.000Z");
    const b = nextReview(a, 2, now);
    expect(b).toMatchObject({ interval: 3, reps: 2 });
  });
  it("Được: interval * ease", () => {
    expect(nextReview(st({ interval: 3, reps: 2 }), 2, now)).toMatchObject({ interval: 8, ease: 2.5 });
  });
  it("Dễ: ease +0.15 and x ease x1.3", () => {
    const r = nextReview(st({ interval: 10, reps: 3 }), 3, now);
    expect(r.ease).toBe(2.65);
    expect(r.interval).toBe(Math.round(10 * 2.65 * 1.3));
  });
  it("Khó: ease -0.15 and x1.2 (independent of ease)", () => {
    const r = nextReview(st({ interval: 10, reps: 3 }), 1, now);
    expect(r.ease).toBe(2.35);
    expect(r.interval).toBe(12);
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
    expect(isHard({ ease: 2.5, lapses: 2, reps: 0 })).toBe(true);
    expect(isHard({ ease: 1.9, lapses: 0, reps: 2 })).toBe(true);
    expect(isHard({ ease: 2.0, lapses: 1, reps: 0 })).toBe(false);
  });
  it("stops flagging once recalled 3 times in a row", () => {
    expect(isHard({ ease: 1.5, lapses: 5, reps: 3 })).toBe(false);
  });
  it("a hard card recovers after correct answers and turns hard again on a new lapse", () => {
    let s: SrsState = INITIAL_SRS_STATE;
    // Hai lần quên thật (xen giữa một lần nhớ lại), không phải bấm "Lại" liên tiếp khi đang học lại.
    s = nextReview(nextReview(nextReview(s, 0, now), 2, now), 0, now);
    expect(isHard(s)).toBe(true);
    for (let i = 0; i < 3; i++) s = nextReview(s, 2, now);
    expect(isHard(s)).toBe(false);
    s = nextReview(s, 0, now);
    expect(isHard(s)).toBe(true);
  });
  it("maps correctness to grade", () => {
    expect(gradeFromCorrect(true)).toBe(2);
    expect(gradeFromCorrect(false)).toBe(0);
  });
});

describe("isDueToday", () => {
  // now = 07:00 ngày 02/10 giờ VN; hôm nay kết thúc lúc 2026-10-02T17:00Z.
  it("due any time before the end of today (VN) counts", () => {
    expect(isDueToday({ due: new Date("2026-10-02T16:59:59Z"), interval: 3 }, now)).toBe(true);
    expect(isDueToday({ due: new Date("2026-09-20T00:00:00Z"), interval: 3 }, now)).toBe(true);
  });
  it("due tomorrow does not count", () => {
    expect(isDueToday({ due: new Date("2026-10-02T17:00:00Z"), interval: 1 }, now)).toBe(false);
  });
  it("a lapsed card (interval 0) is due even if its 10-minute delay crosses midnight", () => {
    expect(isDueToday({ due: new Date("2026-10-02T17:05:00Z"), interval: 0 }, now)).toBe(true);
  });
});

describe("scheduleReview", () => {
  const notDue = { ...st({ ease: 2.5, interval: 3, reps: 2 }), due: new Date(now.getTime() + 2 * DAY) };
  // Hạn đúng hôm nay (0:00 VN ngày 02/10) → không trễ ngày nào.
  const due = { ...st({ ease: 2.5, interval: 3, reps: 2 }), due: new Date("2026-10-01T17:00:00Z") };
  it("schedules a never-reviewed card", () => {
    expect(scheduleReview(null, 2, now)).toMatchObject({ interval: 1, reps: 1 });
  });
  it("correct answer on a card not yet due keeps the schedule", () => {
    expect(scheduleReview(notDue, 2, now)).toBeNull();
    expect(scheduleReview(notDue, 3, now)).toBeNull();
  });
  it("wrong answer always resets, even before the due date", () => {
    expect(scheduleReview(notDue, 0, now)).toMatchObject({ interval: 0, reps: 0, lapses: 1 });
  });
  it("due card advances normally", () => {
    expect(scheduleReview(due, 2, now)).toMatchObject({ interval: 8, reps: 3 });
  });
});

describe("relearning (no repeated penalty)", () => {
  it("first failure of a new card is still penalised", () => {
    expect(nextReview(INITIAL_SRS_STATE, 0, now)).toMatchObject({ ease: 2.3, interval: 0, reps: 0, lapses: 1 });
  });
  it("failing again while relearning keeps ease and lapses", () => {
    const once = nextReview(st({ ease: 2.5, interval: 10, reps: 4, lapses: 0 }), 0, now);
    const later = new Date(now.getTime() + 15 * 60_000);
    const twice = nextReview(once, 0, later);
    expect(twice).toMatchObject({ ease: once.ease, lapses: once.lapses, interval: 0, reps: 0 });
    expect(twice.due.getTime() - later.getTime()).toBe(10 * 60_000);
    expect(nextReview(twice, 0, later)).toMatchObject({ ease: 2.3, lapses: 1 });
  });
  it("a lapse after a successful relearn counts again", () => {
    const relearned = nextReview(nextReview(st({ interval: 10, reps: 4 }), 0, now), 2, now);
    expect(nextReview(relearned, 0, now)).toMatchObject({ lapses: 2 });
  });
});

describe("Hard < Good < Easy", () => {
  const intervals = (s: SrsState, due?: Date) =>
    ([1, 2, 3] as const).map((g: Grade) => nextReview(s, g, now, due).interval);
  it("new / relearning card: 1, 1, 4 days", () => {
    expect(intervals(INITIAL_SRS_STATE)).toEqual([1, 1, 4]);
    expect(intervals(st({ ease: 2.1, interval: 0, lapses: 2 }))).toEqual([1, 1, 4]);
  });
  it("second step (interval 1): 2, 3, 5 days", () => {
    expect(intervals(st({ interval: 1, reps: 1 }))).toEqual([2, 3, 5]);
    expect(intervals(st({ interval: 1, reps: 1, ease: MIN_EASE }))).toEqual([2, 3, 5]);
  });
  it("mature card: interval x1.2, x ease, x ease x1.3", () => {
    expect(intervals(st({ interval: 10, reps: 3 }))).toEqual([12, 25, 34]);
  });
  it("stays strictly increasing and above the old interval even at minimum ease", () => {
    for (const interval of [2, 3, 5, 10, 50]) {
      const [h, g, e] = intervals(st({ interval, reps: 3, ease: MIN_EASE }));
      expect(h).toBeGreaterThan(interval);
      expect(g).toBeGreaterThan(h);
      expect(e).toBeGreaterThan(g);
    }
  });
});

describe("late review credit", () => {
  // Hạn 0:00 VN ngày 22/09, trả lời lúc 07:00 VN ngày 02/10 → trễ 10 ngày.
  const lateDue = new Date("2026-09-21T17:00:00Z");
  const s = st({ ease: 2.5, interval: 3, reps: 2 });
  it("adds the overdue days (Hard 1/4, Good 1/2, Easy all)", () => {
    expect(nextReview(s, 1, now, lateDue).interval).toBe(Math.round((3 + 10 / 4) * 1.2));
    expect(nextReview(s, 2, now, lateDue).interval).toBe(Math.round((3 + 10 / 2) * 2.5));
    expect(nextReview(s, 3, now, lateDue).interval).toBe(Math.round((3 + 10) * 2.65 * 1.3));
  });
  it("late answers get more than on-time ones", () => {
    for (const g of [1, 2, 3] as const) {
      expect(nextReview(s, g, now, lateDue).interval).toBeGreaterThan(nextReview(s, g, now).interval);
    }
  });
  it("no credit when due today, due in the future, or for a new / relearning card", () => {
    const today = new Date("2026-10-01T17:00:00Z");
    expect(nextReview(s, 2, now, today).interval).toBe(8);
    expect(nextReview(s, 2, now, new Date("2026-10-05T17:00:00Z")).interval).toBe(8);
    expect(nextReview(st({ interval: 0, lapses: 1 }), 3, now, lateDue).interval).toBe(4);
  });
  it("scheduleReview passes the previous due date", () => {
    expect(scheduleReview({ ...s, due: lateDue }, 2, now)).toMatchObject({ interval: 20, reps: 3 });
  });
});

describe("ease recovery", () => {
  it("Được raises a low ease by 0.05", () => {
    expect(nextReview(st({ ease: 1.9, interval: 5, reps: 1 }), 2, now).ease).toBe(1.95);
  });
  it("is capped at the default ease and never lowers a higher ease", () => {
    expect(nextReview(st({ ease: 2.48, interval: 5 }), 2, now).ease).toBe(DEFAULT_EASE);
    expect(nextReview(st({ ease: 2.8, interval: 5 }), 2, now).ease).toBe(2.8);
  });
  it("Khó / Dễ keep their deltas", () => {
    expect(nextReview(st({ ease: 1.9, interval: 5 }), 1, now).ease).toBe(1.75);
    expect(nextReview(st({ ease: 1.9, interval: 5 }), 3, now).ease).toBe(2.05);
  });
  it("hard status is still governed by reps", () => {
    let s = st({ ease: 1.5, lapses: 3, interval: 0 });
    s = nextReview(s, 2, now);
    expect(isHard(s)).toBe(true);
    s = nextReview(nextReview(s, 2, now), 2, now);
    expect(s.ease).toBe(1.65);
    expect(isHard(s)).toBe(false);
  });
});

describe("fuzzInterval", () => {
  const seeds = Array.from({ length: 200 }, (_, i) => `card-${i}:2026-10-02`);
  it("is deterministic", () => {
    expect(fuzzInterval(40, "abc:2026-10-02")).toBe(fuzzInterval(40, "abc:2026-10-02"));
  });
  it("leaves short intervals alone", () => {
    for (const i of [0, 1, 2, 3, 4, 5, 6]) for (const seed of seeds) expect(fuzzInterval(i, seed)).toBe(i);
  });
  it("stays within ±5% (at least ±1 day from 7 days) and spreads across seeds", () => {
    for (const [i, r] of [[7, 1], [10, 1], [20, 1], [40, 2], [100, 5]] as const) {
      const out = new Set(seeds.map((seed) => fuzzInterval(i, seed)));
      for (const v of out) expect(Math.abs(v - i)).toBeLessThanOrEqual(r);
      expect(out.size).toBe(2 * r + 1);
    }
  });
});

describe("scheduleReview with fuzz", () => {
  const due = { ...st({ ease: 2.5, interval: 20, reps: 4 }), due: new Date("2026-10-01T17:00:00Z") };
  it("fuzzes by card and day, recomputing due", () => {
    const out = new Set<number>();
    for (let i = 0; i < 50; i++) {
      const r = scheduleReview(due, 2, now, { cardId: `c${i}` })!;
      expect(Math.abs(r.interval - 50)).toBeLessThanOrEqual(3);
      expect(r.due.getTime()).toBe(new Date("2026-10-01T17:00:00Z").getTime() + r.interval * DAY);
      out.add(r.interval);
    }
    expect(out.size).toBeGreaterThan(1);
    expect(scheduleReview(due, 2, now, { cardId: "c1" })).toEqual(scheduleReview(due, 2, now, { cardId: "c1" }));
  });
  it("never fuzzes the 10-minute lapse or a short interval", () => {
    const lapse = scheduleReview(due, 0, now, { cardId: "c1" })!;
    expect(lapse.due.getTime() - now.getTime()).toBe(10 * 60_000);
    expect(scheduleReview(null, 2, now, { cardId: "c1" })).toMatchObject({ interval: 1 });
  });
  it("never goes below the previous interval + 1", () => {
    const short = { ...st({ ease: MIN_EASE, interval: 6, reps: 3 }), due: new Date("2026-10-01T17:00:00Z") };
    for (let i = 0; i < 50; i++) expect(scheduleReview(short, 1, now, { cardId: `c${i}` })!.interval).toBeGreaterThanOrEqual(7);
  });
});
