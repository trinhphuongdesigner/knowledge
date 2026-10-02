"use client";

import { Keyboard, Link2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { saveQuizResult } from "@/lib/api";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { MatchingGame } from "./MatchingGame";
import { TypingGame } from "./TypingGame";

type Mode = "matching" | "typing";

const MODES: { id: Mode; label: string; icon: typeof Link2 }[] = [
  { id: "matching", label: "Ghép từ – nghĩa", icon: Link2 },
  { id: "typing", label: "Điền từ", icon: Keyboard },
];

export function QuizSession({
  setId,
  cards,
  english,
  knownIds = [],
}: {
  setId: string;
  cards: CardDTO[];
  english: boolean;
  /** Cards already marked "đã thuộc" when the quiz page was opened. */
  knownIds?: string[];
}) {
  const [mode, setMode] = useState<Mode>(english ? "typing" : "matching");
  const [skipKnown, setSkipKnown] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Based on the ids known at page load (not live results) so the card pool stays stable mid-quiz.
  const pending = useMemo(() => {
    const known = new Set(knownIds);
    return cards.filter((c) => !known.has(c.id));
  }, [cards, knownIds]);
  const knownCount = cards.length - pending.length;
  const canSkip = knownCount > 0 && pending.length >= 2;
  const pool = skipKnown && canSkip ? pending : cards;

  const report = useCallback(
    (passed: string[], failed: string[]) => {
      saveQuizResult(setId, { passed, failed })
        .then(() => setSaveFailed(false))
        .catch(() => setSaveFailed(true));
    },
    [setId],
  );

  return (
    <div>
      <div role="tablist" aria-label="Chế độ kiểm tra" className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`quiz-tab-${id}`}
            aria-selected={mode === id}
            aria-controls="quiz-panel"
            onClick={() => setMode(id)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
              mode === id ? "bg-white text-brand-700 shadow-sm" : "text-ink-600 hover:text-ink-900",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      {knownCount > 0 && (
        <label
          className={cn(
            "mb-4 flex min-h-11 items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700",
            canSkip ? "cursor-pointer" : "opacity-60",
          )}
        >
          <input
            type="checkbox"
            checked={skipKnown && canSkip}
            disabled={!canSkip}
            onChange={(e) => setSkipKnown(e.target.checked)}
            className="size-5 accent-brand-600"
          />
          <span>
            Bỏ qua thẻ đã thuộc <span className="text-ink-500">({knownCount}/{cards.length})</span>
          </span>
        </label>
      )}
      <div id="quiz-panel" role="tabpanel" aria-labelledby={`quiz-tab-${mode}`}>
        {mode === "matching" ? (
          <MatchingGame key={`matching-${pool.length}`} cards={pool} onComplete={report} />
        ) : (
          <TypingGame key={`typing-${pool.length}`} cards={pool} english={english} onComplete={report} />
        )}
      </div>
      {saveFailed && (
        <p role="status" className="mt-3 text-center text-xs text-ink-500">
          Chưa lưu được kết quả kiểm tra.
        </p>
      )}
    </div>
  );
}
