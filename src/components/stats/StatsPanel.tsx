import { BarChart3 } from "lucide-react";
import { ButtonLink, Card, EmptyState } from "@/components/ui";
import type { StudyStatsDTO } from "@/lib/validators";
import { loadStudyStats } from "./loadStats";

const LEVEL_CLASS = ["fill-ink-100", "fill-brand-500/30", "fill-brand-500/55", "fill-brand-600/80", "fill-brand-700"];

function level(reviewed: number, max: number): number {
  if (reviewed <= 0) return 0;
  const r = reviewed / max;
  return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
}

function fmtDay(key: string) {
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
}

export async function StatsPanel({ userId }: { userId: string }) {
  const stats = await loadStudyStats(userId);
  if (stats.totalReviewed === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Chưa có thống kê"
        description="Ôn thẻ để bắt đầu chuỗi ngày học và xem tiến độ của bạn."
        action={<ButtonLink href="/review">Ôn hôm nay</ButtonLink>}
      />
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Chuỗi hiện tại" value={`${stats.streak} ngày`} />
        <Stat label="Chuỗi dài nhất" value={`${stats.longestStreak} ngày`} />
        <Stat label="Tổng lượt ôn" value={stats.totalReviewed.toLocaleString("vi-VN")} />
        <Stat label="Độ chính xác" value={`${Math.round(stats.accuracy * 100)}%`} />
      </div>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">90 ngày gần nhất</h2>
        <Heatmap days={stats.days} />
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">30 ngày gần nhất</h2>
        <Bars days={stats.days.slice(-30)} />
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
function Heatmap({ days }: { days: StudyStatsDTO["days"] }) {
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
        aria-label={`Biểu đồ nhiệt 90 ngày gần nhất, tổng ${total} lượt ôn`}
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
              <title>{`${fmtDay(d.day)}: ${d.reviewed} thẻ, đúng ${d.correct}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-ink-500" aria-hidden>
        Ít
        <svg width={5 * 14} height={12}>
          {LEVEL_CLASS.map((c, i) => (
            <rect key={c} x={i * 14} width={11} height={11} rx={2} className={c} />
          ))}
        </svg>
        Nhiều
      </div>
    </div>
  );
}

function Bars({ days }: { days: StudyStatsDTO["days"] }) {
  const max = Math.max(1, ...days.map((d) => d.reviewed));
  const barW = 14;
  const gap = 4;
  const h = 96;
  const w = days.length * (barW + gap) - gap;
  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label={`Số thẻ đã ôn mỗi ngày trong 30 ngày gần nhất, cao nhất ${max}`}
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
              <title>{`${fmtDay(d.day)}: ${d.reviewed} thẻ, đúng ${d.correct}`}</title>
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
          Đúng
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block size-2.5 rounded-sm bg-amber-400" />
          Sai
        </span>
      </p>
    </div>
  );
}
