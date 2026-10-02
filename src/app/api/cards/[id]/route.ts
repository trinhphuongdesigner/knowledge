import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toCardDTO } from "@/lib/dto";
import {
  isNotFoundError,
  json,
  notFound,
  readJson,
  serverError,
  validationError,
} from "@/lib/http";
import { cardInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = cardInputSchema.partial().safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const owned = await db.card.findFirst({ where: { id, set: { userId: user.id } }, select: { id: true } });
    if (!owned) return notFound("Không tìm thấy thẻ");
    const { question, answer, explanation, phonetic, partOfSpeech, audioUrl } = parsed.data;
    const nullable = (v: string | null | undefined) => (v === undefined ? undefined : v || null);
    const card = await db.card.update({
      where: { id },
      data: {
        question,
        answer,
        explanation: nullable(explanation),
        phonetic: nullable(phonetic),
        partOfSpeech: nullable(partOfSpeech),
        audioUrl: nullable(audioUrl),
      },
    });
    return json(toCardDTO(card));
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy thẻ");
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const owned = await db.card.findFirst({ where: { id, set: { userId: user.id } }, select: { id: true } });
    if (!owned) return notFound("Không tìm thấy thẻ");
    await db.card.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy thẻ");
    return serverError(e);
  }
}
