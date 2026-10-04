import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/avatar";
import { UserActions } from "@/components/admin/users/UserActions";
import { displayName, fmtDate, fmtDateTime } from "@/components/admin/users/format";
import { Badge, Card, Breadcrumbs } from "@/components/ui";
import { getLocale, getT } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/dal";
import { isUuid } from "@/lib/ids";
import { usagePercent } from "@/lib/admin/users";
import { getUserDetail } from "@/lib/admin/users-data";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("user.metaTitle")} — ${t("meta.suffix")}` };
}
export const dynamic = "force-dynamic";

const VIS_KEY = { PRIVATE: "user.visPrivate", LINK: "user.visLink", PUBLIC: "user.visPublic" } as const;

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-ink-900">{value}</div>
      {hint && <div className="text-xs text-ink-500">{hint}</div>}
    </div>
  );
}

function Bars({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <svg viewBox={`0 0 ${data.length * 10} 48`} className="h-16 w-full" role="img" aria-label={label} preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = d.value === 0 ? 1 : Math.max(2, (d.value / max) * 44);
        return (
          <rect key={d.day} x={i * 10 + 1} y={46 - h} width={8} height={h} rx={1.5} className={d.value ? "fill-brand-600" : "fill-ink-200"}>
            <title>{`${d.day}: ${d.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [d, t, locale] = await Promise.all([getUserDetail(id), getT("admin"), getLocale()]);
  if (!d) notFound();
  const dt = (x: Date | string | null | undefined) => fmtDateTime(locale, x);
  const days = (n: number) => t("user.days", { count: n });
  const { user: u, limits } = d;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("admin"), href: "/admin" }, { label: t("users.title"), href: "/admin/users" }, { label: displayName(u) }]} className="mb-0" />

      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <UserAvatar src={u.avatarUrl} gender={u.gender} name={displayName(u)} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink-900">{displayName(u)}</h1>
            <p className="break-all text-sm text-ink-600">{u.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {u.isAdmin && <Badge tone="blue">{t("users.badgeAdmin")}</Badge>}
              {u.disabledAt && <Badge tone="gray" className="bg-red-50 text-red-700 ring-red-600/20">{t("users.badgeLocked")}</Badge>}
              {!u.onboardedAt && <Badge tone="gray">{t("users.badgeUnonboarded")}</Badge>}
            </div>
          </div>
        </div>

        {u.disabledAt && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            {t("user.lockedAt", { when: dt(u.disabledAt), reason: u.disabledReason ?? "—" })}
          </p>
        )}

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row label={t("user.fullName")} value={u.fullName ?? "—"} />
          <Row label={t("user.birthYear")} value={u.birthYear ?? "—"} />
          <Row label={t("user.nativeLanguage")} value={u.nativeLanguage ?? "—"} />
          <Row label={t("user.gender")} value={u.gender ?? "—"} />
          <Row label={t("user.signup")} value={dt(u.createdAt)} />
          <Row label={t("user.onboarded")} value={dt(u.onboardedAt)} />
          <Row label={t("user.lastLogin")} value={dt(u.lastLoginAt)} />
          <Row label={t("user.pushDevices")} value={d.pushCount} />
        </dl>

        {u.isAdmin ? (
          <p className="text-sm text-ink-500">{t("user.adminNote")}</p>
        ) : (
          <UserActions
            userId={u.id}
            email={u.email}
            disabled={!!u.disabledAt}
            quota={{ sets: u.quotaSets, cards: u.quotaCards, ai: u.quotaAiPerDay }}
            defaults={d.defaults}
            impact={{ ...d.impact, sets: d.counts.sets, cards: d.counts.cards }}
          />
        )}
      </Card>

      <section aria-labelledby="usage" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <h2 id="usage" className="sr-only">{t("user.usage")}</h2>
        <Stat label={t("user.statSets")} value={d.counts.sets} hint={`${t("user.ofLimit", { pct: usagePercent(d.counts.sets, limits.setsPerUser), limit: limits.setsPerUser })}${u.quotaSets !== null ? t("user.ownSuffix") : ""}`} />
        <Stat label={t("user.statCards")} value={d.counts.cards} hint={`${t("user.ofLimit", { pct: usagePercent(d.counts.cards, limits.cardsPerUser), limit: limits.cardsPerUser })}${u.quotaCards !== null ? t("user.ownSuffix") : ""}`} />
        <Stat label={t("user.statSaved")} value={d.counts.saved} />
        <Stat label={t("user.statReviews")} value={d.counts.reviews} />
        <Stat label={t("user.streakCurrent")} value={days(d.streak.current)} />
        <Stat label={t("user.streakLongest")} value={days(d.streak.longest)} />
        <Stat label={t("user.aiPerDay")} value={limits.aiPerDay} hint={u.quotaAiPerDay !== null ? t("user.customLimit") : t("user.defaultLimit")} />
        <Stat label={t("user.ai30")} value={d.ai30.reduce((s, a) => s + a.count, 0)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold text-ink-900">{t("user.reviews30")}</h2>
          <Bars data={d.last30.map((x) => ({ day: x.day, value: x.reviewed }))} label={t("user.reviews30Label")} />
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold text-ink-900">{t("user.aiUse30")}</h2>
          <Bars data={d.ai30.map((x) => ({ day: x.day, value: x.count }))} label={t("user.aiUse30Label")} />
        </Card>
      </div>

      <Card className="p-0 sm:p-0">
        <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">{t("user.setsTitle", { count: d.counts.sets })}</h2>
        {d.sets.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">{t("user.noSets")}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {d.sets.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm sm:px-5">
                <Link href={`/sets/${s.id}`} className="min-w-0 flex-1 truncate font-medium text-ink-900 hover:text-accent">
                  {s.title}
                </Link>
                <span className="text-ink-500">{s.category.name}</span>
                <span className="tabular-nums text-ink-500">{t("user.cardsCount", { count: s._count.cards })}</span>
                <span className="tabular-nums text-ink-500">{t("user.savedCount", { count: s._count.subscribers })}</span>
                <Badge tone={s.visibility === "PUBLIC" ? (s.approved ? "green" : "blue") : "gray"}>
                  {t(VIS_KEY[s.visibility])}
                  {s.visibility === "PUBLIC" && !s.approved ? t("user.pendingSuffix") : ""}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-0 sm:p-0">
          <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">{t("user.sessionsTitle", { count: d.sessions.length })}</h2>
          {d.sessions.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">{t("user.noSessions")}</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {d.sessions.map((s) => (
                <li key={s.id} className="px-4 py-2.5 text-sm sm:px-5">
                  <div className={cn("break-words text-ink-900", !s.userAgent && "text-ink-500")}>{s.userAgent ?? t("user.unknownDevice")}</div>
                  <div className="text-xs text-ink-500">
                    {t("user.sessionLine", { created: dt(s.createdAt), expires: fmtDate(locale, s.expiresAt) })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-0 sm:p-0">
          <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">{t("user.logsTitle")}</h2>
          {d.logs.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">{t("user.noLogs")}</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {d.logs.map((l) => (
                <li key={l.id} className="px-4 py-2.5 text-sm sm:px-5">
                  <div className="text-ink-900">{l.summary}</div>
                  <div className="text-xs text-ink-500">
                    {l.action} · {dt(l.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-100 py-1">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
