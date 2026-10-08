import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getReadableSet } from "@/lib/access";
import { todayVN } from "@/lib/dates";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { scheduleReview, type Grade, type SrsResult } from "@/lib/srs";
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
    if (!readable) return notFound("setNotFound");

    const wanted = [...new Set(items.map((i) => i.cardId))];
    const [cards, existing, settings] = await Promise.all([
      db.card.findMany({ where: { setId, id: { in: wanted } }, select: { id: true } }),
      db.cardReview.findMany({ where: { userId: user.id, cardId: { in: wanted } } }),
      db.user.findUnique({ where: { id: user.id }, select: { dailyGoal: true } }),
    ]);
    const goal = settings?.dailyGoal ?? 20;
    const valid = new Set(cards.map((c) => c.id));

    const now = new Date();
    // null = chưa từng được ôn (không có dòng, hoặc dòng chỉ do đánh sao tạo ra).
    const states = new Map<string, SrsResult | null>();
    for (const r of existing) {
      states.set(
        r.cardId,
        r.lastReviewedAt === null ? null : { ease: r.ease, interval: r.interval, reps: r.reps, lapses: r.lapses, due: r.due },
      );
    }

    let recorded = 0;
    let correct = 0;
    let newCards = 0;
    const final = new Map<string, SrsResult>();
    for (const item of items) {
      if (!valid.has(item.cardId)) continue;
      const prev = states.get(item.cardId) ?? null;
      if (prev === null) newCards += 1;
      // null: trả lời đúng khi chưa đến hạn → vẫn tính lượt luyện trong ngày, nhưng giữ nguyên lịch ôn.
      // cardId → hạn được rải ±5% để các thẻ học cùng ngày không đến hạn cùng một ngày.
      const res = scheduleReview(prev, item.grade as Grade, now, { cardId: item.cardId });
      if (res) {
        states.set(item.cardId, res);
        final.set(item.cardId, res);
      }
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
        // Ghi lại mục tiêu hiện hành của ngày này → streak không bị tính lại khi đổi mục tiêu về sau.
        create: { userId: user.id, day, reviewed: recorded, correct, newCards, goal },
        update: {
          goal,
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
