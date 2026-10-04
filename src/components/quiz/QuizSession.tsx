"use client";

import { Headphones, Keyboard, Link2, TextCursorInput } from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { api, saveQuizResult } from "@/lib/api";
import { buildClozeItems, chunk, CLOZE_MIN_CARDS } from "@/lib/quiz";
import { gradeFromCorrect } from "@/lib/srs";
import type { CardDTO, ReviewModeValue } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { ClozeGame } from "./ClozeGame";
import { ListenGame } from "./ListenGame";
import { MatchingGame } from "./MatchingGame";
import { TypingGame } from "./TypingGame";
import { useT } from "@/i18n/client";

type Mode = "matching" | "typing" | "listen" | "cloze";

const MODES: {
  id: Mode;
  labelKey: "session.modeMatching" | "session.modeTyping" | "session.modeListen" | "session.modeCloze";
  icon: typeof Link2;
  review: ReviewModeValue;
}[] = [
  { id: "matching", labelKey: "session.modeMatching", icon: Link2, review: "MATCHING" },
  { id: "typing", labelKey: "session.modeTyping", icon: Keyboard, review: "TYPING" },
  { id: "listen", labelKey: "session.modeListen", icon: Headphones, review: "LISTEN" },
  { id: "cloze", labelKey: "session.modeCloze", icon: TextCursorInput, review: "CLOZE" },
];

/** Sends results to SRS in batches of <= 500. Never throws: a failure must not break the quiz UI. */
async function recordSrs(
  setId: string,
  mode: ReviewModeValue,
  passed: string[],
  failed: string[],
) {
  const items = [
    ...passed.map((cardId) => ({ cardId, grade: gradeFromCorrect(true) })),
    ...failed.map((cardId) => ({ cardId, grade: gradeFromCorrect(false) })),
  ];
  for (const batch of chunk(items)) {
    try {
      await api.recordReviews({ setId, mode, items: batch });
    } catch (err) {
      console.warn("Could not record review results", err);
      return;
    }
  }
}

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
  const t = useT("quiz");
  // Các trò chơi xáo trộn ngẫu nhiên khi khởi tạo → chỉ render sau khi hydrate để tránh lệch SSR.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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
    (reviewMode: ReviewModeValue) => (passed: string[], failed: string[]) => {
      saveQuizResult(setId, { passed, failed })
        .then(() => setSaveFailed(false))
        .catch(() => setSaveFailed(true));
      void recordSrs(setId, reviewMode, passed, failed);
    },
    [setId],
  );

  const clozeItems = useMemo(() => buildClozeItems(pool), [pool]);
  const clozeReady = clozeItems.length >= CLOZE_MIN_CARDS;
  const available = (id: Mode) => (id === "listen" ? english : true);
  const visibleModes = MODES.filter((m) => available(m.id));

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("session.modesAria")}
        className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1 sm:flex"
      >
        {visibleModes.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`quiz-tab-${id}`}
            aria-selected={mode === id}
            aria-controls="quiz-panel"
            onClick={() => setMode(id)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors sm:flex-1",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
              mode === id
                ? "bg-surface text-accent-strong shadow-sm"
                : "text-ink-600 hover:text-ink-900",
              id === "cloze" && !clozeReady && "opacity-60",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{t(labelKey)}</span>
          </button>
        ))}
      </div>
      {knownCount > 0 && (
        <label
          className={cn(
            "mb-4 flex min-h-11 items-center gap-3 rounded-xl border border-ink-200 bg-surface px-3 text-sm text-ink-700",
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
            {t("session.skipKnown")}{" "}
            <span className="text-ink-500">
              ({knownCount}/{cards.length})
            </span>
          </span>
        </label>
      )}
      <div id="quiz-panel" role="tabpanel" aria-labelledby={`quiz-tab-${mode}`}>
        {mounted && (
          <>
            {mode === "matching" && (
              <MatchingGame
                key={`matching-${pool.length}`}
                cards={pool}
                onComplete={report("MATCHING")}
              />
            )}
            {mode === "typing" && (
              <TypingGame
                key={`typing-${pool.length}`}
                cards={pool}
                english={english}
                onComplete={report("TYPING")}
              />
            )}
            {mode === "listen" && english && (
              <ListenGame
                key={`listen-${pool.length}`}
                cards={pool}
                allCards={cards}
                english={english}
                onComplete={report("LISTEN")}
              />
            )}
            {mode === "cloze" &&
              (clozeReady ? (
                <ClozeGame
                  key={`cloze-${clozeItems.length}`}
                  items={clozeItems}
                  onComplete={report("CLOZE")}
                />
              ) : (
                <p className="rounded-xl border border-ink-200 bg-surface p-5 text-center text-sm text-ink-600">
                  {t("session.clozeNeeds", { min: CLOZE_MIN_CARDS, count: clozeItems.length })}
                </p>
              ))}
          </>
        )}
      </div>
      {saveFailed && (
        <p role="status" className="mt-3 text-center text-xs text-ink-500">
          {t("session.saveFailed")}
        </p>
      )}
    </div>
  );
}
