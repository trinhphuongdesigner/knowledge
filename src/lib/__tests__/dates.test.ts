import { describe, expect, it } from "vitest";
import { addDays, dayKey, todayVN } from "../dates";

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
