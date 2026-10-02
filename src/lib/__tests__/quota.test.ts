import { describe, expect, it } from "vitest";
import { DEFAULT_QUOTA, evaluateQuota, parseQuota } from "../quota-limits";

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
