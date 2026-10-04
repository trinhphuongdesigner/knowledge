import { BookOpen } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import { formatDate } from "@/i18n/format";
import { getLocale, getT, type TFunction } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { db } from "@/lib/db";
import { buildHistory, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/utils";

const DATE_OPTS: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" };

export async function StudyHistory({ userId }: { userId: string }) {
  const [t, locale] = await Promise.all([getT("account"), getLocale()]);
  // Một query: chỉ lấy các trường cần thiết; id thẻ dùng để lọc id đã bị xoá.
  const progress = await db.studyProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      known: true,
      unknown: true,
      completedAt: true,
      updatedAt: true,
      set: { select: { id: true, title: true, category: true, cards: { select: { id: true } } } },
    },
  });

  const { items, summary } = buildHistory(
    progress.map((p) => ({
      setId: p.set.id,
      title: p.set.title,
      category: { name: p.set.category.name, color: p.set.category.color, isEnglish: p.set.category.isEnglish },
      cardIds: p.set.cards.map((c) => c.id),
      known: p.known,
      unknown: p.unknown,
      completedAt: p.completedAt,
      updatedAt: p.updatedAt,
    })),
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t("history.emptyTitle")}
        description={t("history.emptyDescription")}
        action={<ButtonLink href="/">{t("history.emptyAction")}</ButtonLink>}
      />
    );
  }

  const parts = [
    summary.knownWords > 0 && t("history.words", { count: summary.knownWords }),
    summary.knownCards > 0 && t("history.cards", { count: summary.knownCards }),
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("history.mastered")} value={String(summary.known)} hint={parts.join(" · ") || "—"} />
        <Stat label={t("history.setsStudied")} value={String(summary.sets)} />
        <Stat label={t("history.progress")} value={`${summary.percent}%`} hint={t("history.progressHint", { known: summary.known, total: summary.total })} />
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <HistoryRow key={it.setId} item={it} t={t} locale={locale} />
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-3 sm:p-4">
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900 sm:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </Card>
  );
}

function HistoryRow({ item, t, locale }: { item: HistoryItem; t: TFunction<"account">; locale: Locale }) {
  const done = item.status === "completed";
  return (
    <li>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/sets/${item.setId}`}
            className="min-w-0 truncate font-semibold text-ink-900 hover:text-accent focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            {item.title}
          </Link>
          <CategoryBadge category={item.category} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-ink-600">
            <span className={cn("font-medium", done ? "text-emerald-600" : "text-accent")}>
              {done ? t("history.completed") : t("history.inProgress")}
            </span>
            <span>
              {item.known}/{item.total} · {item.percent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={t("history.progressOf", { title: item.title })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.percent}
            className="h-2 overflow-hidden rounded-full bg-ink-100"
          >
            <div
              className={cn("h-full rounded-full", done ? "bg-emerald-500" : "bg-brand-600")}
              style={{ width: `${item.percent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <time dateTime={item.lastStudiedAt.toISOString()} className="text-xs text-ink-500">
            {t("history.lastStudied", { date: formatDate(locale, item.lastStudiedAt, DATE_OPTS) })}
          </time>
          <ButtonLink href={`/sets/${item.setId}/study`} variant="secondary" size="sm">
            {done ? t("history.studyAgain") : t("history.continue")}
          </ButtonLink>
        </div>
      </Card>
    </li>
  );
}
