"use client";

import { FileUp, Languages, Layers, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button, ButtonLink, EmptyState, Modal } from "@/components/ui";
import { api, enrichSetFully } from "@/lib/api";
import type { CardDTO } from "@/lib/validators";
import { CardForm } from "./CardForm";
import { CardItem } from "./CardItem";

export function CardList({
  setId,
  initialCards,
  english = false,
  info,
  actions,
}: {
  setId: string;
  initialCards: CardDTO[];
  english?: boolean;
  /** Server-rendered title block of the set header. */
  info?: ReactNode;
  /** Server-rendered action links (study / import / edit) shown next to "Thêm thẻ". */
  actions?: ReactNode;
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [modal, setModal] = useState<{ card?: CardDTO } | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichNote, setEnrichNote] = useState("");

  async function enrich() {
    setEnriching(true);
    setEnrichNote("Đang tra phiên âm…");
    const summary = await enrichSetFully(setId, (done, total) =>
      setEnrichNote(`Đang tra phiên âm ${done}/${total}`),
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
        ? "Không kết nối được từ điển (cần có internet), một số thẻ chưa được tra. Hãy thử lại sau."
        : summary.updated + summary.notFound === 0
          ? "Tất cả thẻ đã được tra phiên âm."
          : `Đã tra ${summary.updated} thẻ${summary.notFound ? `, ${summary.notFound} thẻ không tìm thấy trong từ điển` : ""}.`,
    );
    setEnriching(false);
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {info}
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <Button onClick={() => setModal({})}>
            <Plus className="size-4" aria-hidden />
            Thêm thẻ
          </Button>
          {actions}
        </div>
      </div>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.card ? "Sửa thẻ" : "Thêm thẻ"}>
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
          <h2 className="text-lg font-semibold text-ink-900">Danh sách thẻ ({cards.length})</h2>
          {english && cards.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => void enrich()} loading={enriching}>
              <Languages className="size-4" aria-hidden />
              Tra phiên âm
            </Button>
          )}
        </div>
        {enrichNote && (
          <p role="status" className="-mt-2 text-sm text-ink-600">
            {enrichNote}
          </p>
        )}
        {cards.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Nhóm thẻ chưa có thẻ nào"
            description='Nhấn "Thêm thẻ" ở trên, hoặc import nhanh từ file CSV, Excel hoặc Markdown.'
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => setModal({})}>
                  <Plus className="size-4" aria-hidden />
                  Thêm thẻ
                </Button>
                <ButtonLink href={`/sets/${setId}/import`} variant="secondary">
                  <FileUp className="size-4" aria-hidden />
                  Import thẻ
                </ButtonLink>
              </div>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {cards.map((card, i) => (
              <li key={card.id}>
                <CardItem
                  card={card}
                  index={i + 1}
                  english={english}
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
