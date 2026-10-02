import { describe, expect, it } from "vitest";
import { buildSession, formatDelay, parseOnly, previewLabels } from "../session";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe("formatDelay", () => {
  it("formats minutes, hours, days, months, years", () => {
    expect(formatDelay(10 * MIN)).toBe("10 phút");
    expect(formatDelay(30 * 1000)).toBe("1 phút");
    expect(formatDelay(3 * 60 * MIN)).toBe("3 giờ");
    expect(formatDelay(DAY)).toBe("1 ngày");
    expect(formatDelay(3 * DAY)).toBe("3 ngày");
    expect(formatDelay(60 * DAY)).toBe("2 tháng");
    expect(formatDelay(400 * DAY)).toBe("1 năm");
  });
});

describe("previewLabels", () => {
  it("new card", () => {
    const l = previewLabels({ ease: 2.5, interval: 0, reps: 0, lapses: 0 });
    expect(l[0]).toBe("10 phút");
    expect(l[1]).toBe("1 ngày");
    expect(l[2]).toBe("1 ngày");
    expect(l[3]).toBe("1 ngày");
  });
  it("mature card gets longer for Dễ than Khó", () => {
    const l = previewLabels({ ease: 2.5, interval: 30, reps: 5, lapses: 0 });
    expect(l[0]).toBe("10 phút");
    expect(l[3]).not.toBe(l[1]);
  });
  it("interval 1 goes to 3 days", () => {
    expect(previewLabels({ ease: 2.5, interval: 1, reps: 1, lapses: 0 })[2]).toBe("3 ngày");
  });
});

describe("buildSession", () => {
  it("tops up new cards until goal", () => {
    expect(buildSession(["d1", "d2"], ["n1", "n2", "n3", "n4"], { goal: 5, doneToday: 0 })).toEqual(["d1", "d2", "n1", "n2", "n3"]);
  });
  it("accounts for cards done today", () => {
    expect(buildSession(["d1"], ["n1", "n2", "n3"], { goal: 5, doneToday: 3 })).toEqual(["d1", "n1"]);
  });
  it("keeps all due even beyond goal, adds no new", () => {
    expect(buildSession(["a", "b", "c"], ["n"], { goal: 2, doneToday: 0 })).toEqual(["a", "b", "c"]);
  });
  it("empty when goal met and nothing due", () => {
    expect(buildSession([], ["n"], { goal: 5, doneToday: 9 })).toEqual([]);
  });
});

describe("parseOnly", () => {
  it("accepts known values", () => {
    expect(parseOnly("starred")).toBe("starred");
    expect(parseOnly(["hard"])).toBe("hard");
    expect(parseOnly("x")).toBeUndefined();
    expect(parseOnly(undefined)).toBeUndefined();
  });
});
