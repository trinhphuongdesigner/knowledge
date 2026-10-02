"use client";

import { Check, Lightbulb, RotateCcw, SkipForward, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "@/components/cards/SpeakButton";
import { shuffleArray } from "@/components/study/utils";
import { Button, buttonStyles } from "@/components/ui";
import { hintText, isCorrectAnswer, stripMarkdown } from "@/lib/quiz";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";

type Result = { card: CardDTO; correct: boolean };

export function TypingGame({ cards, english }: { cards: CardDTO[]; english: boolean }) {
  // A new run id remounts the run, so restarting (all or only wrong cards) resets its state.
  const [run, setRun] = useState<{ id: number; cards: CardDTO[] }>(() => ({ id: 0, cards: shuffleArray(cards) }));
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);

  function start(next: CardDTO[]) {
    setRun((r) => ({ id: r.id + 1, cards: shuffleArray(next) }));
    setResults([]);
    setDone(false);
  }

  if (done) {
    const wrongCards = results.filter((r) => !r.correct).map((r) => r.card);
    const score = results.length - wrongCards.length;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Kết quả</h2>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {score}/{results.length}
          </p>
          <p className="text-sm text-slate-600">câu đúng</p>
        </div>
        {wrongCards.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Câu sai ({wrongCards.length})</h3>
            <ul className="space-y-2">
              {wrongCards.map((c) => (
                <li key={c.id} className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
                  <p className="break-words text-slate-600">{stripMarkdown(c.answer)}</p>
                  <p className="mt-1 break-words font-semibold text-slate-900">{stripMarkdown(c.question)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {wrongCards.length > 0 && (
            <Button onClick={() => start(wrongCards)}>
              <RotateCcw className="size-4" aria-hidden />
              Làm lại câu sai
            </Button>
          )}
          <Button variant={wrongCards.length > 0 ? "secondary" : "primary"} onClick={() => start(cards)}>
            <RotateCcw className="size-4" aria-hidden />
            Làm lại tất cả
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TypingRun
      key={run.id}
      cards={run.cards}
      english={english}
      onFinish={(r) => {
        setResults(r);
        setDone(true);
      }}
    />
  );
}

function TypingRun({
  cards,
  english,
  onFinish,
}: {
  cards: CardDTO[];
  english: boolean;
  onFinish: (results: Result[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [hint, setHint] = useState(0);
  const [checked, setChecked] = useState<null | { correct: boolean }>(null);
  const [results, setResults] = useState<Result[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const card = cards[index];
  const expected = stripMarkdown(card.question);
  const expectedLength = [...expected].length;

  // Keep the keyboard flow: input while answering, "Tiếp" button after checking.
  useEffect(() => {
    if (checked) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [checked, index]);

  function check(correct: boolean) {
    setChecked({ correct });
    setResults((r) => [...r, { card, correct }]);
  }

  function next() {
    if (index + 1 >= cards.length) return onFinish(results);
    setIndex(index + 1);
    setValue("");
    setHint(0);
    setChecked(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checked) return next();
    if (!value.trim()) return;
    check(isCorrectAnswer(value, card.question));
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-3 text-sm text-slate-500">
        Câu {index + 1}/{cards.length}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {english ? "Nghĩa" : "Đáp án"}
        {english && card.partOfSpeech && <span className="ml-1 normal-case italic">({card.partOfSpeech})</span>}
      </p>
      <p className="mt-1 line-clamp-6 whitespace-pre-wrap break-words text-xl font-semibold text-slate-900">
        {stripMarkdown(card.answer)}
      </p>

      <label htmlFor="quiz-typing-input" className="mt-5 block text-sm font-medium text-slate-700">
        {english ? "Nhập từ tiếng Anh" : "Nhập câu hỏi / thuật ngữ"}
      </label>
      <input
        id="quiz-typing-input"
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={!!checked}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "mt-1 min-h-11 w-full rounded-xl border px-3 text-base text-slate-900 outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-600",
          !checked && "border-slate-300 bg-white",
          checked?.correct && "border-green-400 bg-green-50",
          checked && !checked.correct && "border-red-300 bg-red-50",
        )}
      />

      {!checked && hint > 0 && (
        <p className="mt-2 font-mono text-sm tracking-wider text-blue-700" aria-live="polite">
          Gợi ý: {hintText(expected, hint)}
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
            <p className="font-semibold">{checked.correct ? "Chính xác!" : "Chưa đúng"}</p>
            {!checked.correct && (
              <p className="mt-0.5 break-words">
                Đáp án: <span className="font-semibold">{expected}</span>
              </p>
            )}
          </div>
          {english && <SpeakButton text={expected} audioUrl={card.audioUrl} className="-my-1 -mr-1" />}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {checked ? (
          <button ref={nextRef} type="submit" className={buttonStyles()}>
            {index + 1 >= cards.length ? "Xem kết quả" : "Tiếp"}
          </button>
        ) : (
          <>
            <Button type="submit" disabled={!value.trim()}>
              Kiểm tra
            </Button>
            <Button
              variant="secondary"
              onClick={() => setHint((h) => Math.min(h + 1, expectedLength))}
              disabled={hint >= expectedLength}
            >
              <Lightbulb className="size-4" aria-hidden />
              Gợi ý
            </Button>
            <Button variant="ghost" onClick={() => check(false)}>
              <SkipForward className="size-4" aria-hidden />
              Bỏ qua
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
