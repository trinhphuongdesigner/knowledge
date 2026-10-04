"use client";

import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, RefreshCw, RotateCw, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

type ToolbarProps = {
  shuffle: boolean;
  swap: boolean;
  onToggleShuffle: () => void;
  onToggleSwap: () => void;
  onRestart: () => void;
};

export function StudyToolbar({ shuffle, swap, onToggleShuffle, onToggleSwap, onRestart }: ToolbarProps) {
  const t = useT("study");
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant={shuffle ? "primary" : "secondary"} onClick={onToggleShuffle} aria-pressed={shuffle}>
        <Shuffle className="size-4" aria-hidden /> {t("toolbar.shuffle")}
      </Button>
      <Button variant={swap ? "primary" : "secondary"} onClick={onToggleSwap} aria-pressed={swap}>
        <ArrowLeftRight className="size-4" aria-hidden /> {t("toolbar.swap")}
      </Button>
      <Button variant="secondary" onClick={onRestart}>
        <RefreshCw className="size-4" aria-hidden /> {t("toolbar.restart")}
      </Button>
    </div>
  );
}

type ControlsProps = {
  canPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFlip: () => void;
  onKnown: () => void;
  onUnknown: () => void;
  className?: string;
};

export function StudyControls({ canPrev, onPrev, onNext, onFlip, onKnown, onUnknown, className }: ControlsProps) {
  const t = useT("study");
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 border-t border-ink-200 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0",
        className,
      )}
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onUnknown} className="border-amber-300 text-amber-700 shadow-[0_3px_0_var(--color-amber-300)] hover:border-amber-400 hover:bg-amber-50 active:shadow-[0_1px_0_var(--color-amber-300)]">
          <X className="size-4" aria-hidden /> {t("controls.unknown")} <kbd className="hidden text-xs opacity-60 sm:inline">(J)</kbd>
        </Button>
        <Button variant="secondary" onClick={onKnown} className="border-green-300 text-green-700 shadow-[0_3px_0_var(--color-green-300)] hover:border-green-400 hover:bg-green-50 active:shadow-[0_1px_0_var(--color-green-300)]">
          <Check className="size-4" aria-hidden /> {t("controls.known")} <kbd className="hidden text-xs opacity-60 sm:inline">(K)</kbd>
        </Button>
        <div className="col-span-2 grid grid-cols-[auto_1fr_auto] gap-2">
          <Button variant="ghost" onClick={onPrev} disabled={!canPrev} aria-label={t("controls.prev")} className="min-w-11">
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <Button onClick={onFlip}>
            <RotateCw className="size-4" aria-hidden /> {t("controls.flip")}
          </Button>
          <Button variant="ghost" onClick={onNext} aria-label={t("controls.next")} className="min-w-11">
            <ChevronRight className="size-5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
