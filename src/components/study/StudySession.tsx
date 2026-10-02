"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { PartyPopper, Plus } from "lucide-react";
import { Button, ButtonLink, EmptyState, Modal } from "@/components/ui";
import { saveStudyProgress } from "@/lib/api";
import type { CardDTO } from "@/lib/validators";
import { Flashcard } from "./Flashcard";
import { StudyControls, StudyToolbar } from "./StudyControls";
import { StudyProgress } from "./StudyProgress";
import { parseStudyState, shuffleArray, type StoredStudyState } from "./utils";

type Props = {
  setId: string;
  title: string;
  cards: CardDTO[];
  english?: boolean;
  /** Progress saved in the DB for this user + set (null when none). */
  initialProgress?: StoredStudyState | null;
};

const SWIPE_THRESHOLD = 60;
const SAVE_DEBOUNCE_MS = 800;

export function StudySession({ setId, title, cards, english = false, initialProgress = null }: Props) {
  const allIds = useMemo(() => cards.map((c) => c.id), [cards]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const position = useMemo(() => new Map(allIds.map((id, i) => [id, i])), [allIds]);

  const [initial] = useState(() => parseStudyState(initialProgress, allIds));
  const [order, setOrder] = useState<string[]>(initial?.order ?? allIds);
  const [index, setIndex] = useState(initial?.index ?? 0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(() => new Set(initial?.known));
  const [unknown, setUnknown] = useState<Set<string>>(() => new Set(initial?.unknown));
  const [shuffle, setShuffle] = useState(initial?.shuffle ?? false);
  const [swap, setSwap] = useState(initial?.swap ?? false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Latest state for the unload flush; `dirty` = changes not yet sent.
  const latest = useRef<StoredStudyState>({ known: [], unknown: [], order, index, shuffle, swap });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wasFinished = useRef(false);
  const mounted = useRef(false);

  const flush = useCallback(
    (opts: { keepalive?: boolean; completed?: boolean } = {}) => {
      clearTimeout(timer.current);
      if (!dirty.current && !opts.completed) return;
      dirty.current = false;
      saveStudyProgress(setId, { ...latest.current, completed: opts.completed }, { keepalive: opts.keepalive })
        .then(() => setSaveFailed(false))
        .catch(() => {
          dirty.current = true;
          setSaveFailed(true);
        });
    },
    [setId],
  );

  const total = order.length;
  const finished = total > 0 && index >= total;

  useEffect(() => {
    latest.current = { known: [...known], unknown: [...unknown], order, index, shuffle, swap };
    if (cards.length === 0) return;
    // Skip the initial render: nothing changed yet, so there is nothing to save.
    if (!mounted.current) {
      mounted.current = true;
      wasFinished.current = finished;
      return;
    }
    dirty.current = true;
    if (finished && !wasFinished.current) {
      wasFinished.current = true;
      flush({ completed: true });
      return;
    }
    if (!finished) wasFinished.current = false;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [known, unknown, order, index, shuffle, swap, finished, cards.length, flush]);

  // Flush pending changes when the page is hidden or closed.
  useEffect(() => {
    const onHide = () => flush({ keepalive: true });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flush({ keepalive: true });
    };
  }, [flush]);

  const card = !finished ? byId.get(order[index]) : undefined;

  // Moving between cards keeps the current face (study in reverse); resets only pass reset=true.
  const goTo = useCallback((i: number, reset = false) => {
    if (reset) setFlipped(false);
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
    goTo(0, true);
  }

  function restartAll() {
    setConfirmRestart(false);
    setKnown(new Set());
    setUnknown(new Set());
    setOrder(shuffle ? shuffleArray(allIds) : allIds);
    goTo(0, true);
  }

  function restartUnknown() {
    const ids = allIds.filter((id) => !known.has(id));
    setUnknown(new Set());
    setOrder(shuffle ? shuffleArray(ids) : ids);
    goTo(0, true);
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
      if (finished || !card || confirmRestart) return;
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
  }, [finished, card, confirmRestart, prev, next, flip, mark]);

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
      <div className="index-card flex animate-rise flex-col items-center rounded-3xl border border-ink-200 px-6 pt-16 pb-10 text-center shadow-[0_2px_0_var(--color-ink-200),0_20px_40px_-20px_rgb(70_63_53/0.35)] motion-reduce:animate-none">
        <div className="mb-4 flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-sun-300 text-ink-900 shadow-[0_4px_0_var(--color-sun-400)]">
          <PartyPopper className="size-7" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-ink-900">Hoàn thành!</h2>
        <p className="mt-1 text-sm text-ink-600">Bạn đã học xong &ldquo;{title}&rdquo;.</p>
        <dl className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-3">
            <dt className="text-xs text-green-700">Đã thuộc</dt>
            <dd className="text-2xl font-semibold text-green-700">{knownCount}</dd>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
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
            className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-brand-600 hover:underline"
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
          key={card.id}
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
        onRestart={() => setConfirmRestart(true)}
      />
      {saveFailed && (
        <p role="status" className="text-center text-xs text-ink-500">
          Chưa lưu được tiến trình, sẽ thử lại sau.
        </p>
      )}
      <StudyControls
        canPrev={index > 0}
        onPrev={prev}
        onNext={next}
        onFlip={flip}
        onKnown={() => mark("known")}
        onUnknown={() => mark("unknown")}
      />
      <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title="Bắt đầu lại từ đầu?">
        <p className="text-sm text-ink-600">
          Tiến trình đã thuộc/chưa thuộc của nhóm thẻ này sẽ bị xoá.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmRestart(false)}>
            Huỷ
          </Button>
          <Button onClick={restartAll}>Bắt đầu lại</Button>
        </div>
      </Modal>
    </div>
  );
}
