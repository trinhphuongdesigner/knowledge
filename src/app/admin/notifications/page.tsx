import type { Metadata } from "next";
import { BroadcastForm } from "@/components/admin/notifications/BroadcastForm";
import { Card, Breadcrumbs } from "@/components/ui";
import { formatDate } from "@/i18n/format";
import { getLocale, getT } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("notifications.metaTitle")} — ${t("meta.suffix")}` };
}

const DT_OPTS: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" };

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const [t, locale] = await Promise.all([getT("admin"), getLocale()]);
  const history = await db.adminAuditLog.findMany({
    where: { action: "notify.broadcast" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, summary: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("notifications.title") }]} className="mb-0" />
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("notifications.title")}</h1>
        <p className="mt-1 text-sm text-ink-600">
          {t("notifications.desc")}
        </p>
      </div>

      <Card>
        <BroadcastForm />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">{t("notifications.history")}</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink-600">{t("notifications.noHistory")}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {history.map((h) => (
              <li key={h.id} className="py-2 text-sm">
                <p className="break-words text-ink-900">{h.summary}</p>
                <p className="text-xs text-ink-500">{formatDate(locale, h.createdAt, DT_OPTS)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
