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
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = cardInputSchema.partial().safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
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

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    await db.card.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy thẻ");
    return serverError(e);
  }
}
