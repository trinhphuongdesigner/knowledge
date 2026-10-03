"use client";

import { Check, Lightbulb, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneticLine, SpeakButton } from "@/components/cards/SpeakButton";
import { Button, buttonStyles, Markdown } from "@/components/ui";
import { hintText, isCorrectAnswer, stripMarkdown } from "@/lib/quiz";
import type { Grade } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { CardDTO } from "@/lib/validators";
import { GRADE_LABELS, typingGrade } from "./session";

/** Ôn tập kiểu gõ từ: hiện nghĩa tiếng Việt, người dùng gõ từ tiếng Anh, mức nhớ được tính tự động. */
export function ReviewTypingCard({
  card,
  previews,
  onAnswer,
}: {
  card: CardDTO;
  previews: Record<Grade, string>;
  /** Called once when the user moves on to the next card. */
  onAnswer: (grade: Grade) => void;
}) {
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const [checked, setChecked] = useState<null | { correct: boolean }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const answered = useRef(false);

  const expected = stripMarkdown(card.question);
  const expectedLength = [...expected].length;
  const grade = checked ? typingGrade({ correct: checked.correct, hintsUsed: hint }) : null;

  // Keep the keyboard flow: input while answering, "Tiếp" button after checking.
  useEffect(() => {
    if (checked) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [checked]);

  function answer(g: Grade) {
    if (answered.current) return;
    answered.current = true;
    onAnswer(g);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checked) return grade !== null ? answer(grade) : undefined;
    if (!value.trim()) return;
    setChecked({ correct: isCorrectAnswer(value, card.question) });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-ink-200 bg-surface p-4 shadow-sm sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        Nghĩa
        {card.partOfSpeech && <span className="ml-1 normal-case italic">({card.partOfSpeech})</span>}
      </p>
      <p className="mt-1 line-clamp-6 whitespace-pre-wrap break-words text-xl font-semibold text-ink-900">
        {stripMarkdown(card.answer)}
      </p>

      <label htmlFor="review-typing-input" className="mt-5 block text-sm font-medium text-ink-700">
        Nhập từ tiếng Anh
      </label>
      <input
        id="review-typing-input"
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={!!checked}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "mt-1 min-h-11 w-full rounded-xl border px-3 text-base text-ink-900 outline-none",
          "focus-visible:ring-2 focus-visible:ring-brand-600",
          !checked && "border-ink-300 bg-surface",
          checked?.correct && "border-green-400 bg-green-50",
          checked && !checked.correct && "border-red-300 bg-red-50",
        )}
      />

      {!checked && hint > 0 && (
        <p className="mt-2 font-mono text-sm tracking-wider text-accent-strong" aria-live="polite">
          Gợi ý: {hintText(expected, hint)}
        </p>
      )}

      {checked && grade !== null && (
        <>
          <div
            role="status"
            className={cn(
              "mt-3 flex items-start gap-2 rounded-xl p-3 text-sm",
              checked.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800",
            )}
          >
            {checked.correct ? (
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <X className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{checked.correct ? "Chính xác!" : "Chưa đúng"}</p>
              <p className="mt-0.5 break-words">
                Đáp án: <span className="font-semibold">{expected}</span>
                {card.phonetic && <PhoneticLine phonetic={card.phonetic} className="ml-2 text-inherit opacity-80" />}
              </p>
            </div>
            <SpeakButton text={expected} audioUrl={card.audioUrl} className="-my-1 -mr-1" />
          </div>

          {card.explanation && (
            <div className="mt-3 border-t border-ink-200 pt-3">
              <Markdown className="text-sm text-ink-500">{card.explanation}</Markdown>
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {checked && grade !== null ? (
          <>
            <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-1">
              <button
                ref={nextRef}
                type="submit"
                className={buttonStyles("primary", "md", "min-h-11 w-full")}
              >
                Tiếp
              </button>
              <span className="text-center text-xs text-ink-500">
                {GRADE_LABELS[grade]} · ôn lại sau {previews[grade]}
              </span>
            </div>
            {checked.correct && hint === 0 && (
              <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-1">
                <Button variant="secondary" className="min-h-11 w-full" onClick={() => answer(3)}>
                  Quá dễ
                </Button>
                <span className="text-center text-xs text-ink-500">
                  {GRADE_LABELS[3]} · {previews[3]}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <Button type="submit" className="min-h-11" disabled={!value.trim()}>
              Kiểm tra
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => setHint((h) => Math.min(h + 1, expectedLength))}
              disabled={hint >= expectedLength}
            >
              <Lightbulb className="size-4" aria-hidden />
              Gợi ý
            </Button>
            <Button variant="ghost" className="min-h-11" onClick={() => setChecked({ correct: false })}>
              <SkipForward className="size-4" aria-hidden />
              Bỏ qua
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
