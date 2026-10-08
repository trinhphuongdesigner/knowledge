import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminListSkeleton, AdminPagerSkeleton, AdminRegion } from "@/components/admin/AdminSkeletons";
import { PendingSets } from "@/components/admin/PendingSets";
import { PublicSets } from "@/components/admin/sets/PublicSets";
import { Button, ButtonLink, Card, Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("sets.title")} — ${t("meta.suffix")}` };
}

const PAGE_SIZE = 20;

export default async function AdminSetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const t = await getT("admin");
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const tab = one(sp.tab) === "public" ? "public" : "pending";
  const q = one(sp.q)?.trim().slice(0, 100) ?? "";
  const page = Math.max(1, Math.floor(Number(one(sp.page))) || 1);

  const [pendingCount, publicCount] = await Promise.all([
    db.studySet.count({ where: { visibility: "PUBLIC", approved: false } }),
    db.studySet.count({ where: { visibility: "PUBLIC", approved: true } }),
  ]);

  const tabs = [
    { key: "pending", label: t("sets.tabPending"), count: pendingCount },
    { key: "public", label: t("sets.tabPublic"), count: publicCount },
  ] as const;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("sets.title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("sets.title")}</h1>
      <div role="tablist" aria-label={t("sets.tabsAria")} className="flex gap-1 border-b border-ink-200">
        {tabs.map((tb) => (
          <Link
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            href={`/admin/sets?tab=${tb.key}`}
            className={cn(
              "-mb-px min-h-11 border-b-2 px-4 py-2.5 text-sm font-medium",
              tab === tb.key ? "border-brand-600 text-accent-strong" : "border-transparent text-ink-600 hover:text-ink-900",
            )}
          >
            {tb.label} ({tb.count})
          </Link>
        ))}
      </div>

      {tab === "public" && (
        <form action="/admin/sets" method="get" role="search" className="flex gap-2">
          <input type="hidden" name="tab" value="public" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("sets.searchPh")}
            aria-label={t("sets.searchAria")}
            className="min-h-11 flex-1 rounded-xl border border-ink-200 bg-surface px-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
          />
          <Button type="submit">{t("sets.searchBtn")}</Button>
        </form>
      )}

      <Suspense
        key={`${tab}:${q}:${page}`}
        fallback={
          <AdminRegion className="space-y-4">
            <AdminListSkeleton rows={tab === "public" ? 8 : 5} />
            {tab === "public" && <AdminPagerSkeleton />}
          </AdminRegion>
        }
      >
        {tab === "pending" ? <PendingTab /> : <PublicTab q={q} page={page} />}
      </Suspense>
    </div>
  );
}

/** Tab chờ duyệt: truy vấn danh sách nằm trong Suspense để tiêu đề và tab hiện ngay. */
async function PendingTab() {
  const pending = await db.studySet.findMany({
    where: { visibility: "PUBLIC", approved: false },
    orderBy: { updatedAt: "asc" },
    take: 50,
    select: { id: true, title: true, user: { select: { email: true } }, _count: { select: { cards: true } } },
  });
  return (
    <Card>
      <PendingSets
        sets={pending.map((p) => ({ id: p.id, title: p.title, ownerEmail: p.user.email, cardCount: p._count.cards }))}
      />
    </Card>
  );
}

async function PublicTab({ q, page }: { q: string; page: number }) {
  const t = await getT("admin");
  const publicWhere = {
    visibility: "PUBLIC" as const,
    approved: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const href = (p: number) => {
    const u = new URLSearchParams({ tab: "public" });
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    return `/admin/sets?${u.toString()}`;
  };

  const [total, rows] = await Promise.all([
    db.studySet.count({ where: publicWhere }),
    db.studySet.findMany({
      where: publicWhere,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        featured: true,
        user: { select: { email: true } },
        category: { select: { name: true } },
        _count: { select: { cards: true, subscribers: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="space-y-4">
      <Card>
        <PublicSets
          sets={rows.map((s) => ({
            id: s.id,
            title: s.title,
            featured: s.featured,
            ownerEmail: s.user.email,
            categoryName: s.category.name,
            cardCount: s._count.cards,
            subscriberCount: s._count.subscribers,
          }))}
          emptyText={q ? t("sets.emptySearch") : t("sets.emptyPublic")}
        />
      </Card>
      {pages > 1 && (
        <nav aria-label={t("sets.paginationAria")} className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <ButtonLink href={href(page - 1)} variant="secondary">
              {t("sets.prevPage")}
            </ButtonLink>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-500">
            {t("sets.pageOf", { page, pages })}
          </span>
          {page < pages ? (
            <ButtonLink href={href(page + 1)} variant="secondary">
              {t("sets.nextPage")}
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
