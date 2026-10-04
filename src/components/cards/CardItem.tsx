"use client";

import { Check, Flame, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, Markdown, Modal } from "@/components/ui";
import { useT } from "@/i18n/client";
import { api } from "@/lib/api";
import type { CardDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { PhoneticLine, SpeakButton } from "./SpeakButton";

export function CardItem({
  card,
  index,
  english = false,
  known = false,
  starred = false,
  hard = false,
  readOnly = false,
  onToggleStar,
  onEdit,
  onDeleted,
}: {
  card: CardDTO;
  index: number;
  english?: boolean;
  known?: boolean;
  starred?: boolean;
  hard?: boolean;
  /** Hide edit/delete (sets the user does not own). Star stays available. */
  readOnly?: boolean;
  onToggleStar?: (card: CardDTO) => void;
  onEdit: (card: CardDTO) => void;
  onDeleted: (id: string) => void;
}) {
  const t = useT("cards");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function remove() {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteCard(card.id);
      onDeleted(card.id);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : t("item.deleteFailed"));
      setDeleting(false);
    }
  }

  return (
    <Card
      className={
        "transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 " +
        (known ? "border-green-200 bg-green-50/40" : "")
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
            (known ? "bg-green-100 text-green-700" : "bg-brand-50 text-accent-strong")
          }
        >
          {known ? <Check className="size-4 animate-pop motion-reduce:animate-none" aria-hidden /> : index}
          {known && <span className="sr-only">{t("item.knownSr", { n: index })}</span>}
        </span>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-400">
              {t("fields.question")}
              {hard && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-red-700">
                  <Flame className="size-3" aria-hidden />
                  {t("item.hard")}
                </span>
              )}
              {known && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] normal-case tracking-normal text-green-700">
                  <Check className="size-3" aria-hidden />
                  {t("item.known")}
                </span>
              )}
            </p>
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <Markdown className="text-ink-900">{card.question}</Markdown>
                {english && <PhoneticLine phonetic={card.phonetic} partOfSpeech={card.partOfSpeech} />}
              </div>
              {english && <SpeakButton text={card.question} audioUrl={card.audioUrl} className="-my-2.5" />}
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">{t("fields.answer")}</p>
            <Markdown className="text-ink-900">{card.answer}</Markdown>
            {card.explanation && (
              <Markdown className="mt-2 text-sm text-ink-500">{card.explanation}</Markdown>
            )}
          </div>
        </div>
        <div className="-mr-2 -mt-2 flex shrink-0 flex-col sm:flex-row">
          {onToggleStar && (
            <button
              type="button"
              onClick={() => onToggleStar(card)}
              aria-pressed={starred}
              aria-label={starred ? t("item.unstar", { n: index }) : t("item.star", { n: index })}
              className={cn(
                "flex size-11 items-center justify-center rounded-xl hover:bg-ink-100",
                starred ? "text-amber-500" : "text-ink-500 hover:text-ink-900",
              )}
            >
              <Star className={cn("size-4", starred && "fill-current")} aria-hidden />
            </button>
          )}
          {!readOnly && (
            <>
          <button
            type="button"
            onClick={() => onEdit(card)}
            aria-label={t("item.edit", { n: index })}
            className="flex size-11 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={t("item.delete", { n: index })}
            className="flex size-11 items-center justify-center rounded-xl text-ink-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
            </>
          )}
        </div>
      </div>
      <Modal open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)} title={t("item.deleteTitle")} centered>
        <p className="text-sm text-ink-600">{t("item.deleteBody")}</p>
        {deleteError && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {deleteError}
          </p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deleting}>
            {t("form.cancel")}
          </Button>
          <Button variant="danger" onClick={remove} loading={deleting}>
            {t("item.deleteConfirm")}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
