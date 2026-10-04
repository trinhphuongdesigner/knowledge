"use client";

import { FileUp, Languages, Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Button, ButtonLink, EmptyState, Modal } from "@/components/ui";
import { useT } from "@/i18n/client";
import { api, enrichSetFully } from "@/lib/api";
import type { CardDTO } from "@/lib/validators";
import { CardForm } from "./CardForm";
import { CardItem } from "./CardItem";

export function CardList({
  setId,
  initialCards,
  english = false,
  knownIds = [],
  info,
  actions,
  starredIds = [],
  hardIds = [],
  readOnly = false,
}: {
  setId: string;
  initialCards: CardDTO[];
  english?: boolean;
  /** Card ids the user has marked "đã thuộc" (flashcards or quiz). */
  knownIds?: string[];
  /** Server-rendered title block of the set header. */
  info?: ReactNode;
  /** Server-rendered action links (study / import / edit) shown next to "Thêm thẻ". */
  actions?: ReactNode;
  /** Card ids the user starred (W7-B implements behaviour). */
  starredIds?: string[];
  /** Card ids flagged as hard by SRS (W7-B implements behaviour). */
  hardIds?: string[];
  /** Hide edit controls for sets the user does not own (W7-B implements behaviour). */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const t = useT("cards");
  const [cards, setCards] = useState(initialCards);
  const [modal, setModal] = useState<{ card?: CardDTO } | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichNote, setEnrichNote] = useState("");
  const known = useMemo(() => new Set(knownIds), [knownIds]);
  const knownCount = cards.filter((c) => known.has(c.id)).length;
  const [starredSet, setStarredSet] = useState(() => new Set(starredIds));
  const hard = useMemo(() => new Set(hardIds), [hardIds]);
  const [filter, setFilter] = useState<"all" | "starred" | "hard">("all");
  const [starError, setStarError] = useState("");
  const hardCount = cards.filter((c) => hard.has(c.id)).length;
  const starCount = cards.filter((c) => starredSet.has(c.id)).length;
  const visible = cards.filter((c) =>
    filter === "starred" ? starredSet.has(c.id) : filter === "hard" ? hard.has(c.id) : true,
  );

  function toggleStar(card: CardDTO) {
    const next = !starredSet.has(card.id);
    const apply = (on: boolean) =>
      setStarredSet((prev) => {
        const s = new Set(prev);
        if (on) s.add(card.id);
        else s.delete(card.id);
        return s;
      });
    apply(next);
    setStarError("");
    api.starCard(card.id, next).catch(() => {
      apply(!next);
      setStarError(t("list.starFailed"));
    });
  }

  async function enrich() {
    setEnriching(true);
    setEnrichNote(t("list.lookingUp"));
    const summary = await enrichSetFully(setId, (done, total) =>
      setEnrichNote(t("list.lookingUpProgress", { done, total })),
    );
    try {
      const fresh = await api.getSet(setId);
      setCards(fresh.cards);
      router.refresh();
    } catch {
      // keep the list we have
    }
    setEnrichNote(
      summary.interrupted
        ? t("list.lookupInterrupted")
        : summary.updated + summary.notFound === 0
          ? t("list.lookupAllDone")
          : summary.notFound
            ? t("list.lookupSummaryNotFound", { updated: summary.updated, notFound: summary.notFound })
            : t("list.lookupSummary", { updated: summary.updated }),
    );
    setEnriching(false);
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-5">
        {info}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {!readOnly && (
            <Button onClick={() => setModal({})}>
              <Plus className="size-4" aria-hidden />
              {t("list.addCard")}
            </Button>
          )}
          {actions}
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.card ? t("list.editCard") : t("list.addCard")}>
        <CardForm
          key={modal?.card?.id ?? "new"}
          setId={setId}
          card={modal?.card}
          english={english}
          onClose={() => setModal(null)}
          onSaved={(saved, mode) => {
            if (mode === "added") setCards((prev) => [...prev, saved]);
            else setCards((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
            router.refresh();
          }}
        />
      </Modal>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink-900">
            {t("list.title", { count: cards.length })}
            {knownCount > 0 && (
              <span className="ml-2 text-sm font-medium text-green-700">· {t("list.knownCount", { count: knownCount })}</span>
            )}
          </h2>
          {!readOnly && english && cards.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => void enrich()} loading={enriching}>
              <Languages className="size-4" aria-hidden />
              {t("list.lookup")}
            </Button>
          )}
        </div>
        {(starCount > 0 || hardCount > 0) && (
          <div role="group" aria-label={t("list.filter")} className="-mt-1 flex flex-wrap gap-2">
            {(
              [
                ["all", t("list.filterAll"), cards.length],
                ["starred", t("list.filterStarred"), starCount],
                ["hard", t("item.hard"), hardCount],
              ] as const
            ).map(([key, label, n]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
                  filter === key
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50",
                )}
              >
                {label} ({n})
              </button>
            ))}
          </div>
        )}
        {starError && (
          <p role="alert" className="text-sm text-red-700">
            {starError}
          </p>
        )}
        {enrichNote && (
          <p role="status" className="-mt-2 text-sm text-ink-600">
            {enrichNote}
          </p>
        )}
        {cards.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={t("list.emptyTitle")}
            description={
              readOnly ? t("list.emptyReadOnly") : t("list.emptyDescription")
            }
            action={
              readOnly ? undefined : (
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setModal({})}>
                  <Plus className="size-4" aria-hidden />
                  {t("list.addCard")}
                </Button>
                <ButtonLink href={`/sets/${setId}/import`} variant="secondary">
                  <FileUp className="size-4" aria-hidden />
                  {t("list.importCards")}
                </ButtonLink>
              </div>
              )
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((card) => (
              <li key={card.id}>
                <CardItem
                  card={card}
                  index={cards.indexOf(card) + 1}
                  english={english}
                  known={known.has(card.id)}
                  starred={starredSet.has(card.id)}
                  hard={hard.has(card.id)}
                  readOnly={readOnly}
                  onToggleStar={toggleStar}
                  onEdit={(c) => setModal({ card: c })}
                  onDeleted={(id) => {
                    setCards((prev) => prev.filter((c) => c.id !== id));
                    router.refresh();
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
