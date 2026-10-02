"use client";

import { RotateCcw, Timer, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { shuffleArray } from "@/components/study/utils";
import { Button } from "@/components/ui";
import { buildRounds, buildTiles, formatTime, isMatch, type QuizTile } from "@/lib/quiz";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";

type Game = { rounds: CardDTO[][]; round: number; tiles: QuizTile[] };

function newGame(cards: CardDTO[]): Game {
  const rounds = buildRounds(shuffleArray(cards));
  return { rounds, round: 0, tiles: buildTiles(rounds[0], shuffleArray) };
}

export function MatchingGame({ cards }: { cards: CardDTO[] }) {
  const [game, setGame] = useState(() => newGame(cards));
  const [matched, setMatched] = useState<string[]>([]); // card ids cleared in this round
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  const roundSize = game.tiles.length / 2;
  const roundCleared = matched.length === roundSize;

  // Timer runs until the last round is cleared.
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished]);

  // Clear the red flash shortly after a wrong pair.
  useEffect(() => {
    if (!wrong) return;
    const t = setTimeout(() => setWrong(null), 600);
    return () => clearTimeout(t);
  }, [wrong]);

  // Move on once every pair in the round is matched.
  useEffect(() => {
    if (!roundCleared) return;
    const t = setTimeout(() => {
      setMatched([]);
      setSelected(null);
      if (game.round + 1 >= game.rounds.length) {
        setFinished(true);
      } else {
        const round = game.round + 1;
        setGame({ ...game, round, tiles: buildTiles(game.rounds[round], shuffleArray) });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [roundCleared, game]);

  function restart() {
    setGame(newGame(cards));
    setMatched([]);
    setSelected(null);
    setWrong(null);
    setMistakes(0);
    setSeconds(0);
    setFinished(false);
  }

  function pick(tile: QuizTile) {
    if (wrong || roundCleared || matched.includes(tile.cardId)) return;
    if (selected === tile.key) return setSelected(null);
    const first = game.tiles.find((t) => t.key === selected);
    if (!first) return setSelected(tile.key);
    if (first.side === tile.side) return setSelected(tile.key); // same side: just switch selection
    if (isMatch(first, tile)) {
      setMatched((m) => [...m, tile.cardId]);
      setSelected(null);
    } else {
      setMistakes((n) => n + 1);
      setWrong([first.key, tile.key]);
      setSelected(null);
    }
  }

  if (finished) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-bold text-ink-900">Hoàn thành!</h2>
        <p className="mt-1 text-sm text-ink-600">Bạn đã ghép đúng {cards.length} thẻ.</p>
        <dl className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-50 p-3">
            <dt className="text-xs text-ink-500">Thời gian</dt>
            <dd className="text-2xl font-bold text-brand-700">{formatTime(seconds)}</dd>
          </div>
          <div className="rounded-xl bg-brand-50 p-3">
            <dt className="text-xs text-ink-500">Số lần sai</dt>
            <dd className="text-2xl font-bold text-brand-700">{mistakes}</dd>
          </div>
        </dl>
        <Button className="mt-6" onClick={restart}>
          <RotateCcw className="size-4" aria-hidden />
          Chơi lại
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-600">
        <span>
          Vòng {game.round + 1}/{game.rounds.length}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1" aria-label={`Thời gian ${formatTime(seconds)}`}>
            <Timer className="size-4" aria-hidden />
            {formatTime(seconds)}
          </span>
          <span className="flex items-center gap-1" aria-label={`${mistakes} lần sai`}>
            <XCircle className="size-4" aria-hidden />
            {mistakes}
          </span>
        </span>
      </div>
      <p className="mb-3 text-sm text-ink-500">Chọn một từ và nghĩa tương ứng của nó.</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {game.tiles.map((tile) => {
          const done = matched.includes(tile.cardId);
          const isWrong = wrong?.includes(tile.key);
          const isSel = selected === tile.key;
          return (
            <li key={tile.key}>
              <button
                type="button"
                disabled={done}
                aria-pressed={isSel}
                title={tile.text}
                onClick={() => pick(tile)}
                className={cn(
                  "flex min-h-20 w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                  done && "border-green-300 bg-green-50 text-green-700 opacity-60",
                  isWrong && "border-red-300 bg-red-50 text-red-700",
                  isSel && "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600",
                  !done && !isWrong && !isSel && "border-ink-200 bg-white text-ink-900 shadow-sm hover:bg-ink-50",
                )}
              >
                <span className="line-clamp-4 break-words">{tile.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {wrong ? "Chưa đúng, thử lại" : roundCleared ? "Đã ghép xong vòng này" : ""}
      </p>
    </div>
  );
}
