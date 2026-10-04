import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { UserAvatar } from "@/components/avatar";
import { displayName, fmtDate, fmtDateTime, fmtDayOnly } from "@/components/admin/users/format";
import { Badge, Button, Card, EmptyState, Breadcrumbs } from "@/components/ui";
import { fieldClass } from "@/components/ui/fieldStyles";
import { getLocale, getT } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/dal";
import { listUsers } from "@/lib/admin/users-data";
import {
  USER_FILTERS,
  USER_SORTS,
  parseUserListQuery,
  userListHref,
  type UserSort,
} from "@/lib/admin/users";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("users.title")} — ${t("meta.suffix")}` };
}
export const dynamic = "force-dynamic";

function pctClass(pct: number) {
  return pct >= 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-ink-500";
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const [t, locale] = await Promise.all([getT("admin"), getLocale()]);
  const q = parseUserListQuery(await searchParams);
  const { rows, total, pageSize } = await listUsers(q);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(q.page, pages);

  const sortHeader = (key: UserSort, label: string) => {
    const active = q.sort === key;
    const nextDir = active && q.dir === "desc" ? "asc" : "desc";
    return (
      <Link
        href={userListHref(q, { sort: key, dir: nextDir, page: 1 })}
        className={cn("inline-flex items-center gap-1 hover:text-accent", active && "text-ink-900")}
        aria-label={t("users.sortBy", { label })}
      >
        {label}
        {active && (q.dir === "desc" ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUp className="size-3" aria-hidden />)}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("users.title") }]} className="mb-0" />
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("users.title")}</h1>
        <p className="text-sm text-ink-600">{t(q.q || q.filter ? "users.countFiltered" : "users.count", { count: total })}</p>
      </div>

      <Card>
        <form method="get" action="/admin/users" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-ink-700">
            {t("users.search")}
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q.q}
                placeholder={t("users.searchPh")}
                maxLength={100}
                className={fieldClass(undefined, "min-h-11 pl-9")}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
            {t("users.filter")}
            <select name="filter" defaultValue={q.filter ?? ""} className={fieldClass(undefined, "min-h-11")}>
              <option value="">{t("users.filterAll")}</option>
              {USER_FILTERS.map((f) => (
                <option key={f} value={f}>
                  {t(`users.filter${f.charAt(0).toUpperCase()}${f.slice(1)}` as "users.filterDisabled")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
            {t("users.sort")}
            <select name="sort" defaultValue={q.sort} className={fieldClass(undefined, "min-h-11")}>
              {USER_SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`users.sort${s.charAt(0).toUpperCase()}${s.slice(1)}` as "users.sortSets")}
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="dir" value={q.dir} />
          <Button type="submit">{t("users.apply")}</Button>
          {(q.q || q.filter) && (
            <Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium text-ink-600 hover:text-accent">
              {t("users.clear")}
            </Link>
          )}
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title={t("users.emptyTitle")} description={t("users.emptyDesc")} />
      ) : (
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-ink-200 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3">{t("users.colAccount")}</th>
                  <th scope="col" className="px-3 py-3">{sortHeader("createdAt", t("users.colSignup"))}</th>
                  <th scope="col" className="px-3 py-3">{sortHeader("lastLoginAt", t("users.colLastLogin"))}</th>
                  <th scope="col" className="px-3 py-3">{t("users.colLastStudy")}</th>
                  <th scope="col" className="px-3 py-3 text-right">{sortHeader("sets", t("users.colSets"))}</th>
                  <th scope="col" className="px-3 py-3 text-right">{sortHeader("cards", t("users.colCards"))}</th>
                  <th scope="col" className="px-3 py-3 text-right">{t("users.colSaved")}</th>
                  <th scope="col" className="px-3 py-3 text-right">{t("users.colReviews")}</th>
                  <th scope="col" className="px-4 py-3">{t("users.colStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="flex min-w-0 items-center gap-3">
                        <UserAvatar src={u.avatarUrl} gender={u.gender} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink-900">{displayName(u)}</span>
                          <span className="block truncate text-xs text-ink-500">{u.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDate(locale, u.createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDateTime(locale, u.lastLoginAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDayOnly(locale, u.lastStudyDay)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      {u.sets} <span className={cn("text-xs", pctClass(u.setsPct))}>({u.setsPct}%)</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      {u.cards} <span className={cn("text-xs", pctClass(u.cardsPct))}>({u.cardsPct}%)</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{u.saved}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{u.reviews}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.role === "ADMIN" && <Badge tone="blue">{t("users.badgeAdmin")}</Badge>}
                        {u.disabledAt && <Badge tone="gray" className="bg-red-50 text-red-700 ring-red-600/20">{t("users.badgeLocked")}</Badge>}
                        {!u.onboardedAt && <Badge tone="gray">{t("users.badgeUnonboarded")}</Badge>}
                        {u.onboardedAt && !u.disabledAt && u.role !== "ADMIN" && <Badge tone="green">{t("users.badgeActive")}</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pages > 1 && (
        <nav aria-label={t("users.paginationAria")} className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={userListHref(q, { page: page - 1 })} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium text-ink-700 hover:bg-ink-100">
              <ChevronLeft className="size-4" aria-hidden /> {t("users.prev")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-600">
            {t("users.pageOf", { page, pages })}
          </span>
          {page < pages ? (
            <Link href={userListHref(q, { page: page + 1 })} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium text-ink-700 hover:bg-ink-100">
              {t("users.next")} <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
