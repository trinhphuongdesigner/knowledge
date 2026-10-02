"use client";

import { Keyboard, Link2 } from "lucide-react";
import { useState } from "react";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { MatchingGame } from "./MatchingGame";
import { TypingGame } from "./TypingGame";

type Mode = "matching" | "typing";

const MODES: { id: Mode; label: string; icon: typeof Link2 }[] = [
  { id: "matching", label: "Ghép từ – nghĩa", icon: Link2 },
  { id: "typing", label: "Điền từ", icon: Keyboard },
];

export function QuizSession({ cards, english }: { cards: CardDTO[]; english: boolean }) {
  const [mode, setMode] = useState<Mode>(english ? "typing" : "matching");

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
      <div id="quiz-panel" role="tabpanel" aria-labelledby={`quiz-tab-${mode}`}>
        {mode === "matching" ? (
          <MatchingGame key="matching" cards={cards} />
        ) : (
          <TypingGame key="typing" cards={cards} english={english} />
        )}
      </div>
    </div>
  );
}
