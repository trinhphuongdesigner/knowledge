import { requireApiUser } from "@/lib/auth/dal";
import { json, serverError } from "@/lib/http";
import { listLibrary } from "@/lib/library";

export const dynamic = "force-dynamic";

/** GET /api/library?q=&category=<tên danh mục>&page= → PublicSetDTO[] (24/trang; header X-Has-More: 1|0). */
export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const sp = new URL(req.url).searchParams;
    const page = Number(sp.get("page") ?? 1);
    const { sets, hasMore } = await listLibrary({
      q: sp.get("q") ?? undefined,
      category: sp.get("category") ?? undefined,
      page: Number.isFinite(page) ? page : 1,
    });
    const res = json(sets.map(({ token, ...dto }) => (void token, dto)));
    res.headers.set("X-Has-More", hasMore ? "1" : "0");
    return res;
  } catch (e) {
    return serverError(e);
  }
}
