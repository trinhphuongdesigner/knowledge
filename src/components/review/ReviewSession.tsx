"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PartyPopper, RotateCw, Star } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { Flashcard } from "@/components/study/Flashcard";
import { api } from "@/lib/api";
import type { Grade, SrsState } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { CardDTO } from "@/lib/validators";
import { GRADE_LABELS, previewLabels } from "./session";

export type ReviewSessionItem = {
  card: CardDTO;
  setId: string;
  setTitle: string;
  english: boolean;
  state: SrsState;
  starred: boolean;
};

const FLUSH_MS = 800;
const MAX_BATCH = 50;

const GRADE_STYLES: Record<Grade, string> = {
  0: "border-red-300 text-red-700 shadow-[0_3px_0_var(--color-red-300)] hover:border-red-400 hover:bg-red-50",
  1: "border-amber-300 text-amber-700 shadow-[0_3px_0_var(--color-amber-300)] hover:border-amber-400 hover:bg-amber-50",
  2: "border-green-300 text-green-700 shadow-[0_3px_0_var(--color-green-300)] hover:border-green-400 hover:bg-green-50",
  3: "border-brand-300 text-accent-strong shadow-[0_3px_0_var(--color-brand-300)] hover:border-brand-400 hover:bg-brand-50",
};

type Pending = { cardId: string; grade: Grade };

export function ReviewSession({ items, only }: { items: ReviewSessionItem[]; only?: "starred" | "hard" }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [starred, setStarred] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.card.id, i.starred])),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  const pending = useRef(new Map<string, Pending[]>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback((keepalive = false) => {
    clearTimeout(timer.current);
    for (const [setId, list] of [...pending.current]) {
      pending.current.delete(setId);
      while (list.length > 0) {
        const batch = list.splice(0, MAX_BATCH);
        const body = { setId, mode: "REVIEW" as const, items: batch };
        const done = keepalive
          ? fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
              keepalive: true,
            }).then((r) => {
              if (!r.ok) throw new Error("review failed");
            })
          : api.recordReviews(body);
        done
          .then(() => setSaveFailed(false))
          .catch(() => {
            const cur = pending.current.get(setId) ?? [];
            pending.current.set(setId, [...batch, ...cur]);
            setSaveFailed(true);
          });
      }
    }
  }, []);

  useEffect(() => {
    const onHide = () => flush(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flush(true);
    };
  }, [flush]);

  const total = items.length;
  const finished = index >= total;
  const current = finished ? undefined : items[index];
  const previews = useMemo(() => (current ? previewLabels(current.state) : null), [current]);

  const answer = useCallback(
    (grade: Grade) => {
      const item = items[index];
      if (!item) return;
      const list = pending.current.get(item.setId) ?? [];
      list.push({ cardId: item.card.id, grade });
      pending.current.set(item.setId, list);
      clearTimeout(timer.current);
      if (list.length >= MAX_BATCH) flush();
      else timer.current = setTimeout(() => flush(), FLUSH_MS);
      setCounts((c) => {
        const n: [number, number, number, number] = [...c];
        n[grade] += 1;
        return n;
      });
      setFlipped(false);
      setIndex(index + 1);
    },
    [items, index, flush],
  );

  useEffect(() => {
    if (finished) flush();
  }, [finished, flush]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || finished) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, button, a, [role='button'], [contenteditable='true']")) {
        if (e.key === " " || e.key === "Enter") return;
      }
      if (e.key === " ") flip();
      else if (flipped && ["1", "2", "3", "4"].includes(e.key)) answer((Number(e.key) - 1) as Grade);
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, flipped, flip, answer]);

  function toggleStar(cardId: string) {
    const next = !starred[cardId];
    setStarred((s) => ({ ...s, [cardId]: next }));
    api.starCard(cardId, next).catch(() => setStarred((s) => ({ ...s, [cardId]: !next })));
  }

  if (finished) {
    const [again, hard, good, easy] = counts;
    const correct = good + easy;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    return (
      <div className="index-card flex animate-rise flex-col items-center rounded-3xl border border-ink-200 px-6 pt-16 pb-10 text-center shadow-[0_2px_0_var(--color-ink-200),0_20px_40px_-20px_rgb(70_63_53/0.35)] motion-reduce:animate-none">
        <div className="mb-4 flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-sun-300 text-ink-900 shadow-[0_4px_0_var(--color-sun-400)]">
          <PartyPopper className="size-7" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-ink-900">Xong phiên ôn!</h2>
        <p className="mt-1 text-sm text-ink-600">
          Đã ôn {total} thẻ · đúng {pct}%
        </p>
        <dl className="mt-6 grid w-full max-w-sm grid-cols-4 gap-2">
          {([0, 1, 2, 3] as const).map((g) => (
            <div key={g} className={cn("rounded-2xl border bg-surface p-2", GRADE_STYLES[g].split(" ").slice(0, 2).join(" "))}>
              <dt className="text-xs">{GRADE_LABELS[g]}</dt>
              <dd className="text-xl font-semibold">{[again, hard, good, easy][g]}</dd>
            </div>
          ))}
        </dl>
        {saveFailed && (
          <p role="status" className="mt-4 text-xs text-ink-500">
            Chưa lưu được một số kết quả, sẽ thử lại khi có mạng.
          </p>
        )}
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Link
            href={only ? "/review" : "/"}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-[0_3px_0_var(--color-brand-800)] hover:bg-brand-500"
          >
            {only ? "Về ôn hằng ngày" : "Về trang chủ"}
          </Link>
          {only && (
            <ButtonLink href="/" variant="secondary">
              Về trang chủ
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  if (!current || !previews) return null;
  const isStarred = !!starred[current.card.id];
  const pct = Math.round((index / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-ink-900">
            {index + 1} / {total}
          </span>
          <span className="min-w-0 truncate text-xs text-ink-600">{current.setTitle}</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index}
          aria-label="Tiến độ ôn"
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-200/70"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-400 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Flashcard
        key={current.card.id}
        front={current.card.question}
        back={current.card.answer}
        explanation={current.card.explanation}
        frontLabel="Câu hỏi"
        backLabel="Đáp án"
        flipped={flipped}
        onFlip={flip}
        speech={
          current.english
            ? {
                text: current.card.question,
                phonetic: current.card.phonetic,
                partOfSpeech: current.card.partOfSpeech,
                audioUrl: current.card.audioUrl,
                side: "front",
              }
            : undefined
        }
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => toggleStar(current.card.id)}
          aria-pressed={isStarred}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium hover:bg-ink-100",
            isStarred ? "text-amber-600" : "text-ink-600",
          )}
        >
          <Star className={cn("size-4", isStarred && "fill-current")} aria-hidden />
          {isStarred ? "Đã đánh sao" : "Đánh sao"}
        </button>
      </div>

      {saveFailed && (
        <p role="status" className="text-center text-xs text-ink-500">
          Chưa lưu được kết quả, sẽ thử lại sau.
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-ink-200 bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        {flipped ? (
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
            {([0, 1, 2, 3] as const).map((g) => (
              <Button
                key={g}
                variant="secondary"
                onClick={() => answer(g)}
                aria-label={`${GRADE_LABELS[g]}, ôn lại sau ${previews[g]}`}
                className={cn("h-auto flex-col gap-0 px-1 py-2", GRADE_STYLES[g])}
              >
                <span>{GRADE_LABELS[g]}</span>
                <span className="text-xs font-normal opacity-70">{previews[g]}</span>
                <kbd className="hidden text-[11px] opacity-50 sm:inline">({g + 1})</kbd>
              </Button>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <Button onClick={flip} className="w-full">
              <RotateCw className="size-4" aria-hidden /> Hiện đáp án <kbd className="hidden text-xs opacity-60 sm:inline">(Space)</kbd>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
