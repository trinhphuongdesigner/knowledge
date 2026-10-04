import type { Metadata } from "next";
import { RunCleanupButton } from "@/components/admin/dashboard/RunCleanupButton";
import { Card, Breadcrumbs } from "@/components/ui";
import { formatDate } from "@/i18n/format";
import { getLocale, getT, type TFunction } from "@/i18n/server";
import { formatBytes, getSystemStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("system.title")} — ${t("meta.suffix")}` };
}

const DT_OPTS: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" };

function FailTable({ title, head, rows, t }: { title: string; head: string; rows: { key: string | null; n: number }[]; t: TFunction<"admin"> }) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold text-ink-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-600">{t("system.noFails")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">{head}</th>
                <th className="py-1 text-right font-medium">{t("system.colCount")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key ?? "—"} className="border-t border-ink-100">
                  <td className="max-w-[16rem] truncate py-1.5 font-mono text-xs">{r.key ?? t("system.unknown")}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default async function AdminSystemPage() {
  await requireAdmin();
  const [s, t, locale] = await Promise.all([getSystemStats(), getT("admin"), getLocale()]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("system.title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("system.title")}</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">{t("system.cron")}</h2>
        {s.jobs.length === 0 ? (
          <p className="text-sm text-ink-600">{t("system.noRuns")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">{t("system.colName")}</th>
                  <th className="py-1 pr-3 font-medium">{t("system.colLastRun")}</th>
                  <th className="py-1 pr-3 font-medium">{t("system.colResult")}</th>
                  <th className="py-1 font-medium">{t("system.colDetail")}</th>
                </tr>
              </thead>
              <tbody>
                {s.jobs.map((j) => (
                  <tr key={j.name} className="border-t border-ink-100">
                    <td className="py-1.5 pr-3 font-medium">{j.name}</td>
                    <td className="whitespace-nowrap py-1.5 pr-3">{formatDate(locale, j.lastRunAt, DT_OPTS)}</td>
                    <td className={`py-1.5 pr-3 font-medium ${j.ok ? "text-emerald-600" : "text-red-600"}`}>{j.ok ? t("system.ok") : t("system.fail")}</td>
                    <td className="py-1.5 font-mono text-xs text-ink-600">{j.result ? JSON.stringify(j.result) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 border-t border-ink-100 pt-4">
          <RunCleanupButton />
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold text-ink-900">{t("system.dbTitle")}</h2>
        <p className="mb-3 text-sm text-ink-600">{t("system.dbTotal", { size: formatBytes(s.dbBytes) })}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">{t("system.colTable")}</th>
                <th className="py-1 text-right font-medium">{t("system.colSize")}</th>
              </tr>
            </thead>
            <tbody>
              {s.tables.map((tb) => (
                <tr key={tb.name} className="border-t border-ink-100">
                  <td className="py-1.5">{tb.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatBytes(tb.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <FailTable t={t} title={t("system.failByIp")} head={t("system.colIp")} rows={s.failedByIp} />
        <FailTable t={t} title={t("system.failByEmail")} head={t("system.colEmail")} rows={s.failedByEmail} />
      </div>
    </div>
  );
}
