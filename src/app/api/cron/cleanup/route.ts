import { runCleanup } from "@/lib/cleanup";
import { json, serverError } from "@/lib/http";
import { cronAuthorized } from "../auth";

export const dynamic = "force-dynamic";

/** Vercel Cron (see vercel.json) calls this with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return json({ error: "Unauthorized" }, 401);
  try {
    return json(await runCleanup());
  } catch (e) {
    return serverError(e);
  }
}
