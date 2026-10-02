import { generateToken, hashToken } from "./token";

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

/** Token thô (gửi trong link) + id = sha256 (lưu DB) + hạn dùng. */
export function newResetToken(now = Date.now()): { token: string; id: string; expiresAt: Date } {
  const token = generateToken();
  return { token, id: hashToken(token), expiresAt: new Date(now + RESET_TOKEN_TTL_MS) };
}

/** Token còn dùng được: chưa hết hạn và chưa dùng. */
export function isResetTokenUsable(row: { expiresAt: Date; usedAt: Date | null }, now = Date.now()): boolean {
  return row.usedAt === null && row.expiresAt.getTime() > now;
}
