import { createHash, randomBytes } from "node:crypto";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_REFRESH_BELOW_MS = 15 * 24 * 60 * 60 * 1000;

/** 32 random bytes, base64url. Only ever lives in the cookie. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** sha256 hex — what the DB stores as Session.id. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function shouldRefreshSession(expiresAt: Date, now = Date.now()): boolean {
  return expiresAt.getTime() - now < SESSION_REFRESH_BELOW_MS;
}
