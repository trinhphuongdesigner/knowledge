import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/admin/charts";
import { AiTabs } from "@/components/admin/ai/AiTabs";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Card, Breadcrumbs } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/i18n/format";
import { getLocale, getT, type TFunction } from "@/i18n/server";
import { getAiStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("ai.title")} — ${t("meta.suffix")}` };
}

type Row = { id: string; email: string; total: number; limit: number };

function TopTable({ rows, perDay, t, locale }: { rows: Row[]; perDay: boolean; t: TFunction<"admin">; locale: Locale }) {
  if (rows.length === 0) return <p className="text-sm text-ink-600">{t("ai.noData")}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-ink-500">
          <tr>
            <th className="py-1 font-medium">{t("ai.colEmail")}</th>
            <th className="py-1 text-right font-medium">{t("ai.colCount")}</th>
            <th className="py-1 text-right font-medium">{t("ai.colLimit")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-ink-100">
              <td className="max-w-[14rem] truncate py-1.5">
                <Link href={`/admin/users/${r.id}`} className="hover:text-accent">
                  {r.email}
                </Link>
              </td>
              <td className={`py-1.5 text-right tabular-nums ${perDay && r.total >= r.limit ? "font-semibold text-red-600" : ""}`}>
                {formatNumber(locale, r.total)}
              </td>
              <td className="py-1.5 text-right tabular-nums">{formatNumber(locale, r.limit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminAiPage() {
  await requireAdmin();
  const [s, t, locale] = await Promise.all([getAiStats(), getT("admin"), getLocale()]);
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("ai.title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("ai.title")}</h1>
      <AiTabs active="/admin/ai" t={t} />
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard locale={locale} label={t("ai.today")} value={s.totalToday} hint={t("ai.unitUses")} />
        <StatCard locale={locale} label={t("ai.days30")} value={s.total30} hint={t("ai.unitUses")} />
      </div>
      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">{t("ai.seriesTitle")}</h2>
        <BarChart locale={locale} data={s.series} label={t("ai.seriesLabel")} unit={t("ai.seriesUnit")} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">{t("ai.topToday")}</h2>
          <TopTable rows={s.topToday} perDay t={t} locale={locale} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">{t("ai.top30")}</h2>
          <TopTable rows={s.top30} perDay={false} t={t} locale={locale} />
        </Card>
      </div>
    </div>
  );
}
