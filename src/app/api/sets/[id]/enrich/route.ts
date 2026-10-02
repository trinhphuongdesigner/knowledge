import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { lookupWordDetailed } from "@/lib/dictionary";
import { badRequest, json, notFound, serverError } from "@/lib/http";
import type { EnrichResultDTO } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const BATCH = 50;
const CONCURRENCY = 5;

/** Fill phonetic / partOfSpeech / audioUrl for up to 50 cards of an ENGLISH set that have none yet. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const set = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true, category: true } });
    if (!set) return notFound("Không tìm thấy bộ học");
    if (set.category !== "ENGLISH") return badRequest("Chỉ hỗ trợ tra phiên âm cho bộ Tiếng Anh");

    const todo = await db.card.findMany({
      where: { setId: id, phonetic: null },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      take: BATCH,
    });

    let updated = 0;
    let notFoundCount = 0;
    let failed = 0;
    let cursor = 0;

    async function worker() {
      while (cursor < todo.length) {
        const card = todo[cursor++];
        const r = await lookupWordDetailed(card.question);
        if (r.status === "error") {
          failed++;
          continue;
        }
        if (r.status === "ok") {
          await db.card.update({
            where: { id: card.id },
            data: {
              phonetic: r.info.phonetic ?? "",
              partOfSpeech: card.partOfSpeech || r.info.partOfSpeech,
              audioUrl: card.audioUrl || r.info.audioUrl,
            },
          });
          updated++;
        } else {
          // Not found / not a 1-3 word English term: mark as looked-up so we do not retry forever.
          await db.card.update({ where: { id: card.id }, data: { phonetic: "" } });
          notFoundCount++;
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));

    const remaining = await db.card.count({ where: { setId: id, phonetic: null } });
    const body: EnrichResultDTO & { failed: number } = {
      updated,
      notFound: notFoundCount,
      remaining,
      failed,
    };
    return json(body);
  } catch (e) {
    return serverError(e);
  }
}
