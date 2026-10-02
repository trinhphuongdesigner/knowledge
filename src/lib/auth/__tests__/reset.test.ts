import { describe, expect, it, vi } from "vitest";

vi.mock("../../db", () => ({ db: {} }));

import { MAX_RESET_PER_EMAIL, MAX_RESET_PER_IP, isResetBlocked } from "../rate-limit";
import { RESET_TOKEN_TTL_MS, isResetTokenUsable, newResetToken } from "../reset";
import { hashToken } from "../token";

describe("isResetBlocked", () => {
  it("allows below the limits", () => {
    expect(isResetBlocked({ emailRequests: MAX_RESET_PER_EMAIL - 1, ipRequests: MAX_RESET_PER_IP - 1 })).toBe(false);
    expect(isResetBlocked({ emailRequests: 0, ipRequests: null })).toBe(false);
  });
  it("blocks at the per-email or per-IP limit", () => {
    expect(isResetBlocked({ emailRequests: MAX_RESET_PER_EMAIL, ipRequests: 0 })).toBe(true);
    expect(isResetBlocked({ emailRequests: 0, ipRequests: MAX_RESET_PER_IP })).toBe(true);
  });
});

describe("reset token", () => {
  it("stores only the sha256 of a 32-byte base64url token with a 30 minute TTL", () => {
    const now = 1_000_000;
    const t = newResetToken(now);
    expect(t.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(t.id).toBe(hashToken(t.token));
    expect(t.id).not.toContain(t.token);
    expect(t.expiresAt.getTime()).toBe(now + RESET_TOKEN_TTL_MS);
    expect(RESET_TOKEN_TTL_MS).toBe(30 * 60 * 1000);
  });
  it("is single use and expires", () => {
    const now = 5_000;
    expect(isResetTokenUsable({ expiresAt: new Date(now + 1), usedAt: null }, now)).toBe(true);
    expect(isResetTokenUsable({ expiresAt: new Date(now), usedAt: null }, now)).toBe(false);
    expect(isResetTokenUsable({ expiresAt: new Date(now + 1000), usedAt: new Date(now) }, now)).toBe(false);
  });
});
