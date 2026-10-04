import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getReadableSet } from "@/lib/access";
import { isUuid } from "@/lib/ids";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { starInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = starInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const card = await db.card.findUnique({ where: { id }, select: { id: true, setId: true } });
    if (!card || !(await getReadableSet(user.id, card.setId))) return notFound("cardNotFound");
    const { starred } = parsed.data;
    await db.cardReview.upsert({
      where: { userId_cardId: { userId: user.id, cardId: id } },
      create: { userId: user.id, cardId: id, setId: card.setId, starred },
      update: { starred },
    });
    return json({ ok: true as const, starred });
  } catch (e) {
    return serverError(e);
  }
}
