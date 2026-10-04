import { requireApiUser } from "@/lib/auth/dal";
import { lookupWordDetailed } from "@/lib/dictionary";
import { apiError, badRequest, json, notFound } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireApiUser(req);
  if (user instanceof Response) return user;
  const word = new URL(req.url).searchParams.get("word")?.trim() ?? "";
  if (!word) return badRequest("wordRequired");
  const r = await lookupWordDetailed(word);
  switch (r.status) {
    case "ok":
      return json(r.info);
    case "notfound":
      return notFound("wordNotFound");
    case "ineligible":
      return badRequest("wordInvalid");
    default:
      return apiError("dictionaryOffline", 502);
  }
}
