import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toCardDTO } from "@/lib/dto";
import { lookupWordDetailed } from "@/lib/dictionary";
import { checkQuota } from "@/lib/quota";
import { badRequest, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { cardInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = cardInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const set = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true, category: { select: { isEnglish: true } } } });
    if (!set) return notFound("Không tìm thấy nhóm thẻ");

    const quotaError = await checkQuota(user, { cards: 1, setId: id });
    if (quotaError) return badRequest(quotaError);

    const { question, answer, explanation } = parsed.data;
    let phonetic = parsed.data.phonetic || null;
    let partOfSpeech = parsed.data.partOfSpeech || null;
    let audioUrl = parsed.data.audioUrl || null;
    if (set.category.isEnglish && !phonetic) {
      // Best effort: a dictionary failure must never block card creation.
      const r = await lookupWordDetailed(question);
      if (r.status === "ok") {
        phonetic = r.info.phonetic;
        partOfSpeech ??= r.info.partOfSpeech;
        audioUrl ??= r.info.audioUrl;
      } else if (r.status === "notfound" || r.status === "ineligible") {
        phonetic = ""; // marker: looked up, nothing to fill
      }
    }
    const card = await db.$transaction(async (tx) => {
      const max = await tx.card.aggregate({ where: { setId: id }, _max: { position: true } });
      return tx.card.create({
        data: {
          setId: id,
          question,
          answer,
          explanation: explanation || null,
          phonetic,
          partOfSpeech,
          audioUrl,
          position: (max._max.position ?? -1) + 1,
        },
      });
    });
    return json(toCardDTO(card), 201);
  } catch (e) {
    return serverError(e);
  }
}
