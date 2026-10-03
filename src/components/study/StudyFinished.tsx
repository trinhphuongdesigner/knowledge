"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { cn } from "@/lib/utils";

type Props = {
  setId: string;
  title: string;
  total: number;
  knownCount: number;
  unknownCount: number;
  unmarkedCount: number;
  /** Cards that are not marked known (what "study again" would reopen). */
  remainingCount: number;
  /** The quiz needs at least 2 cards. */
  canQuiz: boolean;
  onRestartUnknown: () => void;
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
  remainingCount,
  canQuiz,
  onRestartUnknown,
  onRestartAll,
}: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), ARM_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const guard = !armed ? { "aria-disabled": true, tabIndex: -1 } : {};

  return (
    <div className="index-card flex animate-rise flex-col items-center rounded-3xl border border-ink-200 px-6 pt-16 pb-10 text-center shadow-[0_2px_0_var(--color-ink-200),0_20px_40px_-20px_rgb(70_63_53/0.35)] motion-reduce:animate-none">
      <div className="mb-4 flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-sun-300 text-ink-900 shadow-[0_4px_0_var(--color-sun-400)]">
        <PartyPopper className="size-7" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-ink-900">Đã học hết!</h2>
      <p className="mt-1 text-sm text-ink-600">
        Bạn đã xem hết {total} thẻ của &ldquo;{title}&rdquo;.
      </p>
      <dl className={cn("mt-6 grid w-full max-w-sm gap-3", unmarkedCount > 0 ? "grid-cols-3" : "grid-cols-2")}>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3">
          <dt className="text-xs text-green-700">Đã thuộc</dt>
          <dd className="text-2xl font-semibold text-green-700">{knownCount}</dd>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <dt className="text-xs text-amber-700">Chưa thuộc</dt>
          <dd className="text-2xl font-semibold text-amber-700">{unknownCount}</dd>
        </div>
        {unmarkedCount > 0 && (
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-3">
            <dt className="text-xs text-ink-600">Chưa đánh dấu</dt>
            <dd className="text-2xl font-semibold text-ink-900">{unmarkedCount}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {canQuiz && (
          <>
            <ButtonLink
              href={`/sets/${setId}/quiz`}
              className={cn(!armed && "pointer-events-none opacity-50")}
              {...guard}
            >
              Làm bài kiểm tra
            </ButtonLink>
            <p className="-mt-1 mb-1 text-xs text-ink-500">Gõ lại từ để nhớ lâu hơn</p>
          </>
        )}
        {remainingCount > 0 && (
          <Button variant={canQuiz ? "secondary" : "primary"} disabled={!armed} onClick={onRestartUnknown}>
            Học lại thẻ chưa thuộc
          </Button>
        )}
        <Button variant="ghost" disabled={!armed} onClick={onRestartAll}>
          Học lại tất cả
        </Button>
        <Link
          href={`/sets/${setId}`}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-accent hover:underline",
            !armed && "pointer-events-none opacity-50",
          )}
          {...guard}
        >
          Quay lại nhóm thẻ
        </Link>
      </div>
    </div>
  );
}
