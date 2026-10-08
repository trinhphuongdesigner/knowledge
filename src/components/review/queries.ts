import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { startOfDayVN, todayVN } from "@/lib/dates";
import { toCardDTO } from "@/lib/dto";
import { HARD_MAX_EASE, HARD_MIN_LAPSES, HARD_RECOVERED_REPS, isHard, type SrsState } from "@/lib/srs";
import type { CardDTO, DueSummaryDTO } from "@/lib/validators";
import type { ReviewOnly } from "./session";

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

/**
 * Số thẻ tối đa của một lượt ôn. Đến hạn nhiều hơn thì ôn theo lượt: xong lượt này bấm "Ôn tiếp" để
 * lấy lượt kế (thẻ vừa ôn đúng đã hết hạn nên không lặp lại). 200 thẻ ≈ 15–20 phút: đủ một buổi,
 * trang tải nhẹ hơn, và kết quả có điểm dừng để lưu hết trước khi lấy lượt mới.
 */
export const REVIEW_ROUND_SIZE = 200;

/**
 * Danh sách ôn hôm nay = chỉ thẻ ĐÃ HỌC và ĐẾN HẠN hôm nay (khớp isDueToday). Thẻ mới không vào đây:
 * học trong từng nhóm thẻ. Dòng CardReview chỉ do đánh sao tạo ra có lastReviewedAt = null → bị loại.
 */
export function dueTodayWhere(userId: string, now: Date = new Date()): Prisma.CardReviewWhereInput {
  return {
    userId,
    lastReviewedAt: { not: null },
    set: readableSetWhere(userId),
    OR: [{ due: { lt: startOfDayVN(now, 1) } }, { interval: 0 }],
  };
}

export async function getDueSummary(userId: string): Promise<DueSummaryDTO & { hasCards: boolean }> {
  const [dueCount, totalCards, user, day] = await Promise.all([
    db.cardReview.count({ where: dueTodayWhere(userId) }),
    db.card.count({ where: { set: readableSetWhere(userId) } }),
    db.user.findUnique({ where: { id: userId }, select: { dailyGoal: true } }),
    db.studyDay.findUnique({ where: { userId_day: { userId, day: todayVN() } }, select: { reviewed: true } }),
  ]);
  return { dueCount, goal: user?.dailyGoal ?? 20, doneToday: day?.reviewed ?? 0, hasCards: totalCards > 0 };
}

export type ReviewItem = {
  card: CardDTO;
  setId: string;
  setTitle: string;
  english: boolean;
  state: SrsState;
  starred: boolean;
  /** Hạn ôn (ISO) — để nhãn "ôn lại sau" tính cả phần thưởng ôn trễ. */
  due: string;
};

export type ReviewQueue = {
  /** Thẻ của lượt này (tối đa REVIEW_ROUND_SIZE). */
  items: ReviewItem[];
  /** Tổng số thẻ đến hạn hôm nay, cùng điều kiện với getDueSummary → khớp số trên trang chủ. */
  totalDue: number;
};

const setSelect = { select: { title: true, category: { select: { isEnglish: true } } } } as const;

/** Một lượt thẻ đến hạn hôm nay (quá hạn lâu nhất trước) + tổng số thẻ đến hạn. */
export async function getReviewQueue(userId: string): Promise<ReviewQueue> {
  const where = dueTodayWhere(userId);
  const [rows, totalDue] = await Promise.all([
    db.cardReview.findMany({
      where,
      include: { card: true, set: setSelect },
      // cardId phụ: thứ tự ổn định khi nhiều thẻ trùng hạn.
      orderBy: [{ due: "asc" }, { cardId: "asc" }],
      take: REVIEW_ROUND_SIZE,
    }),
    db.cardReview.count({ where }),
  ]);
  const items = rows.map((r) => ({
    card: toCardDTO(r.card),
    setId: r.setId,
    setTitle: r.set.title,
    english: r.set.category.isEnglish,
    state: { ease: r.ease, interval: r.interval, reps: r.reps, lapses: r.lapses },
    starred: r.starred,
    due: r.due.toISOString(),
  }));
  // Hai câu truy vấn chạy song song có thể lệch nhau chút ít: tổng không được nhỏ hơn số thẻ của lượt.
  return { items, totalDue: Math.max(totalDue, items.length) };
}

/** Khóa của một lượt (băm id thẻ): đổi lượt → ReviewSession mount lại với state mới. */
export function reviewRoundKey(items: readonly ReviewItem[]): string {
  let h = 0x811c9dc5;
  for (const { card } of items) {
    for (let i = 0; i < card.id.length; i++) h = Math.imul(h ^ card.id.charCodeAt(i), 0x01000193);
    h = Math.imul(h ^ 44, 0x01000193);
  }
  return `${items.length}-${(h >>> 0).toString(36)}`;
}

function onlyWhere(only: ReviewOnly): Prisma.CardReviewWhereInput {
  if (only === "starred") return { starred: true };
  // Khớp isHard().
  return {
    reps: { lt: HARD_RECOVERED_REPS },
    OR: [{ lapses: { gte: HARD_MIN_LAPSES } }, { ease: { lt: HARD_MAX_EASE } }],
  };
}

/** Props cho CardList: id thẻ đã gắn sao / bị coi là khó của user trong một bộ. */
export async function getReviewFlags(userId: string, setId: string) {
  const rows = await db.cardReview.findMany({
    where: { userId, setId },
    select: { cardId: true, starred: true, ease: true, lapses: true, reps: true },
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
