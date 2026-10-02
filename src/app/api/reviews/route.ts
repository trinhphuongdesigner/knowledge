import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getReadableSet } from "@/lib/access";
import { todayVN } from "@/lib/dates";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { INITIAL_SRS_STATE, nextReview, type Grade, type SrsResult, type SrsState } from "@/lib/srs";
import { reviewInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = reviewInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { setId, items } = parsed.data;

    const readable = await getReadableSet(user.id, setId);
    if (!readable) return notFound("Không tìm thấy nhóm thẻ");

    const wanted = [...new Set(items.map((i) => i.cardId))];
    const [cards, existing] = await Promise.all([
      db.card.findMany({ where: { setId, id: { in: wanted } }, select: { id: true } }),
      db.cardReview.findMany({ where: { userId: user.id, cardId: { in: wanted } } }),
    ]);
    const valid = new Set(cards.map((c) => c.id));

    const now = new Date();
    const states = new Map<string, SrsState>();
    const fresh = new Map<string, boolean>(); // chưa từng được ôn
    for (const r of existing) {
      states.set(r.cardId, { ease: r.ease, interval: r.interval, reps: r.reps, lapses: r.lapses });
      fresh.set(r.cardId, r.reps === 0 && r.lastReviewedAt === null);
    }

    let recorded = 0;
    let correct = 0;
    let newCards = 0;
    const final = new Map<string, SrsResult>();
    for (const item of items) {
      if (!valid.has(item.cardId)) continue;
      if (!states.has(item.cardId) || fresh.get(item.cardId)) {
        newCards += 1;
        fresh.set(item.cardId, false);
      }
      const res = nextReview(states.get(item.cardId) ?? INITIAL_SRS_STATE, item.grade as Grade, now);
      states.set(item.cardId, res);
      final.set(item.cardId, res);
      recorded += 1;
      if (item.grade >= 2) correct += 1;
    }
    if (recorded === 0) return json({ ok: true as const, recorded: 0 });

    const day = todayVN(now);
    await db.$transaction([
      ...[...final].map(([cardId, s]) => {
        const data = {
          ease: s.ease,
          interval: s.interval,
          reps: s.reps,
          lapses: s.lapses,
          due: s.due,
          lastReviewedAt: now,
        };
        return db.cardReview.upsert({
          where: { userId_cardId: { userId: user.id, cardId } },
          create: { userId: user.id, cardId, setId, ...data },
          update: data,
        });
      }),
      db.studyDay.upsert({
        where: { userId_day: { userId: user.id, day } },
        create: { userId: user.id, day, reviewed: recorded, correct, newCards },
        update: {
          reviewed: { increment: recorded },
          correct: { increment: correct },
          newCards: { increment: newCards },
        },
      }),
    ]);
    return json({ ok: true as const, recorded });
  } catch (e) {
    return serverError(e);
  }
}
