"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ListChecks, PartyPopper, Repeat, RotateCcw, SkipForward } from "lucide-react";
import { Button, ButtonLink, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

type Props = {
  setId: string;
  title: string;
  total: number;
  knownCount: number;
  unknownCount: number;
  unmarkedCount: number;
  /** The quiz needs at least 2 cards. */
  canQuiz: boolean;
  /** Reopens exactly the `unknownCount` cards. */
  onRestartUnknown: () => void;
  /** Reopens exactly the `unmarkedCount` cards (skipped without a mark). */
  onRestartUnmarked: () => void;
  onRestartAll: () => void;
};

// Buttons stay inert briefly so the click that finished the last card cannot hit them.
const ARM_DELAY_MS = 800;

export function StudyFinished({
  setId,
  title,
  total,
  knownCount,
  unknownCount,
  unmarkedCount,
  canQuiz,
  onRestartUnknown,
  onRestartUnmarked,
  onRestartAll,
}: Props) {
  const t = useT("study");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), ARM_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const guard = !armed ? { "aria-disabled": true, tabIndex: -1 } : {};
  const hasRemaining = unknownCount > 0 || unmarkedCount > 0;

  return (
    <div className="index-card flex animate-rise flex-col items-center rounded-3xl border border-ink-200 px-6 pt-16 pb-10 text-center shadow-[0_2px_0_var(--color-ink-200),0_20px_40px_-20px_rgb(70_63_53/0.35)] motion-reduce:animate-none">
      <div className="mb-4 flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-sun-300 text-ink-900 shadow-[0_4px_0_var(--color-sun-400)]">
        <PartyPopper className="size-7" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-ink-900">{t("finished.title")}</h2>
      <p className="mt-1 text-sm text-ink-600">
        {t("finished.summary", { count: total, title })}
      </p>
      <dl className={cn("mt-6 grid w-full max-w-sm gap-3", unmarkedCount > 0 ? "grid-cols-3" : "grid-cols-2")}>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3">
          <dt className="text-xs text-green-700">{t("finished.known")}</dt>
          <dd className="text-2xl font-semibold text-green-700">{knownCount}</dd>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <dt className="text-xs text-amber-700">{t("finished.unknown")}</dt>
          <dd className="text-2xl font-semibold text-amber-700">{unknownCount}</dd>
        </div>
        {unmarkedCount > 0 && (
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-3">
            <dt className="text-xs text-ink-600">{t("finished.unmarked")}</dt>
            <dd className="text-2xl font-semibold text-ink-900">{unmarkedCount}</dd>
          </div>
        )}
      </dl>
      {/*
        Thứ bậc theo bước học tiếp theo: còn thẻ chưa thuộc → học lại chúng trước (chính), kiểm tra là bước sau (phụ);
        thuộc hết → kiểm tra là bước chính. "Học lại tất cả" / "Quay lại" là lối thoát, xếp thành hàng chữ ở cuối.
        Số trên mỗi nút đúng bằng số thẻ của lượt đó: thẻ chưa thuộc và thẻ chưa đánh dấu là hai nút riêng.
      */}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {unknownCount > 0 && (
          <Button size="lg" disabled={!armed} onClick={onRestartUnknown}>
            <RotateCcw className="size-4" aria-hidden />
            {t("finished.restartUnknown")}
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">{unknownCount}</span>
          </Button>
        )}
        {unmarkedCount > 0 && (
          <Button
            size="lg"
            variant={unknownCount > 0 ? "secondary" : "primary"}
            disabled={!armed}
            onClick={onRestartUnmarked}
          >
            <SkipForward className="size-4" aria-hidden />
            {t("finished.restartUnmarked")}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs tabular-nums",
                unknownCount > 0 ? "bg-ink-100" : "bg-white/20",
              )}
            >
              {unmarkedCount}
            </span>
          </Button>
        )}
        {canQuiz && (
          <Tooltip content={t("finished.quizHint")} className="w-full">
            <ButtonLink
              href={`/sets/${setId}/quiz`}
              variant={hasRemaining ? "secondary" : "primary"}
              size="lg"
              className={cn(!armed && "pointer-events-none opacity-50")}
              {...guard}
            >
              <ListChecks className="size-4" aria-hidden />
              {t("finished.quiz")}
            </ButtonLink>
          </Tooltip>
        )}
        {!hasRemaining && !canQuiz && (
          <Button size="lg" disabled={!armed} onClick={onRestartAll}>
            <Repeat className="size-4" aria-hidden />
            {t("finished.restartAll")}
          </Button>
        )}
      </div>
      <div className="mt-6 flex w-full max-w-xs items-center justify-between gap-2 border-t border-dashed border-ink-200 pt-3">
        <Link
          href={`/sets/${setId}`}
          className={cn(
            "-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-accent-strong hover:bg-ink-100",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
            !armed && "pointer-events-none opacity-50",
          )}
          {...guard}
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("finished.back")}
        </Link>
        {(hasRemaining || canQuiz) && (
          <Button variant="ghost" className="-mr-2 px-2" disabled={!armed} onClick={onRestartAll}>
            <Repeat className="size-4" aria-hidden />
            {t("finished.restartAll")}
          </Button>
        )}
      </div>
    </div>
  );
}
