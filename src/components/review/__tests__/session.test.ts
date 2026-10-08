import { describe, expect, it } from "vitest";
import { createT } from "../../../i18n/translate";
import type { Messages } from "../../../i18n/messages/types";
import review from "../../../i18n/messages/vi/review";
import { nextReview, type SrsState } from "../../../lib/srs";
import { formatDelay, parseOnly, parseReviewMode, previewLabels, requeueLapse, typingGrade } from "../session";

const t = createT("vi", { review } as unknown as Messages, "review");
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe("formatDelay", () => {
  it("formats minutes, hours, days, months, years", () => {
    expect(formatDelay(10 * MIN, t)).toBe("10 phút");
    expect(formatDelay(30 * 1000, t)).toBe("1 phút");
    expect(formatDelay(3 * 60 * MIN, t)).toBe("3 giờ");
    expect(formatDelay(DAY, t)).toBe("1 ngày");
    expect(formatDelay(3 * DAY, t)).toBe("3 ngày");
    expect(formatDelay(60 * DAY, t)).toBe("2 tháng");
    expect(formatDelay(400 * DAY, t)).toBe("1 năm");
  });
});

describe("previewLabels", () => {
  it("new card", () => {
    const l = previewLabels({ ease: 2.5, interval: 0, reps: 0, lapses: 0 }, t);
    expect(l[0]).toBe("10 phút");
    expect(l[1]).toBe("1 ngày");
    expect(l[2]).toBe("1 ngày");
    expect(l[3]).toBe("4 ngày");
  });
  it("mature card gets longer for Dễ than Khó", () => {
    const l = previewLabels({ ease: 2.5, interval: 30, reps: 5, lapses: 0 }, t);
    expect(l[0]).toBe("10 phút");
    expect(l[3]).not.toBe(l[1]);
  });
  it("interval 1: Khó 2, Được 3, Dễ 5 days", () => {
    const l = previewLabels({ ease: 2.5, interval: 1, reps: 1, lapses: 0 }, t);
    expect([l[1], l[2], l[3]]).toEqual(["2 ngày", "3 ngày", "5 ngày"]);
  });
  it("matches nextReview, including the late-review credit when due is given", () => {
    const now = new Date("2026-10-02T00:00:00Z");
    const state: SrsState = { ease: 2.5, interval: 3, reps: 2, lapses: 0 };
    // Hạn 0:00 VN ngày 22/09 → trễ 10 ngày.
    const due = new Date("2026-09-21T17:00:00Z");
    const onTime = previewLabels(state, t, now);
    const late = previewLabels(state, t, now, due);
    for (const g of [1, 2, 3] as const) {
      expect(onTime[g]).toBe(formatDelay(nextReview(state, g, now).interval * DAY, t));
      expect(late[g]).toBe(formatDelay(nextReview(state, g, now, due).interval * DAY, t));
    }
    expect([onTime[1], onTime[2], onTime[3]]).toEqual(["4 ngày", "8 ngày", "10 ngày"]);
    expect([late[1], late[2], late[3]]).toEqual(["7 ngày", "20 ngày", "2 tháng"]);
    expect(late[0]).toBe("10 phút");
  });
});

describe("requeueLapse", () => {
  const q = [
    { id: "a", state: { ease: 2.5, interval: 3, reps: 2, lapses: 0 } },
    { id: "b", state: { ease: 2.5, interval: 8, reps: 3, lapses: 0 } },
  ];
  it("appends a forgotten card to the end with its lapsed state", () => {
    const next = requeueLapse(q, 0, 0);
    expect(next.map((i) => i.id)).toEqual(["a", "b", "a"]);
    expect(next[2].state).toMatchObject({ interval: 0, reps: 0, lapses: 1 });
    expect(q).toHaveLength(2);
  });
  it("forgetting a requeued card again does not penalise it twice", () => {
    const once = requeueLapse(q, 0, 0);
    const twice = requeueLapse(once, 2, 0);
    expect(twice[3].state).toMatchObject({ ease: 2.3, interval: 0, reps: 0, lapses: 1 });
  });
  it("leaves the queue unchanged on a successful answer", () => {
    for (const g of [1, 2, 3] as const) expect(requeueLapse(q, 1, g).map((i) => i.id)).toEqual(["a", "b"]);
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

describe("typingGrade", () => {
  it("maps typing results to SRS grades", () => {
    expect(typingGrade({ correct: false, hintsUsed: 0 })).toBe(0);
    expect(typingGrade({ correct: false, hintsUsed: 3 })).toBe(0);
    expect(typingGrade({ correct: true, hintsUsed: 1 })).toBe(1);
    expect(typingGrade({ correct: true, hintsUsed: 0 })).toBe(2);
  });
});

describe("parseReviewMode", () => {
  it("defaults to typing", () => {
    expect(parseReviewMode("flip")).toBe("flip");
    expect(parseReviewMode("typing")).toBe("typing");
    expect(parseReviewMode(null)).toBe("typing");
    expect(parseReviewMode("bogus")).toBe("typing");
  });
});
