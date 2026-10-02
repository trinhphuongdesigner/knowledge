import { Flame } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { loadStudyStats } from "./loadStats";

/** Streak + tiến độ mục tiêu hôm nay + biểu đồ cột nhỏ 14 ngày. Server component. */
export async function StreakCard({ userId }: { userId: string }) {
  const [stats, user] = await Promise.all([
    loadStudyStats(userId),
    db.user.findUnique({ where: { id: userId }, select: { dailyGoal: true } }),
  ]);
  const goal = user?.dailyGoal ?? 20;
  const last14 = stats.days.slice(-14);
  const today = last14[last14.length - 1];
  const done = today?.reviewed ?? 0;
  const pct = Math.min(100, Math.round((done / goal) * 100));
  const max = Math.max(1, goal, ...last14.map((d) => d.reviewed));

  const barW = 10;
  const gap = 4;
  const h = 32;
  const w = last14.length * (barW + gap) - gap;
  const label = `Số thẻ đã ôn 14 ngày gần nhất: ${last14.map((d) => d.reviewed).join(", ")}`;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`flex size-12 items-center justify-center rounded-2xl ${stats.streak > 0 ? "bg-orange-100 text-orange-500" : "bg-ink-100 text-ink-400"}`}
        >
          <Flame className="size-7" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none text-ink-900">
            {stats.streak} <span className="text-base font-semibold text-ink-600">ngày liên tiếp</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {stats.streak === 0
              ? "Học hôm nay để bắt đầu chuỗi mới"
              : done === 0
                ? "Học hôm nay để giữ chuỗi"
                : `Dài nhất: ${stats.longestStreak} ngày`}
          </p>
        </div>
        <svg
          role="img"
          aria-label={label}
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          className="ml-auto hidden shrink-0 sm:block"
        >
          {last14.map((d, i) => {
            const bh = d.reviewed === 0 ? 2 : Math.max(3, Math.round((d.reviewed / max) * h));
            return (
              <rect
                key={d.day}
                x={i * (barW + gap)}
                y={h - bh}
                width={barW}
                height={bh}
                rx={2}
                className={d.reviewed === 0 ? "fill-ink-200" : i === last14.length - 1 ? "fill-brand-600" : "fill-brand-500/70"}
              >
                <title>{`${d.day}: ${d.reviewed} thẻ`}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      <div className="min-w-0">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-600">
          <span>Mục tiêu hôm nay</span>
          <span className="font-medium text-ink-900">
            {done}/{goal} thẻ
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Tiến độ mục tiêu hôm nay"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-2 overflow-hidden rounded-full bg-ink-100"
        >
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-brand-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <Link href="/account?tab=stats" className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
          Xem thống kê
        </Link>
      </div>
    </Card>
  );
}
