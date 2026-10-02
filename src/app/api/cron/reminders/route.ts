import { json, serverError } from "@/lib/http";
import { cronAuthorized } from "../auth";
import { runReminders } from "./run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron 12:00 UTC (19:00 VN). `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return json({ error: "Unauthorized" }, 401);
  try {
    return json(await runReminders());
  } catch (e) {
    return serverError(e);
  }
}
