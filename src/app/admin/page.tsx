import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminRegion, DashboardBodySkeleton } from "@/components/admin/AdminSkeletons";
import { BarChart } from "@/components/admin/charts";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Card, Breadcrumbs } from "@/components/ui";
import { formatNumber } from "@/i18n/format";
import { getLocale, getT } from "@/i18n/server";
import { formatBytes, getDashboardStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: t("meta.root") };
}

const quickLinks = [
  { href: "/admin/users", key: "nav.users" },
  { href: "/admin/categories", key: "nav.categories" },
  { href: "/admin/sets", key: "nav.library" },
  { href: "/admin/notifications", key: "nav.notifications" },
  { href: "/admin/ai", key: "dashboard.quickAi" },
  { href: "/admin/audit", key: "nav.audit" },
  { href: "/admin/system", key: "nav.system" },
] as const;

export default async function AdminPage() {
  await requireAdmin();
  const t = await getT("admin");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("nav.overview")}</h1>
      <Suspense
        fallback={
          <AdminRegion>
            <DashboardBodySkeleton />
          </AdminRegion>
        }
      >
        <DashboardBody />
      </Suspense>
    </div>
  );
}

/** Phần chậm (truy vấn thống kê) tách ra để tiêu đề hiện ngay. */
async function DashboardBody() {
  const [s, t, locale] = await Promise.all([getDashboardStats(), getT("admin"), getLocale()]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard locale={locale} label={t("dashboard.users")} value={s.users} hint={t("dashboard.usersHint", { n7: s.new7, n30: s.new30 })} href="/admin/users" />
        <StatCard locale={locale} label={t("dashboard.active7")} value={s.active7} hint={t("dashboard.reviewedHint")} />
        <StatCard
          locale={locale}
          label={t("dashboard.sets")}
          value={s.setsPrivate + s.setsLink + s.setsPublic}
          hint={t("dashboard.setsHint", { priv: s.setsPrivate, link: s.setsLink, pub: s.setsPublic })}
        />
        <StatCard locale={locale} label={t("dashboard.cards")} value={s.cards} />
        <StatCard locale={locale} label={t("dashboard.pending")} value={s.pending} hint={t("dashboard.publicSetsHint")} href="/admin/sets" tone={s.pending > 0 ? "warn" : undefined} />
        <StatCard locale={locale} label={t("dashboard.locked")} value={s.disabled} href="/admin/users" />
        <StatCard locale={locale} label={t("dashboard.dbSize")} value={formatBytes(s.dbBytes)} href="/admin/system" />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-ink-200 bg-surface px-3 py-1 text-sm text-ink-700 hover:border-brand-400 hover:text-accent"
          >
            {t(l.key)}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">{t("dashboard.signupsTitle")}</h2>
          <BarChart locale={locale} data={s.signups} label={t("dashboard.signupsLabel")} unit={t("dashboard.signupsUnit")} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">{t("dashboard.reviewsTitle")}</h2>
          <BarChart locale={locale} data={s.reviews} label={t("dashboard.reviewsLabel")} unit={t("dashboard.reviewsUnit")} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">{t("dashboard.categories")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">{t("dashboard.colName")}</th>
                <th className="py-1 text-right font-medium">{t("dashboard.colSets")}</th>
                <th className="py-1 text-right font-medium">{t("dashboard.colCards")}</th>
              </tr>
            </thead>
            <tbody>
              {s.categories.map((c) => (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="py-1.5">{c.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatNumber(locale, c.sets)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatNumber(locale, c.cards)}</td>
                </tr>
              ))}
              {s.categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-center text-ink-500">
                    {t("dashboard.noCategories")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
