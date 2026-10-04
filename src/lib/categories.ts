import "server-only";
import type { Category } from "@/generated/prisma/client";
import { db } from "./db";
import { toCategoryDTO } from "./dto";
import { isUuid } from "./ids";
import { categoryNameKey, type CategoryDTO } from "./validators";

/** Danh mục dùng chung toàn hệ thống (theo thứ tự admin sắp xếp) kèm số bộ thẻ. */
export async function listCategories(): Promise<CategoryDTO[]> {
  const rows = await db.category.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { sets: true } } },
  });
  return rows.map((c) => toCategoryDTO(c, c._count.sets));
}

/** Một danh mục theo id, hoặc null (cũng trả null khi id sai định dạng). */
export async function getCategory(id: string): Promise<CategoryDTO | null> {
  if (!isUuid(id)) return null;
  const c = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { sets: true } } },
  });
  return c ? toCategoryDTO(c, c._count.sets) : null;
}

/** Danh mục khác trùng tên (không phân biệt hoa/thường), bỏ qua `exceptId`. */
export async function findDuplicateCategory(name: string, exceptId?: string): Promise<Category | null> {
  const key = categoryNameKey(name);
  const all = await db.category.findMany();
  return all.find((c) => c.id !== exceptId && categoryNameKey(c.name) === key) ?? null;
}

/** Danh mục mặc định (chỉ dùng khi seed). */
export const DEFAULT_CATEGORIES = [
  { name: "IT", color: "BLUE", isEnglish: false },
  { name: "Ti\u1EBFng Anh", color: "GREEN", isEnglish: true },
] as const;

/** True khi danh mục tồn tại. */
export async function categoryExists(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  return (await db.category.count({ where: { id } })) > 0;
}
