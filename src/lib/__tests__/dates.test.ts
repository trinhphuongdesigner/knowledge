import { describe, expect, it } from "vitest";
import { addDays, dayKey, daysBetweenVN, startOfDayVN, todayVN } from "../dates";

describe("dates", () => {
  it("todayVN rolls over at 17:00 UTC (00:00 VN)", () => {
    expect(dayKey(todayVN(new Date("2026-10-02T16:59:59Z")))).toBe("2026-10-02");
    expect(dayKey(todayVN(new Date("2026-10-02T17:00:00Z")))).toBe("2026-10-03");
  });
  it("todayVN returns UTC midnight", () => {
    expect(todayVN(new Date("2026-10-02T05:30:00Z")).toISOString()).toBe("2026-10-02T00:00:00.000Z");
  });
  it("handles month and year boundaries", () => {
    expect(dayKey(todayVN(new Date("2026-12-31T18:00:00Z")))).toBe("2027-01-01");
  });
  it("addDays adds and subtracts", () => {
    const d = new Date("2026-03-01T00:00:00Z");
    expect(dayKey(addDays(d, -1))).toBe("2026-02-28");
    expect(dayKey(addDays(d, 31))).toBe("2026-04-01");
  });
});

describe("startOfDayVN", () => {
  it("returns 00:00 VN (17:00 UTC the day before) of today + days", () => {
    expect(startOfDayVN(new Date("2026-10-02T05:30:00Z")).toISOString()).toBe("2026-10-01T17:00:00.000Z");
    expect(startOfDayVN(new Date("2026-10-02T05:30:00Z"), 1).toISOString()).toBe("2026-10-02T17:00:00.000Z");
    expect(startOfDayVN(new Date("2026-10-02T17:30:00Z"), 1).toISOString()).toBe("2026-10-03T17:00:00.000Z");
  });
});

describe("daysBetweenVN", () => {
  it("counts VN calendar days, not 24-hour periods", () => {
    // 23:59 VN ngày 01/10 → 00:01 VN ngày 02/10: khác ngày dù chỉ cách 2 phút.
    expect(daysBetweenVN(new Date("2026-10-01T16:59:00Z"), new Date("2026-10-01T17:01:00Z"))).toBe(1);
    expect(daysBetweenVN(new Date("2026-10-01T17:00:00Z"), new Date("2026-10-02T16:59:00Z"))).toBe(0);
    expect(daysBetweenVN(new Date("2026-09-22T17:00:00Z"), new Date("2026-10-02T00:00:00Z"))).toBe(9);
  });
  it("is negative when to is before from", () => {
    expect(daysBetweenVN(new Date("2026-10-05T00:00:00Z"), new Date("2026-10-02T00:00:00Z"))).toBe(-3);
  });
});
