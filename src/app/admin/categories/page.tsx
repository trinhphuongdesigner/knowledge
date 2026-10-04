import type { Metadata } from "next";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("categories.title")} — ${t("meta.suffix")}` };
}

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const t = await getT("admin");
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
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("categories.title") }]} className="mb-0" />
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("categories.title")}</h1>
        <p className="mt-1 text-sm text-ink-600">
          {t("categories.desc")}
        </p>
      </div>
      <CategoryManager initialCategories={categories.map((c) => ({ ...c, cardCount: cards.get(c.id) ?? 0 }))} />
    </div>
  );
}
