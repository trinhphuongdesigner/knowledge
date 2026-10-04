import { BarChart3 } from "lucide-react";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import type { StudyStatsDTO } from "@/lib/validators";
import { formatDate, formatNumber } from "@/i18n/format";
import type { Locale } from "@/i18n/config";
import { getLocale, getT, type TFunction } from "@/i18n/server";
import { loadStudyStats } from "./loadStats";

type StatsT = TFunction<"stats">;

const LEVEL_CLASS = ["fill-ink-100", "fill-brand-500/30", "fill-brand-500/55", "fill-brand-600/80", "fill-brand-700"];

function level(reviewed: number, max: number): number {
  if (reviewed <= 0) return 0;
  const r = reviewed / max;
  return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
}

function fmtDay(locale: Locale, key: string) {
  return formatDate(locale, `${key}T00:00:00Z`, { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function StatsPanel({ userId }: { userId: string }) {
  const [t, locale] = await Promise.all([getT("stats"), getLocale()]);
  const stats = await loadStudyStats(userId);
  if (stats.totalReviewed === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title={t("panel.emptyTitle")}
        description={t("panel.emptyDescription")}
        action={<ButtonLink href="/review">{t("panel.reviewToday")}</ButtonLink>}
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t("panel.streak")} value={t("panel.days", { count: stats.streak })} />
        <Stat label={t("panel.longest")} value={t("panel.days", { count: stats.longestStreak })} />
        <Stat label={t("panel.total")} value={formatNumber(locale, stats.totalReviewed)} />
        <Stat label={t("panel.accuracy")} value={`${Math.round(stats.accuracy * 100)}%`} />
      </div>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">{t("panel.last90")}</h2>
        <Heatmap days={stats.days} t={t} locale={locale} />
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">{t("panel.last30")}</h2>
        <Bars days={stats.days.slice(-30)} t={t} locale={locale} />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 sm:p-4">
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900">{value}</p>
    </Card>
  );
}

/** Heatmap kiểu GitHub: cột = tuần (thứ Hai đầu tuần), hàng = thứ trong tuần. */
function Heatmap({ days, t, locale }: { days: StudyStatsDTO["days"]; t: StatsT; locale: Locale }) {
  const max = Math.max(1, ...days.map((d) => d.reviewed));
  const cell = 14;
  const gap = 3;
  // 0 = thứ Hai … 6 = Chủ nhật
  const dow = (key: string) => (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
  const offset = dow(days[0].day);
  const cols = Math.ceil((offset + days.length) / 7);
  const w = cols * (cell + gap) - gap;
  const h = 7 * (cell + gap) - gap;
  const total = days.reduce((s, d) => s + d.reviewed, 0);
  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label={t("panel.heatmapAria", { total })}
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="mx-auto max-w-full"
      >
        {days.map((d, i) => {
          const idx = offset + i;
          return (
            <rect
              key={d.day}
              x={Math.floor(idx / 7) * (cell + gap)}
              y={(idx % 7) * (cell + gap)}
              width={cell}
              height={cell}
              rx={3}
              className={LEVEL_CLASS[level(d.reviewed, max)]}
            >
              <title>{t("panel.dayTitle", { day: fmtDay(locale, d.day), reviewed: d.reviewed, correct: d.correct })}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-ink-500" aria-hidden>
        {t("panel.less")}
        <svg width={5 * 14} height={12}>
          {LEVEL_CLASS.map((c, i) => (
            <rect key={c} x={i * 14} width={11} height={11} rx={2} className={c} />
          ))}
        </svg>
        {t("panel.more")}
      </div>
    </div>
  );
}

function Bars({ days, t, locale }: { days: StudyStatsDTO["days"]; t: StatsT; locale: Locale }) {
  const max = Math.max(1, ...days.map((d) => d.reviewed));
  const barW = 14;
  const gap = 4;
  const h = 96;
  const w = days.length * (barW + gap) - gap;
  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label={t("panel.barsAria", { max })}
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="mx-auto max-w-full"
      >
        {days.map((d, i) => {
          const bh = d.reviewed === 0 ? 2 : Math.max(4, Math.round((d.reviewed / max) * h));
          const correctH = d.reviewed > 0 ? Math.round((d.correct / d.reviewed) * bh) : 0;
          return (
            <g key={d.day}>
              <title>{t("panel.dayTitle", { day: fmtDay(locale, d.day), reviewed: d.reviewed, correct: d.correct })}</title>
              <rect
                x={i * (barW + gap)}
                y={h - bh}
                width={barW}
                height={bh}
                rx={2}
                className={d.reviewed === 0 ? "fill-ink-200" : "fill-amber-400"}
              />
              {correctH > 0 && (
                <rect x={i * (barW + gap)} y={h - correctH} width={barW} height={correctH} rx={2} className="fill-brand-600" />
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 flex items-center justify-end gap-3 text-xs text-ink-500" aria-hidden>
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 rounded-sm bg-brand-600" />
          {t("panel.correct")}
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 rounded-sm bg-amber-400" />
          {t("panel.wrong")}
        </span>
      </p>
    </div>
  );
}
