"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Plus } from "lucide-react";
import { Button, ButtonLink, EmptyState, Modal } from "@/components/ui";
import { api, saveStudyProgress } from "@/lib/api";
import type { Grade } from "@/lib/srs";
import type { CardDTO } from "@/lib/validators";
import { Flashcard } from "./Flashcard";
import { StudyControls, StudyToolbar } from "./StudyControls";
import { StudyFinished } from "./StudyFinished";
import { StudyProgress } from "./StudyProgress";
import { parseStudyState, shuffleArray, type StoredStudyState } from "./utils";
import { useT } from "@/i18n/client";

type Props = {
  setId: string;
  title: string;
  cards: CardDTO[];
  english?: boolean;
  /** Progress saved in the DB for this user + set (null when none). */
  initialProgress?: StoredStudyState | null;
  /** false for filtered sessions (?only=): do not overwrite the set's saved progress. */
  persist?: boolean;
};

const SWIPE_THRESHOLD = 60;
const SAVE_DEBOUNCE_MS = 800;
const REVIEW_DEBOUNCE_MS = 2000;
const REVIEW_MAX_BATCH = 50;

export function StudySession({ setId, title, cards, english = false, initialProgress = null, persist = true }: Props) {
  const t = useT("study");
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
      if (!persist) return;
      if (!dirty.current && !opts.completed) return;
      dirty.current = false;
      saveStudyProgress(setId, { ...latest.current, completed: opts.completed }, { keepalive: opts.keepalive })
        .then(() => setSaveFailed(false))
        .catch(() => {
          dirty.current = true;
          setSaveFailed(true);
        });
    },
    [setId, persist],
  );

  // SRS: queue grade 2 (Đã thuộc) / 0 (Chưa thuộc), sent fire-and-forget in small batches.
  const reviewQueue = useRef<{ cardId: string; grade: Grade }[]>([]);
  const reviewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flushReviews = useCallback(
    (opts: { keepalive?: boolean } = {}) => {
      clearTimeout(reviewTimer.current);
      while (reviewQueue.current.length > 0) {
        const items = reviewQueue.current.splice(0, REVIEW_MAX_BATCH);
        const body = { setId, mode: "FLASHCARD" as const, items };
        const done = opts.keepalive
          ? fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
              keepalive: true,
            }).then((r) => {
              if (!r.ok) throw new Error("review failed");
            })
          : api.recordReviews(body);
        done.catch(() => {
          reviewQueue.current.unshift(...items); // retry with the next flush
        });
      }
    },
    [setId],
  );
  const queueReview = useCallback(
    (cardId: string, grade: Grade) => {
      reviewQueue.current.push({ cardId, grade });
      clearTimeout(reviewTimer.current);
      if (reviewQueue.current.length >= REVIEW_MAX_BATCH) flushReviews();
      else reviewTimer.current = setTimeout(() => flushReviews(), REVIEW_DEBOUNCE_MS);
    },
    [flushReviews],
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

  useEffect(() => {
    if (finished) flushReviews();
  }, [finished, flushReviews]);

  // Flush pending changes when the page is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      flush({ keepalive: true });
      flushReviews({ keepalive: true });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flush({ keepalive: true });
      flushReviews({ keepalive: true });
    };
  }, [flush, flushReviews]);

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
      queueReview(id, kind === "known" ? 2 : 0);
      goTo(index + 1);
    },
    [order, index, goTo, queueReview],
  );

  function toggleShuffle() {
    const on = !shuffle;
    setShuffle(on);
    setOrder((o) => (on ? shuffleArray(o) : [...o].sort((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0))));
    goTo(0, true);
  }

  // Học lại chỉ đưa về thẻ đầu: kết quả đã thuộc/chưa thuộc được giữ, bộ thẻ không bao giờ quay về "chưa học".
  function restartAll() {
    setConfirmRestart(false);
    setOrder(shuffle ? shuffleArray(allIds) : allIds);
    goTo(0, true);
  }

  function restartUnknown() {
    const ids = allIds.filter((id) => !known.has(id));
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
        title={t("session.emptyTitle")}
        description={t("session.emptyDescription")}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href={`/sets/${setId}`}>{t("session.addCards")}</ButtonLink>
            <ButtonLink href={`/sets/${setId}/import`} variant="secondary">
              {t("session.import")}
            </ButtonLink>
          </div>
        }
      />
    );
  }

  const restartModal = (
    <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title={t("session.restartTitle")} centered>
      <p className="text-sm text-ink-600">
        {t("session.restartBody")}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setConfirmRestart(false)}>
          {t("session.cancel")}
        </Button>
        <Button onClick={restartAll}>{t("session.restart")}</Button>
      </div>
    </Modal>
  );

  if (finished || total === 0) {
    const knownCount = allIds.filter((id) => known.has(id)).length;
    const unknownCount = allIds.filter((id) => !known.has(id) && unknown.has(id)).length;
    const unmarkedCount = allIds.length - knownCount - unknownCount;
    return (
      <>
        <StudyFinished
          setId={setId}
          title={title}
          total={allIds.length}
          knownCount={knownCount}
          unknownCount={unknownCount}
          unmarkedCount={unmarkedCount}
          remainingCount={allIds.length - knownCount}
          canQuiz={allIds.length >= 2}
          onRestartUnknown={restartUnknown}
          onRestartAll={restartAll}
        />
        {restartModal}
      </>
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
          frontLabel={swap ? t("session.answer") : t("session.question")}
          backLabel={swap ? t("session.question") : t("session.answer")}
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
          {t("session.saveFailed")}
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
      {restartModal}
    </div>
  );
}
