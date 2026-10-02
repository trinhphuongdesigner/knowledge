"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { stripMarkdown } from "@/lib/quiz";
import type { CardDTO } from "@/lib/validators";

/** Result screen shared by the Listen and Cloze modes (same look as Typing). */
export function RoundResult({
  total,
  wrongCards,
  onRetryWrong,
  onRetryAll,
}: {
  total: number;
  wrongCards: CardDTO[];
  onRetryWrong: () => void;
  onRetryAll: () => void;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-surface p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-xl font-bold text-ink-900">Kết quả</h2>
        <p className="mt-2 text-3xl font-bold text-accent-strong">
          {total - wrongCards.length}/{total}
        </p>
        <p className="text-sm text-ink-600">câu đúng</p>
      </div>
      {wrongCards.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Câu sai ({wrongCards.length})</h3>
          <ul className="space-y-2">
            {wrongCards.map((c) => (
              <li key={c.id} className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
                <p className="break-words text-ink-600">{stripMarkdown(c.answer)}</p>
                <p className="mt-1 break-words font-semibold text-ink-900">{stripMarkdown(c.question)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {wrongCards.length > 0 && (
          <Button onClick={onRetryWrong}>
            <RotateCcw className="size-4" aria-hidden />
            Làm lại câu sai
          </Button>
        )}
        <Button variant={wrongCards.length > 0 ? "secondary" : "primary"} onClick={onRetryAll}>
          <RotateCcw className="size-4" aria-hidden />
          Làm lại tất cả
        </Button>
      </div>
    </div>
  );
}
