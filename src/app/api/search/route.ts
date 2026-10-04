import { requireApiUser } from "@/lib/auth/dal";
import { badRequest, json, serverError } from "@/lib/http";
import { SEARCH_MIN_CHARS, searchCards } from "@/lib/search";
import { searchQuerySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = searchQuerySchema.safeParse({ q: new URL(req.url).searchParams.get("q") ?? "" });
    if (!parsed.success || parsed.data.q.length < SEARCH_MIN_CHARS) {
      return badRequest("searchTooShort", undefined, { min: SEARCH_MIN_CHARS });
    }
    return json(await searchCards(user.id, parsed.data.q));
  } catch (e) {
    return serverError(e);
  }
}
