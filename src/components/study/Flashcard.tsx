"use client";

import { useEffect, type KeyboardEvent } from "react";
import { PhoneticLine, SpeakButton, speak } from "@/components/cards/SpeakButton";
import { Markdown } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/client";

/** English word info for the card; `side` is the face currently showing the question. */
export type FlashcardSpeech = {
  text: string;
  phonetic?: string | null;
  partOfSpeech?: string | null;
  audioUrl?: string | null;
  side: "front" | "back";
};

type FlashcardProps = {
  front: string;
  back: string;
  explanation?: string | null;
  /** Label shown on each face, e.g. "Câu hỏi" / "Đáp án". */
  frontLabel: string;
  backLabel: string;
  flipped: boolean;
  onFlip: () => void;
  /** ENGLISH sets only: phonetic line + speak button (and the S shortcut). */
  speech?: FlashcardSpeech;
};

function sizeClass(text: string) {
  const len = text.length;
  if (len < 60) return "text-2xl sm:text-3xl";
  if (len < 160) return "text-xl sm:text-2xl";
  if (len < 400) return "text-lg sm:text-xl";
  return "text-base sm:text-lg";
}

const face =
  "absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-ink-200 " +
  "shadow-[0_2px_0_var(--color-ink-200),0_20px_40px_-20px_rgb(70_63_53/0.35)] " +
  "[backface-visibility:hidden] motion-reduce:transition-opacity motion-reduce:duration-200";

const text = "m-auto w-full text-center font-semibold text-ink-900 [&_pre]:font-normal [&_table]:font-normal";

export function Flashcard({ front, back, explanation, frontLabel, backLabel, flipped, onFlip, speech }: FlashcardProps) {
  const t = useT("study");
  const speechText = speech?.text;
  const speechAudio = speech?.audioUrl;
  useEffect(() => {
    if (!speechText) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.key !== "s" && e.key !== "S")) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      speak(speechText!, speechAudio);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speechText, speechAudio]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return; // keys from the nested speak button must not flip the card
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onFlip();
    }
  }

  return (
    <div className="h-[min(26rem,60dvh)] w-full [perspective:1200px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? t("flashcard.ariaBack") : t("flashcard.ariaFront")}
        onClick={onFlip}
        onKeyDown={onKeyDown}
        className={cn(
          "relative h-full w-full cursor-pointer rounded-2xl transition-transform duration-600 ease-[cubic-bezier(0.34,1.3,0.5,1)] [transform-style:preserve-3d]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600",
          "motion-reduce:transform-none motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Front */}
        <div
          aria-hidden={flipped}
          aria-live={flipped ? "off" : "polite"}
          className={cn(face, "index-card", flipped && "motion-reduce:opacity-0")}
        >
          <span className="flex h-[3.25rem] shrink-0 items-center px-5">
            <span className="rounded-full bg-sun-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-800">{frontLabel}</span>
          </span>
          <div className="flex min-h-0 flex-1 overflow-y-auto px-5 pb-3">
            <Markdown className={cn(text, sizeClass(front))}>{front}</Markdown>
          </div>
          {speech?.side === "front" && (
            <div className="flex items-center justify-center gap-1 px-5">
              <PhoneticLine phonetic={speech.phonetic} partOfSpeech={speech.partOfSpeech} />
              <SpeakButton text={speech.text} audioUrl={speech.audioUrl} tabIndex={flipped ? -1 : 0} />
            </div>
          )}
          <span className="pb-3 text-center text-xs font-medium text-ink-400">{t("flashcard.hint")}</span>
        </div>

        {/* Back */}
        <div
          aria-hidden={!flipped}
          aria-live={flipped ? "polite" : "off"}
          className={cn(face, "index-card-back [transform:rotateY(180deg)] motion-reduce:transform-none", !flipped && "motion-reduce:opacity-0")}
        >
          <span className="flex h-[3.25rem] shrink-0 items-center px-5">
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">{backLabel}</span>
          </span>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5">
            <Markdown className={cn(text, sizeClass(back))}>{back}</Markdown>
            {speech?.side === "back" && (
              <div className="mt-2 flex shrink-0 items-center justify-center gap-1">
                <PhoneticLine phonetic={speech.phonetic} partOfSpeech={speech.partOfSpeech} />
                <SpeakButton text={speech.text} audioUrl={speech.audioUrl} tabIndex={flipped ? 0 : -1} />
              </div>
            )}
            {explanation && (
              <div className="mt-4 shrink-0 border-t border-ink-200 pt-3">
                <Markdown className="text-center text-sm text-ink-500">{explanation}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
