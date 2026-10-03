import type { Metadata } from "next";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Danh mục — Quản trị" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const [categories, cardRows] = await Promise.all([
    listCategories(),
    db.$queryRaw<{ id: string; n: number }[]>`
      SELECT s."categoryId"::text AS id, COUNT(c.id)::int AS n
      FROM "Card" c JOIN "StudySet" s ON s.id = c."setId"
      GROUP BY s."categoryId"`,
  ]);
  const cards = new Map(cardRows.map((r) => [r.id, r.n]));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Danh mục</h1>
        <p className="mt-1 text-sm text-ink-600">
          Danh mục dùng chung cho toàn hệ thống. Thứ tự ở đây cũng là thứ tự hiển thị cho người dùng.
        </p>
      </div>
      <CategoryManager initialCategories={categories.map((c) => ({ ...c, cardCount: cards.get(c.id) ?? 0 }))} />
    </div>
  );
}
