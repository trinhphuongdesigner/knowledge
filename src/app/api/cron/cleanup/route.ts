import { runCleanup } from "@/lib/cleanup";
import { json, serverError } from "@/lib/http";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Vercel Cron (see vercel.json) calls this with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  try {
    return json(await runCleanup());
  } catch (e) {
    return serverError(e);
  }
}
