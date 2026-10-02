import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { bulkCardsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = bulkCardsSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const set = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!set) return notFound("Không tìm thấy nhóm thẻ");

    const { mode, cards } = parsed.data;
    const created = await db.$transaction(async (tx) => {
      if (mode === "replace") await tx.card.deleteMany({ where: { setId: id } });
      const max = await tx.card.aggregate({ where: { setId: id }, _max: { position: true } });
      const start = (max._max.position ?? -1) + 1;
      const result = await tx.card.createMany({
        data: cards.map((c, i) => ({
          setId: id,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || null,
          phonetic: c.phonetic || null,
          partOfSpeech: c.partOfSpeech || null,
          audioUrl: c.audioUrl || null,
          position: start + i,
        })),
      });
      return result.count;
    });
    return json({ created }, 201);
  } catch (e) {
    return serverError(e);
  }
}
