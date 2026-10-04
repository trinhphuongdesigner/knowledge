"use client";

import { Star, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Modal } from "@/components/ui";
import { useT } from "@/i18n/client";

export type PublicSet = {
  id: string;
  title: string;
  featured: boolean;
  ownerEmail: string;
  categoryName: string;
  cardCount: number;
  subscriberCount: number;
};

export function PublicSets({ sets, emptyText }: { sets: PublicSet[]; emptyText: string }) {
  const router = useRouter();
  const t = useT("admin");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toUnpublish, setToUnpublish] = useState<PublicSet | null>(null);

  async function patch(id: string, body: unknown): Promise<boolean> {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? t("actionFailed"));
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("actionFailed"));
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function confirmUnpublish() {
    if (!toUnpublish) return;
    if (await patch(toUnpublish.id, { unpublish: true })) setToUnpublish(null);
  }

  if (sets.length === 0) return <p className="text-sm text-ink-600">{emptyText}</p>;
  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <ul className="divide-y divide-ink-100">
        {sets.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/sets/${s.id}`} className="break-words font-medium text-ink-900 hover:text-accent">
                  {s.title}
                </Link>
                {s.featured && <Badge tone="blue">{t("publicSets.featured")}</Badge>}
              </div>
              <p className="truncate text-xs text-ink-500">
                {t("publicSets.meta", { owner: s.ownerEmail, category: s.categoryName, cards: s.cardCount, subs: s.subscriberCount })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={s.featured ? "primary" : "secondary"}
                disabled={busy !== null}
                loading={busy === s.id}
                aria-pressed={s.featured}
                onClick={() => patch(s.id, { featured: !s.featured })}
              >
                <Star className="size-4" aria-hidden />
                {t("publicSets.featured")}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => setToUnpublish(s)}>
                <Undo2 className="size-4" aria-hidden />
                {t("publicSets.unpublish")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={!!toUnpublish} onClose={() => busy === null && setToUnpublish(null)} title={t("publicSets.modalTitle")} centered>
        {toUnpublish && (
          <>
            <p className="text-sm text-ink-600">
              {t("publicSets.modalBefore")}
              <strong className="break-words text-ink-900">{toUnpublish.title}</strong>
              {t("publicSets.modalAfter")}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setToUnpublish(null)} disabled={busy !== null}>
                {t("cancel")}
              </Button>
              <Button variant="danger" onClick={confirmUnpublish} loading={busy === toUnpublish.id}>
                {t("publicSets.confirm")}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
