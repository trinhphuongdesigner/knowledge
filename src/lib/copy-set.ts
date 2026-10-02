import "server-only";
import type { Card, Category, StudySet } from "@/generated/prisma/client";
import { db } from "./db";
import { categoryNameKey } from "./validators";

/** Danh mục của user trùng tên với `source` (không phân biệt hoa/thường), hoặc danh mục đầu tiên; chưa có thì tạo. */
export async function pickCategoryFor(userId: string, source: Category): Promise<Category> {
  const mine = await db.category.findMany({ where: { userId }, orderBy: [{ createdAt: "asc" }, { name: "asc" }] });
  const key = categoryNameKey(source.name);
  const match = mine.find((c) => categoryNameKey(c.name) === key) ?? mine[0];
  if (match) return match;
  return db.category.create({
    data: { userId, name: source.name, color: source.color, isEnglish: source.isEnglish },
  });
}

/** Sao chép sâu một bộ thẻ (kèm thẻ) vào tài khoản `userId`. Bản sao luôn PRIVATE. */
export async function copySetForUser(
  userId: string,
  source: StudySet & { category: Category },
): Promise<StudySet & { category: Category }> {
  const category = await pickCategoryFor(userId, source.category);
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
        categoryId: category.id,
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
