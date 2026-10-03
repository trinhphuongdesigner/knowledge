import { describe, expect, it } from "vitest";
import { DEFAULT_QUOTA, effectiveLimits, evaluateQuota, parseQuota } from "../quota-limits";

describe("parseQuota", () => {
  it("uses defaults", () => expect(parseQuota({})).toEqual(DEFAULT_QUOTA));
  it("applies valid env overrides, ignores invalid", () => {
    const q = parseQuota({ QUOTA_SETS_PER_USER: "10", QUOTA_CARDS_PER_SET: "abc", QUOTA_AI_PER_DAY: " 5 ", QUOTA_CARDS_PER_USER: "-1" });
    expect(q.setsPerUser).toBe(10);
    expect(q.cardsPerSet).toBe(DEFAULT_QUOTA.cardsPerSet);
    expect(q.aiPerDay).toBe(5);
    expect(q.cardsPerUser).toBe(DEFAULT_QUOTA.cardsPerUser);
  });
});

describe("evaluateQuota", () => {
  const usage = { sets: 100, cards: 4990, subscriptions: 200 };
  it("blocks sets over limit", () => expect(evaluateQuota(DEFAULT_QUOTA, usage, { sets: 1 })).toMatch(/100 bộ/));
  it("allows under limit", () => expect(evaluateQuota(DEFAULT_QUOTA, { ...usage, sets: 5 }, { sets: 1 })).toBeNull());
  it("blocks per-user cards", () => expect(evaluateQuota(DEFAULT_QUOTA, usage, { cards: 11 })).toMatch(/5000 thẻ/));
  it("blocks per-set cards", () =>
    expect(evaluateQuota(DEFAULT_QUOTA, { ...usage, cards: 0 }, { cards: 10, setId: "x" }, 1995)).toMatch(/2000 thẻ/));
  it("blocks subscriptions", () => expect(evaluateQuota(DEFAULT_QUOTA, usage, { subscriptions: 1 })).toMatch(/200/));
  it("empty request passes", () => expect(evaluateQuota(DEFAULT_QUOTA, usage, {})).toBeNull());
});

describe("effectiveLimits", () => {
  it("returns base when there are no overrides", () => {
    expect(effectiveLimits(DEFAULT_QUOTA)).toEqual(DEFAULT_QUOTA);
    expect(effectiveLimits(DEFAULT_QUOTA, null)).toEqual(DEFAULT_QUOTA);
    expect(effectiveLimits(DEFAULT_QUOTA, { quotaSets: null, quotaCards: null, quotaAiPerDay: null })).toEqual(DEFAULT_QUOTA);
  });
  it("applies set / card / AI overrides and keeps the rest", () => {
    const l = effectiveLimits(DEFAULT_QUOTA, { quotaSets: 5, quotaCards: 100, quotaAiPerDay: 7 });
    expect(l.setsPerUser).toBe(5);
    expect(l.cardsPerUser).toBe(100);
    expect(l.aiPerDay).toBe(7);
    expect(l.cardsPerSet).toBe(DEFAULT_QUOTA.cardsPerSet);
    expect(l.subscriptionsPerUser).toBe(DEFAULT_QUOTA.subscriptionsPerUser);
  });
  it("treats 0 as a real override but ignores negative / fractional values", () => {
    expect(effectiveLimits(DEFAULT_QUOTA, { quotaAiPerDay: 0 }).aiPerDay).toBe(0);
    expect(effectiveLimits(DEFAULT_QUOTA, { quotaSets: -1, quotaCards: 1.5 })).toEqual(DEFAULT_QUOTA);
  });
  it("does not mutate base", () => {
    const base = { ...DEFAULT_QUOTA };
    effectiveLimits(base, { quotaSets: 1 });
    expect(base).toEqual(DEFAULT_QUOTA);
  });
});
