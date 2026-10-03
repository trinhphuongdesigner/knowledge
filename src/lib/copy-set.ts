import "server-only";
import type { Card, Category, StudySet } from "@/generated/prisma/client";
import { db } from "./db";

/** Sao chép sâu một bộ thẻ (kèm thẻ) vào tài khoản `userId`. Bản sao luôn PRIVATE và giữ nguyên danh mục của bộ gốc. */
export async function copySetForUser(
  userId: string,
  source: StudySet & { category: Category },
): Promise<StudySet & { category: Category }> {
  const cards: Card[] = await db.card.findMany({
    where: { setId: source.id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return db.$transaction(async (tx) => {
    const set = await tx.studySet.create({
      data: {
        title: source.title,
        description: source.description,
        level: source.level,
        categoryId: source.categoryId,
        userId,
      },
      include: { category: true },
    });
    if (cards.length > 0) {
      await tx.card.createMany({
        data: cards.map((c, i) => ({
          setId: set.id,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation,
          phonetic: c.phonetic,
          partOfSpeech: c.partOfSpeech,
          audioUrl: c.audioUrl,
          position: i,
        })),
      });
    }
    return set;
  });
}
