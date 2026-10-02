import { CalendarCheck } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";
import { getDueSummary } from "./queries";

/** Thẻ gọn trên trang chủ: số thẻ cần ôn hôm nay + tiến độ mục tiêu ngày. */
export async function DueTodayCard({ userId }: { userId: string }) {
  const s = await getDueSummary(userId);
  if (!s.hasCards) return null;

  const pct = Math.min(100, Math.round((s.doneToday / Math.max(1, s.goal)) * 100));
  const nothing = s.dueCount === 0 && s.newCount === 0;

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-sun-200 text-accent-strong shadow-[0_3px_0_var(--color-sun-400)]">
          <CalendarCheck className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">
            {nothing ? (
              "Hôm nay bạn đã ôn xong 🎉"
            ) : (
              <>
                Hôm nay cần ôn: {s.dueCount} thẻ · Mới: {s.newCount}
              </>
            )}
          </p>
          <p className="text-xs text-ink-600">
            Mục tiêu {s.doneToday}/{s.goal}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={s.goal}
            aria-valuenow={Math.min(s.doneToday, s.goal)}
            aria-label="Mục tiêu ôn hôm nay"
            className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-ink-200/70"
          >
            <div className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-400" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      {!nothing && (
        <ButtonLink href="/review" className="shrink-0">
          Bắt đầu ôn
        </ButtonLink>
      )}
    </Card>
  );
}
