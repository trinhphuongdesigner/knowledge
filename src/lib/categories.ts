import "server-only";
import type { Category } from "@/generated/prisma/client";
import { db } from "./db";
import { toCategoryDTO } from "./dto";
import { isUuid } from "./ids";
import { categoryNameKey, type CategoryDTO } from "./validators";

/** All categories of a user (oldest first) with their set counts. */
export async function listCategories(userId: string): Promise<CategoryDTO[]> {
  const rows = await db.category.findMany({
    where: { userId },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    include: { _count: { select: { sets: true } } },
  });
  return rows.map((c) => toCategoryDTO(c, c._count.sets));
}

/** A category owned by the user, or null (also for malformed ids). */
export async function getCategory(userId: string, id: string): Promise<CategoryDTO | null> {
  if (!isUuid(id)) return null;
  const c = await db.category.findFirst({
    where: { id, userId },
    include: { _count: { select: { sets: true } } },
  });
  return c ? toCategoryDTO(c, c._count.sets) : null;
}

/** Another category of this user with the same name (case-insensitive), excluding `exceptId`. */
export async function findDuplicateCategory(
  userId: string,
  name: string,
  exceptId?: string,
): Promise<Category | null> {
  const key = categoryNameKey(name);
  const all = await db.category.findMany({ where: { userId } });
  return all.find((c) => c.id !== exceptId && categoryNameKey(c.name) === key) ?? null;
}

export const DEFAULT_CATEGORIES = [
  { name: "IT", color: "BLUE", isEnglish: false },
  { name: "Tiếng Anh", color: "GREEN", isEnglish: true },
] as const;

/** True when the category exists and belongs to the user. */
export async function userOwnsCategory(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  return (await db.category.count({ where: { id, userId } })) > 0;
}
