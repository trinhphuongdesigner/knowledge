"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useT } from "@/i18n/client";

export function RunCleanupButton() {
  const router = useRouter();
  const t = useT("admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system/cleanup", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? t("cleanup.failed"));
      const total = Object.values(data as Record<string, number>).reduce((s, n) => s + n, 0);
      setMessage({ ok: true, text: t("cleanup.done", { count: total }) });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : t("cleanup.failed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" loading={loading} onClick={run}>
        {t("cleanup.run")}
      </Button>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
