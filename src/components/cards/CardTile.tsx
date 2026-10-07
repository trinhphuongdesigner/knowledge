"use client";

import { Check, Flame, Pencil, Star } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Markdown } from "@/components/ui";
import { useT } from "@/i18n/client";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { PhoneticLine, SpeakButton } from "./SpeakButton";

const face =
  "absolute inset-0 flex flex-col overflow-hidden rounded-2xl border shadow-[0_1px_0_var(--color-ink-200),0_12px_24px_-16px_rgb(70_63_53/0.35)] " +
  "[backface-visibility:hidden] motion-reduce:transition-opacity motion-reduce:duration-200";

/** Thẻ ở chế độ xem dạng lưới: mặt trước là câu hỏi, bấm để lật xem đáp án. */
export function CardTile({
  card,
  index,
  english = false,
  known = false,
  starred = false,
  hard = false,
  readOnly = false,
  onToggleStar,
  onEdit,
}: {
  card: CardDTO;
  index: number;
  english?: boolean;
  known?: boolean;
  starred?: boolean;
  hard?: boolean;
  readOnly?: boolean;
  onToggleStar?: (card: CardDTO) => void;
  onEdit: (card: CardDTO) => void;
}) {
  const t = useT("cards");
  const [flipped, setFlipped] = useState(false);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return; // phím từ nút bên trong không lật thẻ
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  }

  const tools = (
    <div className="-mr-2 ml-auto flex shrink-0">
      {onToggleStar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(card);
          }}
          aria-pressed={starred}
          aria-label={starred ? t("item.unstar", { n: index }) : t("item.star", { n: index })}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl hover:bg-ink-100",
            starred ? "text-amber-500" : "text-ink-400 hover:text-ink-900",
          )}
        >
          <Star className={cn("size-4", starred && "fill-current")} aria-hidden />
        </button>
      )}
      {!readOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
          aria-label={t("item.edit", { n: index })}
          className="flex size-10 items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-900"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );

  return (
    <div className="h-56 w-full [perspective:1000px]">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? t("view.showQuestion", { n: index }) : t("view.showAnswer", { n: index })}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={onKeyDown}
        className={cn(
          "relative h-full w-full cursor-pointer rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.5,1)] [transform-style:preserve-3d]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600",
          "motion-reduce:transform-none motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Mặt trước */}
        <div
          aria-hidden={flipped}
          className={cn(
            face,
            "index-card",
            known ? "border-green-200" : "border-ink-200",
            flipped && "pointer-events-none motion-reduce:opacity-0",
          )}
        >
          <div className="flex h-[3.25rem] shrink-0 items-center gap-2 px-4">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                known ? "bg-green-100 text-green-700" : "bg-brand-50 text-accent-strong",
              )}
            >
              {known ? <Check className="size-3.5" aria-hidden /> : index}
            </span>
            <div className="flex min-w-0 flex-wrap gap-1">
              {hard && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700">
                  <Flame className="size-3" aria-hidden />
                  {t("item.hard")}
                </span>
              )}
              {known && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
                  {t("item.known")}
                </span>
              )}
            </div>
            {!flipped && tools}
          </div>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-2 text-center">
            <Markdown className="font-semibold text-ink-900">{card.question}</Markdown>
            {english && (
              <div className="mt-1 flex items-center justify-center gap-1">
                <PhoneticLine phonetic={card.phonetic} partOfSpeech={card.partOfSpeech} />
                <SpeakButton text={card.question} audioUrl={card.audioUrl} tabIndex={flipped ? -1 : 0} />
              </div>
            )}
          </div>
          <span className="pb-2.5 text-center text-[11px] font-medium text-ink-400">{t("view.tapToFlip")}</span>
        </div>

        {/* Mặt sau */}
        <div
          aria-hidden={!flipped}
          className={cn(
            face,
            "index-card-back border-ink-200 [transform:rotateY(180deg)] motion-reduce:transform-none",
            !flipped && "pointer-events-none motion-reduce:opacity-0",
          )}
        >
          <div className="flex h-[3.25rem] shrink-0 items-center gap-2 px-4">
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              {t("fields.answer")}
            </span>
            {flipped && tools}
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-2 text-center">
            <Markdown className="m-auto w-full text-ink-900">{card.answer}</Markdown>
            {card.explanation && (
              <Markdown className="mt-2 shrink-0 border-t border-ink-200 pt-2 text-sm text-ink-500">{card.explanation}</Markdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
