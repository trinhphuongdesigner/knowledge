import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getReadableSet } from "@/lib/access";
import { isUuid } from "@/lib/ids";
import { quizRunPct } from "@/lib/set-status";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { quizResultInputSchema, studyProgressInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = studyProgressInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    if (!(await getReadableSet(user.id, id))) return notFound("setNotFound");
    const { completed, ...state } = parsed.data;
    await db.studyProgress.upsert({
      where: { userId_setId: { userId: user.id, setId: id } },
      create: { userId: user.id, setId: id, ...state, completedAt: completed ? new Date() : null },
      // Only touch completedAt when finishing; a later partial save keeps the last completion time.
      update: { ...state, ...(completed ? { completedAt: new Date() } : {}) },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}

/** Merge a quiz result into known/unknown without touching the flashcard session (order, index, …). */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = quizResultInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    if (!(await getReadableSet(user.id, id))) return notFound("setNotFound");

    const cardIds = (await db.card.findMany({ where: { setId: id }, select: { id: true } })).map((c) => c.id);
    const valid = new Set(cardIds);
    const passed = new Set(parsed.data.passed.filter((c) => valid.has(c)));
    const failed = new Set(parsed.data.failed.filter((c) => valid.has(c) && !passed.has(c)));
    // Only a run over every card is scored; "làm lại câu sai" runs just update known/unknown.
    const pct = quizRunPct({ cardIds, passed: [...passed], failed: [...failed] });

    const key = { userId_setId: { userId: user.id, setId: id } };
    const current = await db.studyProgress.findUnique({
      where: key,
      select: { known: true, unknown: true, quizBestPct: true },
    });
    const known = [...new Set([...(current?.known ?? []).filter((c) => !failed.has(c)), ...passed])];
    const unknown = [...new Set([...(current?.unknown ?? []).filter((c) => !passed.has(c)), ...failed])];
    const quizBestPct = pct === null ? undefined : Math.max(current?.quizBestPct ?? 0, pct);
    await db.studyProgress.upsert({
      where: key,
      create: { userId: user.id, setId: id, known, unknown, quizBestPct },
      update: { known, unknown, quizBestPct },
    });
    return json({ ok: true, pct });
  } catch (e) {
    return serverError(e);
  }
}
