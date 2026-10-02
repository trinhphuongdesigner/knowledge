import { db } from "./db";
import type { SearchResultDTO } from "./validators";

export const SEARCH_MIN_CHARS = 2;
export const SEARCH_LIMIT = 50;

/**
 * Tìm thẻ (câu hỏi / đáp án / giải thích, không phân biệt hoa thường) trong bộ của user
 * và bộ đã subscribe còn đọc được (LINK hoặc PUBLIC đã duyệt). Khớp ở câu hỏi xếp trước.
 */
export async function searchCards(userId: string, q: string): Promise<SearchResultDTO[]> {
  const term = q.trim();
  if (term.length < SEARCH_MIN_CHARS) return [];
  const m = { contains: term, mode: "insensitive" as const };
  const cards = await db.card.findMany({
    where: {
      AND: [
        { OR: [{ question: m }, { answer: m }, { explanation: m }] },
        {
          set: {
            OR: [
              { userId },
              {
                subscribers: { some: { userId } },
                OR: [{ visibility: "LINK" }, { visibility: "PUBLIC", approved: true }],
              },
            ],
          },
        },
      ],
    },
    select: {
      id: true,
      question: true,
      answer: true,
      setId: true,
      position: true,
      set: { select: { title: true } },
    },
    orderBy: [{ set: { title: "asc" } }, { position: "asc" }],
    take: SEARCH_LIMIT * 3,
  });
  const lower = term.toLowerCase();
  return cards
    .map((c) => ({ c, rank: c.question.toLowerCase().includes(lower) ? 0 : c.answer.toLowerCase().includes(lower) ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, SEARCH_LIMIT)
    .map(({ c }) => ({ cardId: c.id, setId: c.setId, setTitle: c.set.title, question: c.question, answer: c.answer }));
}
