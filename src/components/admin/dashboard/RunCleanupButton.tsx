"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function RunCleanupButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/system/cleanup", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Chạy cleanup thất bại");
      const total = Object.values(data as Record<string, number>).reduce((s, n) => s + n, 0);
      setMessage({ ok: true, text: `Đã xoá ${total} bản ghi.` });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Chạy cleanup thất bại" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" loading={loading} onClick={run}>
        Chạy cleanup ngay
      </Button>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
