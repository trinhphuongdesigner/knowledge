"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { PartyPopper, Plus } from "lucide-react";
import { Button, ButtonLink, EmptyState, PageLoader } from "@/components/ui";
import type { CardDTO } from "@/lib/validators";
import { Flashcard } from "./Flashcard";
import { StudyControls, StudyToolbar } from "./StudyControls";
import { StudyProgress } from "./StudyProgress";
import { parseStudyState, readRaw, saveStudyState, shuffleArray } from "./utils";

type Props = { setId: string; title: string; cards: CardDTO[]; english?: boolean };

const SWIPE_THRESHOLD = 60;
const noopSubscribe = () => () => {};

/** Reads saved progress from localStorage (client only) before mounting the session. */
export function StudySession(props: Props) {
  const raw = useSyncExternalStore(
    noopSubscribe,
    () => readRaw(props.setId),
    () => undefined,
  );
  if (raw === undefined) {
    return <PageLoader label="Đang chuẩn bị thẻ học…" />;
  }
  return <Session {...props} saved={raw} />;
}

function Session({ setId, title, cards, english = false, saved: savedRaw }: Props & { saved: string | null }) {
  const allIds = useMemo(() => cards.map((c) => c.id), [cards]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const position = useMemo(() => new Map(allIds.map((id, i) => [id, i])), [allIds]);

  const [initial] = useState(() => parseStudyState(savedRaw, allIds));
  const [order, setOrder] = useState<string[]>(initial?.order ?? allIds);
  const [index, setIndex] = useState(initial?.index ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(() => new Set(initial?.known));
  const [unknown, setUnknown] = useState<Set<string>>(() => new Set(initial?.unknown));
  const [shuffle, setShuffle] = useState(initial?.shuffle ?? false);
  const [swap, setSwap] = useState(initial?.swap ?? false);

  useEffect(() => {
    saveStudyState(setId, { known: [...known], unknown: [...unknown], order, index, shuffle, swap });
  }, [setId, known, unknown, order, index, shuffle, swap]);

  const total = order.length;
  const finished = total > 0 && index >= total;
  const card = !finished ? byId.get(order[index]) : undefined;

  const goTo = useCallback((i: number) => {
    setFlipped(false);
    setIndex(i);
  }, []);

  const next = useCallback(() => {
    if (index < total) goTo(index + 1);
  }, [index, total, goTo]);
  const prev = useCallback(() => {
    if (index > 0) goTo(index - 1);
  }, [index, goTo]);
  const flip = useCallback(() => setFlipped((f) => !f), []);

  const mark = useCallback(
    (kind: "known" | "unknown") => {
      const id = order[index];
      if (!id) return;
      const add = kind === "known" ? setKnown : setUnknown;
      const remove = kind === "known" ? setUnknown : setKnown;
      add((s) => new Set(s).add(id));
      remove((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      goTo(index + 1);
    },
    [order, index, goTo],
  );

  function toggleShuffle() {
    const on = !shuffle;
    setShuffle(on);
    setOrder((o) => (on ? shuffleArray(o) : [...o].sort((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0))));
    goTo(0);
  }

  function restartAll() {
    setKnown(new Set());
    setUnknown(new Set());
    setOrder(shuffle ? shuffleArray(allIds) : allIds);
    goTo(0);
  }

  function restartUnknown() {
    const ids = allIds.filter((id) => !known.has(id));
    setUnknown(new Set());
    setOrder(shuffle ? shuffleArray(ids) : ids);
    goTo(0);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, button, a, [role='button'], [contenteditable='true']")) {
        // Let focused controls handle Space/Enter themselves; arrows and J/K still work.
        if (e.key === " " || e.key === "Enter") return;
      }
      if (finished || !card) return;
      switch (e.key) {
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        case " ":
          flip();
          break;
        case "j":
        case "J":
          mark("unknown");
          break;
        case "k":
        case "K":
          mark("known");
          break;
        default:
          return;
      }
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, card, prev, next, flip, mark]);

  // Swipe (pointer events)
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse") return;
    start.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
  }
  function onPointerUp(e: PointerEvent) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="Nhóm thẻ chưa có thẻ nào"
        description="Hãy thêm thẻ hoặc nhập từ file để bắt đầu học."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href={`/sets/${setId}`}>Thêm thẻ</ButtonLink>
            <ButtonLink href={`/sets/${setId}/import`} variant="secondary">
              Nhập từ file
            </ButtonLink>
          </div>
        }
      />
    );
  }

  if (finished || total === 0) {
    const knownCount = allIds.filter((id) => known.has(id)).length;
    const unknownCount = allIds.length - knownCount;
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <PartyPopper className="size-7" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Hoàn thành!</h2>
        <p className="mt-1 text-sm text-slate-600">Bạn đã học xong &ldquo;{title}&rdquo;.</p>
        <dl className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl bg-green-50 p-3">
            <dt className="text-xs text-green-700">Đã thuộc</dt>
            <dd className="text-2xl font-semibold text-green-700">{knownCount}</dd>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <dt className="text-xs text-amber-700">Chưa thuộc</dt>
            <dd className="text-2xl font-semibold text-amber-700">{unknownCount}</dd>
          </div>
        </dl>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          {unknownCount > 0 && <Button onClick={restartUnknown}>Học lại thẻ chưa thuộc</Button>}
          <Button variant={unknownCount > 0 ? "secondary" : "primary"} onClick={restartAll}>
            Học lại tất cả
          </Button>
          <Link
            href={`/sets/${setId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-blue-600 hover:underline"
          >
            Quay lại nhóm thẻ
          </Link>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="flex flex-col gap-4">
      <StudyProgress current={index + 1} total={total} known={known.size} unknown={unknown.size} />
      <div
        className="touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (start.current = null)}
        onClickCapture={(e) => {
          if (swiped.current) {
            swiped.current = false;
            e.stopPropagation();
          }
        }}
      >
        <Flashcard
          front={swap ? card.answer : card.question}
          back={swap ? card.question : card.answer}
          explanation={card.explanation}
          frontLabel={swap ? "Đáp án" : "Câu hỏi"}
          backLabel={swap ? "Câu hỏi" : "Đáp án"}
          flipped={flipped}
          onFlip={flip}
          speech={
            english
              ? {
                  text: card.question,
                  phonetic: card.phonetic,
                  partOfSpeech: card.partOfSpeech,
                  audioUrl: card.audioUrl,
                  side: swap ? "back" : "front",
                }
              : undefined
          }
        />
      </div>
      <StudyToolbar
        shuffle={shuffle}
        swap={swap}
        onToggleShuffle={toggleShuffle}
        onToggleSwap={() => setSwap((s) => !s)}
        onRestart={restartAll}
      />
      <StudyControls
        canPrev={index > 0}
        onPrev={prev}
        onNext={next}
        onFlip={flip}
        onKnown={() => mark("known")}
        onUnknown={() => mark("unknown")}
      />
    </div>
  );
}
