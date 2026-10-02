import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { todayVN } from "@/lib/dates";
import { toCardDTO } from "@/lib/dto";
import { isHard, type SrsState } from "@/lib/srs";
import type { CardDTO, DueSummaryDTO } from "@/lib/validators";
import { buildSession, type ReviewOnly } from "./session";

/** Bộ thẻ user được đọc: của mình, hoặc đã subscribe một bộ LINK / PUBLIC đã duyệt. */
export function readableSetWhere(userId: string): Prisma.StudySetWhereInput {
  return {
    OR: [
      { userId },
      {
        subscribers: { some: { userId } },
        OR: [{ visibility: "LINK" }, { visibility: "PUBLIC", approved: true }],
      },
    ],
  };
}

const MAX_DUE = 500;
const MAX_PRACTICE = 100;

/** Thẻ đã thực sự được ôn (dòng CardReview chỉ do đánh sao tạo ra có lastReviewedAt = null). */
const reviewedFilter = { lastReviewedAt: { not: null } } as const;

async function getGoalAndDone(userId: string) {
  const [user, day] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { dailyGoal: true } }),
    db.studyDay.findUnique({ where: { userId_day: { userId, day: todayVN() } }, select: { reviewed: true } }),
  ]);
  return { goal: user?.dailyGoal ?? 20, doneToday: day?.reviewed ?? 0 };
}

export async function getDueSummary(userId: string): Promise<DueSummaryDTO & { hasCards: boolean }> {
  const setWhere = readableSetWhere(userId);
  const [dueCount, newCount, totalCards, gd] = await Promise.all([
    db.cardReview.count({ where: { userId, due: { lte: new Date() }, ...reviewedFilter, set: setWhere } }),
    db.card.count({ where: { set: setWhere, reviews: { none: { userId, ...reviewedFilter } } } }),
    db.card.count({ where: { set: setWhere } }),
    getGoalAndDone(userId),
  ]);
  // Thẻ mới chỉ được thêm tới khi đủ mục tiêu ngày (khớp với getReviewQueue).
  const room = Math.max(0, gd.goal - gd.doneToday - dueCount);
  return { dueCount, newCount: Math.min(newCount, room), goal: gd.goal, doneToday: gd.doneToday, hasCards: totalCards > 0 };
}

export type ReviewItem = {
  card: CardDTO;
  setId: string;
  setTitle: string;
  english: boolean;
  state: SrsState;
  starred: boolean;
};

export type ReviewQueue = { items: ReviewItem[]; goal: number; doneToday: number; only?: ReviewOnly };

const setSelect = { select: { title: true, category: { select: { isEnglish: true } } } } as const;

export async function getReviewQueue(userId: string, only?: ReviewOnly): Promise<ReviewQueue> {
  const setWhere = readableSetWhere(userId);
  const { goal, doneToday } = await getGoalAndDone(userId);

  type Row = Prisma.CardReviewGetPayload<{ include: { card: true; set: typeof setSelect } }>;
  const toItem = (r: Row): ReviewItem => ({
    card: toCardDTO(r.card),
    setId: r.setId,
    setTitle: r.set.title,
    english: r.set.category.isEnglish,
    state: { ease: r.ease, interval: r.interval, reps: r.reps, lapses: r.lapses },
    starred: r.starred,
  });

  if (only) {
    const rows = await db.cardReview.findMany({
      where: { userId, set: setWhere, ...onlyWhere(only) },
      include: { card: true, set: setSelect },
      orderBy: { due: "asc" },
      take: MAX_PRACTICE,
    });
    return { items: rows.map(toItem), goal, doneToday, only };
  }

  const dueRows = await db.cardReview.findMany({
    where: { userId, due: { lte: new Date() }, ...reviewedFilter, set: setWhere },
    include: { card: true, set: setSelect },
    orderBy: { due: "asc" },
    take: MAX_DUE,
  });
  const room = Math.max(0, goal - doneToday - dueRows.length);
  const freshRows =
    room > 0
      ? await db.card.findMany({
          where: { set: setWhere, reviews: { none: { userId, ...reviewedFilter } } },
          include: { set: setSelect, reviews: { where: { userId }, select: { starred: true } } },
          orderBy: [{ setId: "asc" }, { position: "asc" }, { createdAt: "asc" }],
          take: room,
        })
      : [];
  const fresh: ReviewItem[] = freshRows.map((c) => ({
    card: toCardDTO(c),
    setId: c.setId,
    setTitle: c.set.title,
    english: c.set.category.isEnglish,
    state: { ease: 2.5, interval: 0, reps: 0, lapses: 0 },
    starred: c.reviews[0]?.starred ?? false,
  }));
  return { items: buildSession(dueRows.map(toItem), fresh, { goal, doneToday }), goal, doneToday };
}

function onlyWhere(only: ReviewOnly): Prisma.CardReviewWhereInput {
  return only === "starred" ? { starred: true } : { OR: [{ lapses: { gte: 2 } }, { ease: { lt: 2 } }] };
}

/** Props cho CardList: id thẻ đã gắn sao / bị coi là khó của user trong một bộ. */
export async function getReviewFlags(userId: string, setId: string) {
  const rows = await db.cardReview.findMany({
    where: { userId, setId },
    select: { cardId: true, starred: true, ease: true, lapses: true },
  });
  return {
    starredIds: rows.filter((r) => r.starred).map((r) => r.cardId),
    hardIds: rows.filter((r) => isHard(r)).map((r) => r.cardId),
  };
}

/** Id thẻ của bộ khớp bộ lọc `only` (dùng cho trang học). */
export async function getOnlyCardIds(userId: string, setId: string, only: ReviewOnly): Promise<string[]> {
  const rows = await db.cardReview.findMany({
    where: { userId, setId, ...onlyWhere(only) },
    select: { cardId: true },
  });
  return rows.map((r) => r.cardId);
}

/** Số thẻ đánh sao / khó của user trong một bộ (để hiện/ẩn bộ lọc). */
export async function getOnlyCounts(userId: string, setId: string) {
  const { starredIds, hardIds } = await getReviewFlags(userId, setId);
  return { starred: starredIds.length, hard: hardIds.length };
}
