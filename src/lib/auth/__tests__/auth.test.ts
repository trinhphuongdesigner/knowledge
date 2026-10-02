import { describe, expect, it, vi } from "vitest";

// rate-limit.ts imports the Prisma client; the pure functions under test never touch it.
vi.mock("../../db", () => ({ db: {} }));

import { hashPassword, verifyDummyPassword, verifyPassword } from "../password";
import {
  MAX_EMAIL_FAILURES,
  MAX_IP_FAILURES,
  MAX_REGISTER_PER_IP,
  getClientIp,
  isLoginBlocked,
  isRegisterBlocked,
} from "../rate-limit";
import { isSameOrigin, safeNext } from "../redirect";
import { SESSION_REFRESH_BELOW_MS, generateToken, hashToken, shouldRefreshSession } from "../token";
import { loginSchema, registerSchema } from "../../validators";

describe("password hashing", () => {
  it("round-trips and uses the documented format", async () => {
    const h = await hashPassword("correct horse");
    expect(h.split("$")).toHaveLength(6);
    expect(h.startsWith("scrypt$32768$8$1$")).toBe(true);
    expect(await verifyPassword("correct horse", h)).toBe(true);
  });

  it("rejects a wrong password and salts each hash", async () => {
    const h = await hashPassword("secret-123");
    expect(await verifyPassword("secret-124", h)).toBe(false);
    expect(await hashPassword("secret-123")).not.toBe(h);
  });

  it("returns false (never throws) for malformed hashes", async () => {
    const bad = [
      "",
      "plain",
      "scrypt$1$2$3",
      "bcrypt$a$b$c$d$e",
      "scrypt$x$8$1$AAAA$AAAA",
      "scrypt$32768$8$1$$",
      "scrypt$3$8$1$AAAA$AAAA",
      "scrypt$99999999$8$1$AAAA$AAAA",
    ];
    for (const b of bad) expect(await verifyPassword("x", b)).toBe(false);
  });

  it("dummy verify always fails", async () => {
    expect(await verifyDummyPassword("anything")).toBe(false);
  });
});

describe("safeNext", () => {
  it("accepts internal paths", () => {
    expect(safeNext("/")).toBe("/");
    expect(safeNext("/sets/abc?x=1#y")).toBe("/sets/abc?x=1#y");
  });
  it("rejects open-redirect attempts", () => {
    const bad = ["//evil.com", "/\\evil", "https://x", "http://x/a", "javascript:alert(1)", "evil.com", "", "/a\nb", null, undefined, 5];
    for (const b of bad) expect(safeNext(b)).toBe("/");
  });
});

describe("isSameOrigin", () => {
  it("allows missing Origin and matching host", () => {
    expect(isSameOrigin(null, "a.com")).toBe(true);
    expect(isSameOrigin("https://a.com", "a.com")).toBe(true);
    expect(isSameOrigin("https://b.com", "a.com", "b.com")).toBe(true);
  });
  it("rejects mismatches and garbage", () => {
    expect(isSameOrigin("https://evil.com", "a.com")).toBe(false);
    expect(isSameOrigin("not a url", "a.com")).toBe(false);
  });
});

describe("session tokens", () => {
  it("generates unique base64url 32-byte tokens", () => {
    const a = generateToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(a);
  });
  it("hashes to deterministic sha256 hex that differs from the token", () => {
    const t = generateToken();
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).not.toBe(t);
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("refreshes only when under 15 days remain", () => {
    const now = Date.now();
    expect(shouldRefreshSession(new Date(now + SESSION_REFRESH_BELOW_MS - 1000), now)).toBe(true);
    expect(shouldRefreshSession(new Date(now + SESSION_REFRESH_BELOW_MS + 1000), now)).toBe(false);
  });
});

describe("rate limit thresholds", () => {
  it("blocks login by email at 5 and by ip at 20", () => {
    expect(isLoginBlocked({ emailFailures: MAX_EMAIL_FAILURES - 1, ipFailures: 0 })).toBe(false);
    expect(isLoginBlocked({ emailFailures: MAX_EMAIL_FAILURES, ipFailures: 0 })).toBe(true);
    expect(isLoginBlocked({ emailFailures: 0, ipFailures: MAX_IP_FAILURES - 1 })).toBe(false);
    expect(isLoginBlocked({ emailFailures: 0, ipFailures: MAX_IP_FAILURES })).toBe(true);
    expect(isLoginBlocked({ emailFailures: 0, ipFailures: null })).toBe(false);
  });
  it("blocks registration at 5 per ip", () => {
    expect(isRegisterBlocked(MAX_REGISTER_PER_IP - 1)).toBe(false);
    expect(isRegisterBlocked(MAX_REGISTER_PER_IP)).toBe(true);
    expect(isRegisterBlocked(null)).toBe(false);
  });
  it("reads the client ip from x-forwarded-for then x-real-ip", () => {
    const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
    expect(getClientIp(h({ "x-forwarded-for": "1.1.1.1, 2.2.2.2", "x-real-ip": "3.3.3.3" }))).toBe("1.1.1.1");
    expect(getClientIp(h({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(getClientIp(h({}))).toBeNull();
  });
});

describe("auth schemas", () => {
  it("normalises email and validates register", () => {
    expect(loginSchema.parse({ email: "  A@B.COM ", password: "x" }).email).toBe("a@b.com");
    expect(registerSchema.safeParse({ email: "a@b.com", password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "longenough", confirmPassword: "different1" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.com", password: "longenough", confirmPassword: "longenough" }).success).toBe(true);
  });
});
