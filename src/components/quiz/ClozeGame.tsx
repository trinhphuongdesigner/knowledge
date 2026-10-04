"use client";

import { Check, Lightbulb, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shuffleArray } from "@/components/study/utils";
import { Button, buttonStyles } from "@/components/ui";
import { CLOZE_BLANK, hintText, isClozeCorrect, stripMarkdown, type Cloze } from "@/lib/quiz";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { RoundResult } from "./RoundResult";
import { useT } from "@/i18n/client";

const AUTO_NEXT_MS = 1500;

export type ClozeItem = { card: CardDTO; cloze: Cloze };
type Result = { card: CardDTO; correct: boolean };

export function ClozeGame({
  items,
  onComplete,
}: {
  /** Cards that have a usable example sentence (see buildClozeItems). */
  items: ClozeItem[];
  onComplete?: (passedIds: string[], failedIds: string[]) => void;
}) {
  const [run, setRun] = useState<{ id: number; items: ClozeItem[] }>(() => ({ id: 0, items: shuffleArray(items) }));
  const [results, setResults] = useState<Result[] | null>(null);

  function start(next: ClozeItem[]) {
    setRun((r) => ({ id: r.id + 1, items: shuffleArray(next) }));
    setResults(null);
  }

  if (results) {
    const wrong = results.filter((r) => !r.correct).map((r) => r.card);
    const wrongIds = new Set(wrong.map((c) => c.id));
    return (
      <RoundResult
        total={results.length}
        wrongCards={wrong}
        onRetryWrong={() => start(items.filter((i) => wrongIds.has(i.card.id)))}
        onRetryAll={() => start(items)}
      />
    );
  }

  return (
    <ClozeRun
      key={run.id}
      items={run.items}
      onFinish={(r) => {
        onComplete?.(
          r.filter((x) => x.correct).map((x) => x.card.id),
          r.filter((x) => !x.correct).map((x) => x.card.id),
        );
        setResults(r);
      }}
    />
  );
}

function ClozeRun({ items, onFinish }: { items: ClozeItem[]; onFinish: (results: Result[]) => void }) {
  const t = useT("quiz");
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const [checked, setChecked] = useState<null | { correct: boolean }>(null);
  const [results, setResults] = useState<Result[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const { card, cloze } = items[index];
  const answerLength = [...cloze.answer].length;

  useEffect(() => {
    if (checked) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [checked, index]);

  useEffect(() => {
    if (!checked?.correct) return;
    const timer = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `next` is fresh whenever `checked`/`index` change
  }, [checked, index]);

  function check(correct: boolean) {
    setChecked({ correct });
    setResults((r) => [...r, { card, correct }]);
  }

  function next() {
    if (index + 1 >= items.length) return onFinish(results);
    setIndex(index + 1);
    setValue("");
    setHint(0);
    setChecked(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checked) return next();
    if (!value.trim()) return;
    check(isClozeCorrect(value, cloze));
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-ink-200 bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3 text-sm text-ink-500">
        {t("play.question", { n: index + 1, total: items.length })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100" aria-hidden>
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${(index / items.length) * 100}%` }} />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">{t("cloze.title")}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-lg font-semibold leading-relaxed text-ink-900">
        {cloze.before}
        {checked ? (
          <mark
            className={cn(
              "rounded px-1",
              checked.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
            )}
          >
            {cloze.answer}
          </mark>
        ) : (
          <span
            className="mx-0.5 inline-block min-w-12 border-b-2 border-brand-600 text-center text-accent"
            aria-label={t("cloze.blankAria")}
          >
            {CLOZE_BLANK}
          </span>
        )}
        {cloze.after}
      </p>
      <p className="mt-3 break-words text-sm text-ink-600">
        <span className="font-medium text-ink-700">{t("cloze.meaning")} </span>
        {stripMarkdown(card.answer)}
        {card.partOfSpeech && <span className="ml-1 italic">({card.partOfSpeech})</span>}
      </p>

      <label htmlFor="quiz-cloze-input" className="mt-5 block text-sm font-medium text-ink-700">
        {t("cloze.label")}
      </label>
      <input
        id="quiz-cloze-input"
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={!!checked}
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
          {t("play.hint", { hint: hintText(cloze.answer, hint) })}
        </p>
      )}

      {checked && (
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
            <p className="font-semibold">{checked.correct ? t("play.correct") : t("play.wrong")}</p>
            {!checked.correct && (
              <p className="mt-0.5 break-words">
                {t("play.revealAnswer")} <span className="font-semibold">{cloze.answer}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {checked ? (
          <button ref={nextRef} type="submit" className={buttonStyles("primary", "md", "w-full")}>
            {index + 1 >= items.length ? t("play.seeResult") : t("play.next")}
          </button>
        ) : (
          <>
            <Button type="submit" disabled={!value.trim()}>
              {t("play.check")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setHint((h) => Math.min(h + 1, answerLength))}
              disabled={hint >= answerLength}
            >
              <Lightbulb className="size-4" aria-hidden />
              {t("play.hintButton")}
            </Button>
            <Button variant="ghost" onClick={() => check(false)}>
              <SkipForward className="size-4" aria-hidden />
              {t("play.skip")}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
