import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { toSetDTO } from "./dto";
import { isUuid } from "./ids";
import type { PublicSetDTO } from "./validators";

export const LIBRARY_PAGE_SIZE = 24;

/** PublicSetDTO + token dẫn tới /s/[token] cho bộ chưa lưu (token của bộ PUBLIC đã duyệt vốn công khai). */
export type LibraryItem = PublicSetDTO & { token: string | null; featured: boolean };

/** `category`: id danh mục (tên danh mục cũ vẫn được chấp nhận để tương thích link cũ). */
export type LibraryQuery = { q?: string; category?: string; page?: number };

/** Bộ PUBLIC đã duyệt, mới công khai trước. Trả thêm `hasMore` để phân trang. */
export async function listLibrary(
  query: LibraryQuery,
): Promise<{ sets: LibraryItem[]; page: number; hasMore: boolean }> {
  const page = Math.max(1, Math.floor(query.page ?? 1) || 1);
  const where: Prisma.StudySetWhereInput = { visibility: "PUBLIC", approved: true };
  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  const category = query.category?.trim();
  if (category) {
    where.category = isUuid(category) ? { id: category } : { name: { equals: category, mode: "insensitive" } };
  }

  const rows = await db.studySet.findMany({
    where,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * LIBRARY_PAGE_SIZE,
    take: LIBRARY_PAGE_SIZE + 1,
    include: {
      category: true,
      user: { select: { name: true } },
      _count: { select: { cards: true, subscribers: true } },
    },
  });
  const hasMore = rows.length > LIBRARY_PAGE_SIZE;
  const sets = rows.slice(0, LIBRARY_PAGE_SIZE).map((s) => ({
    ...toSetDTO(s, s._count.cards, { isOwner: false, ownerName: s.user.name }),
    ownerName: s.user.name,
    subscriberCount: s._count.subscribers,
    token: s.shareToken,
    featured: s.featured,
  }));
  return { sets, page, hasMore };
}

/** Danh mục có bộ trong thư viện công khai (cho bộ lọc), theo thứ tự admin sắp xếp. */
export async function listLibraryCategories(): Promise<{ id: string; name: string }[]> {
  return db.category.findMany({
    where: { sets: { some: { visibility: "PUBLIC", approved: true } } },
    select: { id: true, name: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    take: 50,
  });
}
