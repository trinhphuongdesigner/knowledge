import { Library, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Container } from "@/components/layout/Container";
import { CategorySelectSkeleton, LibraryListSkeleton } from "@/components/library/LibrarySkeleton";
import { SetSaveButtons } from "@/components/library/SetSaveButtons";
import { LevelBadge } from "@/components/sets/LevelBadge";
import { Badge, Button, ButtonLink, Card, EmptyState, Breadcrumbs } from "@/components/ui";
import { getLocale, getT } from "@/i18n/server";
import { formatNumber } from "@/i18n/format";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { listLibrary, listLibraryCategories } from "@/lib/library";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("library");
  return { title: t("metaTitle") };
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const t = await getT("library");
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const q = one(sp.q)?.trim() ?? "";
  const category = one(sp.category)?.trim() ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-600">
          {t("subtitle")}
        </p>
      </div>

      <form action="/library" method="get" role="search" className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="min-h-11 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
          />
        </div>
        <Suspense fallback={<CategorySelectSkeleton />}>
          <CategorySelect category={category} />
        </Suspense>
        <Button type="submit">{t("searchButton")}</Button>
      </form>

      <Suspense key={`${q}|${category}|${page}`} fallback={<LibraryListSkeleton label={t("loading")} />}>
        <LibraryResults userId={user.id} q={q} category={category} page={page} />
      </Suspense>
    </Container>
  );
}

async function CategorySelect({ category }: { category: string }) {
  const [t, categories] = await Promise.all([getT("library"), listLibraryCategories()]);
  return (
    <select
      name="category"
      defaultValue={category}
      aria-label={t("categoryAria")}
      className="min-h-11 rounded-xl border border-ink-200 bg-surface px-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <option value="">{t("allCategories")}</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

async function LibraryResults({
  userId,
  q,
  category,
  page,
}: {
  userId: string;
  q: string;
  category: string;
  page: number;
}) {
  const [t, locale, { sets, hasMore }] = await Promise.all([
    getT("library"),
    getLocale(),
    listLibrary({ q, category, page }),
  ]);
  const ids = sets.map((s) => s.id);
  const [subs, mineRows] = await Promise.all([
    db.setSubscription.findMany({ where: { userId, setId: { in: ids } }, select: { setId: true } }),
    db.studySet.findMany({ where: { userId, id: { in: ids } }, select: { id: true } }),
  ]);
  const subscribed = new Set(subs.map((s) => s.setId));
  const owned = new Set(mineRows.map((s) => s.id));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (category) u.set("category", category);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/library${s ? `?${s}` : ""}`;
  };

  return (
    <>
      {sets.length === 0 ? (
        <EmptyState
          icon={Library}
          title={q || category ? t("emptyFilteredTitle") : t("emptyTitle")}
          description={
            q || category
              ? t("emptyFilteredDescription")
              : t("emptyDescription")
          }
          action={
            <ButtonLink href="/" variant="secondary">
              {t("backHome")}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((s, i) => {
            const mine = owned.has(s.id);
            const saved = subscribed.has(s.id);
            const target = mine || saved ? `/sets/${s.id}` : s.token ? `/s/${s.token}` : `/sets/${s.id}`;
            return (
              <li key={s.id} style={{ "--i": i } as CSSProperties}>
                <Card className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {s.featured && <Badge tone="blue">{t("featured")}</Badge>}
                    <CategoryBadge category={s.category} />
                    <LevelBadge level={s.level} />
                  </div>
                  <h2 className="line-clamp-2 break-words text-base font-semibold text-ink-900">
                    <Link
                      href={target}
                      className="hover:text-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      {s.title}
                    </Link>
                  </h2>
                  {s.description && <p className="line-clamp-3 break-words text-sm text-ink-600">{s.description}</p>}
                  <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    <span>{t("by", { name: s.ownerName ?? t("anonymous") })}</span>
                    <span>{t("cardCount", { count: s.cardCount })}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" aria-hidden />
                      {t("savedCount", { count: s.subscriberCount })}
                    </span>
                  </p>
                  {mine ? (
                    <p className="text-sm font-medium text-accent-strong">{t("yours")}</p>
                  ) : (
                    <SetSaveButtons setId={s.id} subscribed={saved} />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label={t("pagination")} className="mt-8 flex items-center justify-between gap-3">
          {page > 1 ? (
            <ButtonLink href={href(page - 1)} variant="secondary">
              {t("prev")}
            </ButtonLink>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-500">{t("page", { page: formatNumber(locale, page) })}</span>
          {hasMore ? (
            <ButtonLink href={href(page + 1)} variant="secondary">
              {t("next")}
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
