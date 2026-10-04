"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useT } from "@/i18n/client";

export type PendingSet = { id: string; title: string; ownerEmail: string; cardCount: number };

export function PendingSets({ sets }: { sets: PendingSet[] }) {
  const router = useRouter();
  const t = useT("admin");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, approved: boolean) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? t("actionFailed"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("actionFailed"));
    } finally {
      setBusy(null);
    }
  }

  if (sets.length === 0) return <p className="text-sm text-ink-600">{t("pending.none")}</p>;
  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <ul className="divide-y divide-ink-100">
        {sets.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <Link href={`/sets/${s.id}`} className="truncate font-medium text-ink-900 hover:text-accent">
                {s.title}
              </Link>
              <p className="truncate text-xs text-ink-500">
                {s.ownerEmail} · {t("pending.cardsCount", { count: s.cardCount })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" loading={busy === s.id} disabled={busy !== null} onClick={() => decide(s.id, true)}>
                <Check className="size-4" aria-hidden />
                {t("pending.approve")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy !== null}
                onClick={() => decide(s.id, false)}
                title={t("pending.rejectHint")}
              >
                <X className="size-4" aria-hidden />
                {t("pending.reject")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
