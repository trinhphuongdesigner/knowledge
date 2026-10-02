type StudyProgressProps = {
  current: number;
  total: number;
  known: number;
  unknown: number;
};

export function StudyProgress({ current, total, known, unknown }: StudyProgressProps) {
  const shown = Math.min(current, total);
  const pct = total === 0 ? 0 : Math.round((shown / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-ink-900">
          {shown} / {total}
        </span>
        <span className="flex items-center gap-3 text-xs text-ink-600">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-green-500" aria-hidden /> Đã thuộc {known}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" aria-hidden /> Chưa thuộc {unknown}
          </span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={shown}
        aria-label="Tiến độ học"
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-200/70"
      >
        <div className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-400 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
