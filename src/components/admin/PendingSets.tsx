"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export type PendingSet = { id: string; title: string; ownerEmail: string; cardCount: number };

export function PendingSets({ sets }: { sets: PendingSet[] }) {
  const router = useRouter();
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
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Thao tác thất bại");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thao tác thất bại");
    } finally {
      setBusy(null);
    }
  }

  if (sets.length === 0) return <p className="text-sm text-ink-600">Không có bộ nào đang chờ duyệt.</p>;
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
                {s.ownerEmail} · {s.cardCount} thẻ
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" loading={busy === s.id} disabled={busy !== null} onClick={() => decide(s.id, true)}>
                <Check className="size-4" aria-hidden />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy !== null}
                onClick={() => decide(s.id, false)}
                title="Từ chối: bộ chuyển về chế độ chỉ-link, không hiện ở thư viện"
              >
                <X className="size-4" aria-hidden />
                Từ chối
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
