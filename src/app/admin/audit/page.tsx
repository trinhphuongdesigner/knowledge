import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminPagerSkeleton, AdminRegion, AdminTableSkeleton } from "@/components/admin/AdminSkeletons";
import { Badge, ButtonLink, Card, Breadcrumbs } from "@/components/ui";
import { formatDate, formatNumber } from "@/i18n/format";
import { getLocale, getT } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("audit.metaTitle")} — ${t("meta.suffix")}` };
}

const PAGE_SIZE = 50;
const FILTERS = [
  { key: "", label: "audit.filterAll" },
  { key: "user", label: "audit.filterUser" },
  { key: "category", label: "audit.filterCategory" },
  { key: "set", label: "audit.filterSet" },
  { key: "notify", label: "audit.filterNotify" },
  { key: "system", label: "audit.filterSystem" },
] as const;

const DT_OPTS: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" };

function href(prefix: string, page: number) {
  const q = new URLSearchParams();
  if (prefix) q.set("action", prefix);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/audit?${s}` : "/admin/audit";
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const t = await getT("admin");
  const sp = await searchParams;
  const rawAction = typeof sp.action === "string" ? sp.action : "";
  const prefix = FILTERS.some((f) => f.key === rawAction) ? rawAction : "";
  const rawPage = Number(typeof sp.page === "string" ? sp.page : 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("audit.title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("audit.title")}</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={href(f.key, 1)}
            className={`rounded-full border px-3 py-1 text-sm ${
              prefix === f.key
                ? "border-brand-600 bg-brand-50 text-accent-strong"
                : "border-ink-200 bg-surface text-ink-700 hover:border-brand-400"
            }`}
          >
            {t(f.label)}
          </Link>
        ))}
      </div>

      <Suspense
        key={`${prefix}:${page}`}
        fallback={
          <AdminRegion className="space-y-6">
            <AdminTableSkeleton rows={12} cols={4} />
            <AdminPagerSkeleton />
          </AdminRegion>
        }
      >
        <AuditResults prefix={prefix} page={page} />
      </Suspense>
    </div>
  );
}

/** Phần chậm (truy vấn nhật ký) tách ra để tiêu đề và bộ lọc hiện ngay. */
async function AuditResults({ prefix, page }: { prefix: string; page: number }) {
  const [t, locale] = await Promise.all([getT("admin"), getLocale()]);
  const where = prefix ? { action: { startsWith: `${prefix}.` } } : {};
  const [total, logs] = await Promise.all([
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        summary: true,
        createdAt: true,
        admin: { select: { email: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Card>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-600">{t("audit.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="text-left text-xs text-ink-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">{t("audit.colTime")}</th>
                  <th className="py-1 pr-3 font-medium">{t("audit.colAction")}</th>
                  <th className="py-1 pr-3 font-medium">{t("audit.colSummary")}</th>
                  <th className="py-1 font-medium">{t("audit.colAdmin")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-ink-100 align-top">
                    <td className="whitespace-nowrap py-1.5 pr-3 text-ink-600">{formatDate(locale, l.createdAt, DT_OPTS)}</td>
                    <td className="py-1.5 pr-3">
                      <Badge tone="gray" className="font-mono">
                        {l.action}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-3">
                      {l.targetType === "user" && l.targetId ? (
                        <Link href={`/admin/users/${l.targetId}`} className="hover:text-accent">
                          {l.summary}
                        </Link>
                      ) : (
                        l.summary
                      )}
                    </td>
                    <td className="max-w-[12rem] truncate py-1.5 text-ink-600">{l.admin?.email ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>
          {t("audit.footer", { total: formatNumber(locale, total), page: Math.min(page, pages), pages })}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <ButtonLink href={href(prefix, page - 1)} variant="secondary" size="sm">
              {t("audit.prev")}
            </ButtonLink>
          )}
          {page < pages && (
            <ButtonLink href={href(prefix, page + 1)} variant="secondary" size="sm">
              {t("audit.next")}
            </ButtonLink>
          )}
        </div>
      </div>
    </>
  );
}
