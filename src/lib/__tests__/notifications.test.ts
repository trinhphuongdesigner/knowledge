import { afterEach, describe, expect, it, vi } from "vitest";
import {
  badgeLabel,
  buildPushPayload,
  isGonePushStatus,
  notificationCutoffs,
  relativeTimeVi,
  safeHref,
} from "../notifications-core";
import { siteUrl } from "../site";

describe("buildPushPayload", () => {
  it("defaults the tag to the href and keeps fields", () => {
    expect(buildPushPayload({ title: "T", body: "B", href: "/review" })).toEqual({
      title: "T",
      body: "B",
      href: "/review",
      tag: "/review",
    });
  });
  it("uses an explicit tag and truncates long text", () => {
    const p = buildPushPayload({ title: "x".repeat(500), body: "y".repeat(900), href: "/a", tag: "t" });
    expect(p.title).toHaveLength(120);
    expect(p.body).toHaveLength(300);
    expect(p.tag).toBe("t");
  });
  it("rejects external hrefs", () => {
    expect(safeHref("//evil.test")).toBe("/");
    expect(safeHref("https://evil.test")).toBe("/");
    expect(safeHref("/" + String.fromCharCode(92) + "evil")).toBe("/");
    expect(safeHref("/sets/1")).toBe("/sets/1");
  });
});

describe("badgeLabel", () => {
  it("hides zero, caps at 9+", () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(-1)).toBeNull();
    expect(badgeLabel(3)).toBe("3");
    expect(badgeLabel(9)).toBe("9");
    expect(badgeLabel(10)).toBe("9+");
  });
});

describe("relativeTimeVi", () => {
  const now = new Date("2026-10-03T10:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);
  it("formats minutes, hours, days", () => {
    expect(relativeTimeVi(ago(10_000), now)).toBe("vừa xong");
    expect(relativeTimeVi(ago(5 * 60_000), now)).toBe("5 phút trước");
    expect(relativeTimeVi(ago(3 * 3_600_000), now)).toBe("3 giờ trước");
    expect(relativeTimeVi(ago(2 * 86_400_000), now)).toBe("2 ngày trước");
  });
  it("never goes negative for future dates", () => {
    expect(relativeTimeVi(new Date(now.getTime() + 60_000), now)).toBe("vừa xong");
  });
});

describe("push status + cleanup cutoffs", () => {
  it("treats 404/410 as gone", () => {
    expect(isGonePushStatus(410)).toBe(true);
    expect(isGonePushStatus(404)).toBe(true);
    expect(isGonePushStatus(500)).toBe(false);
  });
  it("computes 30/90 day cutoffs", () => {
    const now = new Date("2026-10-03T00:00:00Z");
    const c = notificationCutoffs(now);
    expect(c.read.toISOString()).toBe("2026-09-03T00:00:00.000Z");
    expect(c.all.toISOString()).toBe("2026-07-05T00:00:00.000Z");
  });
});

describe("siteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://k.test//");
    expect(siteUrl()).toBe("https://k.test");
  });
  it("defaults to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});
