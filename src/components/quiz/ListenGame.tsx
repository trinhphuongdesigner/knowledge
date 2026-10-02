"use client";

import { Check, Snail, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { shuffleArray } from "@/components/study/utils";
import { Button, buttonStyles } from "@/components/ui";
import { buildListenOptions, isCorrectAnswer, stripMarkdown } from "@/lib/quiz";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { RoundResult } from "./RoundResult";
import { NORMAL_RATE, playTerm, SLOW_RATE, stopSpeech } from "./speech";

const AUTO_NEXT_MS = 1500;
const OPTION_COUNT = 4;

type Result = { card: CardDTO; correct: boolean };
type AnswerMode = "choice" | "type";

export function ListenGame({
  cards,
  allCards,
  english,
  onComplete,
}: {
  /** Cards to be asked. */
  cards: CardDTO[];
  /** Pool used for distractors (defaults to `cards`). */
  allCards?: CardDTO[];
  english: boolean;
  onComplete?: (passedIds: string[], failedIds: string[]) => void;
}) {
  const [run, setRun] = useState<{ id: number; cards: CardDTO[] }>(() => ({ id: 0, cards: shuffleArray(cards) }));
  const [results, setResults] = useState<Result[] | null>(null);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("choice");
  const pool = allCards ?? cards;
  const canChoose = pool.length >= 2;
  const effectiveMode: AnswerMode = canChoose ? answerMode : "type";

  useEffect(() => stopSpeech, []);

  function start(next: CardDTO[]) {
    setRun((r) => ({ id: r.id + 1, cards: shuffleArray(next) }));
    setResults(null);
  }

  if (results) {
    return (
      <RoundResult
        total={results.length}
        wrongCards={results.filter((r) => !r.correct).map((r) => r.card)}
        onRetryWrong={() => start(results.filter((r) => !r.correct).map((r) => r.card))}
        onRetryAll={() => start(cards)}
      />
    );
  }

  return (
    <div>
      <div role="group" aria-label="Cách trả lời" className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
        {(
          [
            ["choice", "Chọn đáp án"],
            ["type", "Gõ từ"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={effectiveMode === id}
            disabled={id === "choice" && !canChoose}
            onClick={() => setAnswerMode(id)}
            className={cn(
              "min-h-11 rounded-lg px-2 text-sm font-medium transition-colors disabled:opacity-50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
              effectiveMode === id ? "bg-surface text-accent-strong shadow-sm" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <ListenRun
        key={run.id}
        cards={run.cards}
        pool={pool}
        english={english}
        answerMode={effectiveMode}
        onFinish={(r) => {
          onComplete?.(
            r.filter((x) => x.correct).map((x) => x.card.id),
            r.filter((x) => !x.correct).map((x) => x.card.id),
          );
          setResults(r);
        }}
      />
    </div>
  );
}

function ListenRun({
  cards,
  pool,
  english,
  answerMode,
  onFinish,
}: {
  cards: CardDTO[];
  pool: CardDTO[];
  english: boolean;
  answerMode: AnswerMode;
  onFinish: (results: Result[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState<null | { correct: boolean }>(null);
  const [results, setResults] = useState<Result[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const card = cards[index];
  const expected = stripMarkdown(card.question);
  const options = useMemo(() => buildListenOptions(pool, card, shuffleArray, OPTION_COUNT), [pool, card]);

  function play(rate: number) {
    playTerm(expected, { audioUrl: card.audioUrl, english, rate });
  }

  // Play each new question automatically (browsers may block it until the first tap; the buttons always work).
  useEffect(() => {
    playTerm(expected, { audioUrl: card.audioUrl, english, rate: NORMAL_RATE });
  }, [expected, card.audioUrl, english, index]);

  useEffect(() => {
    if (checked) nextRef.current?.focus();
    else if (answerMode === "type") inputRef.current?.focus();
  }, [checked, index, answerMode]);

  useEffect(() => {
    if (!checked?.correct) return;
    const timer = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `next` is fresh whenever `checked`/`index` change
  }, [checked, index]);

  // Keyboard: 1-4 pick an option, R replays, S replays slowly (not while typing).
  useEffect(() => {
    if (answerMode !== "choice") return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "r" || e.key === "R") return play(NORMAL_RATE);
      if (e.key === "s" || e.key === "S") return play(SLOW_RATE);
      const n = Number(e.key);
      if (!checked && n >= 1 && n <= options.length) pick(options[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function check(correct: boolean) {
    setChecked({ correct });
    setResults((r) => [...r, { card, correct }]);
  }

  function pick(option: CardDTO) {
    if (checked) return;
    setPicked(option.id);
    check(option.id === card.id);
  }

  function next() {
    if (index + 1 >= cards.length) return onFinish(results);
    setIndex(index + 1);
    setValue("");
    setPicked(null);
    setChecked(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checked) return next();
    if (answerMode !== "type" || !value.trim()) return;
    check(isCorrectAnswer(value, card.question));
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-ink-200 bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-3 text-sm text-ink-500">
        Câu {index + 1}/{cards.length}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100" aria-hidden>
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-ink-500">Nghe và chọn đúng từ</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => play(NORMAL_RATE)}
          className={buttonStyles("primary", "md", "gap-2")}
          aria-keyshortcuts="R"
        >
          <Volume2 className="size-5" aria-hidden />
          Nghe lại
        </button>
        <button
          type="button"
          onClick={() => play(SLOW_RATE)}
          className={buttonStyles("secondary", "md", "gap-2")}
          aria-keyshortcuts="S"
        >
          <Snail className="size-5" aria-hidden />
          Nghe chậm
        </button>
      </div>

      {answerMode === "choice" ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((opt, i) => {
            const isCorrect = opt.id === card.id;
            const isPicked = picked === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  disabled={!!checked}
                  onClick={() => pick(opt)}
                  aria-keyshortcuts={String(i + 1)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-base font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                    !checked && "border-ink-200 bg-surface text-ink-900 shadow-sm hover:bg-ink-50",
                    checked && isCorrect && "border-green-400 bg-green-50 text-green-800",
                    checked && isPicked && !isCorrect && "border-red-400 bg-red-50 text-red-800",
                    checked && !isCorrect && !isPicked && "border-ink-200 bg-surface text-ink-500 opacity-70",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-600">
                    {i + 1}
                  </span>
                  <span className="min-w-0 break-words">{stripMarkdown(opt.question)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <label htmlFor="quiz-listen-input" className="mt-5 block text-sm font-medium text-ink-700">
            Nhập từ bạn nghe được
          </label>
          <input
            id="quiz-listen-input"
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
        </>
      )}

      <div role="status" aria-live="polite">
        {checked && (
          <div
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
                {checked.correct ? "Từ là" : "Đáp án"}: <span className="font-semibold">{expected}</span>
                <span className="text-ink-600"> — {stripMarkdown(card.answer)}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {checked ? (
          <button ref={nextRef} type="submit" className={buttonStyles("primary", "md", "w-full")}>
            {index + 1 >= cards.length ? "Xem kết quả" : "Tiếp"}
          </button>
        ) : (
          <>
            {answerMode === "type" && (
              <Button type="submit" disabled={!value.trim()}>
                Kiểm tra
              </Button>
            )}
            <Button variant="ghost" onClick={() => check(false)}>
              Bỏ qua
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
