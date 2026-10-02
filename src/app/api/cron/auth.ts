import { timingSafeEqual } from "node:crypto";

/** Vercel Cron gửi `Authorization: Bearer $CRON_SECRET`. Thiếu CRON_SECRET → luôn từ chối. */
export function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
