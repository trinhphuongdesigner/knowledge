"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Textarea } from "@/components/ui";

type AudienceType = "all" | "active" | "email";

const OPTIONS: { value: AudienceType; label: string }[] = [
  { value: "all", label: "Tất cả người dùng" },
  { value: "active", label: "Người hoạt động trong N ngày gần đây" },
  { value: "email", label: "Một người theo email" },
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const first = data?.details?.fieldErrors && Object.values(data.details.fieldErrors as Record<string, string[]>).flat()[0];
    throw new Error(first || data?.error || `Yêu cầu thất bại (${res.status})`);
  }
  return data as T;
}

export function BroadcastForm() {
  const router = useRouter();
  const [type, setType] = useState<AudienceType>("all");
  const [days, setDays] = useState("7");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("/");
  const [preview, setPreview] = useState<number | null>(null);
  const [busy, setBusy] = useState<"preview" | "send" | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const audience =
    type === "all" ? { type } : type === "active" ? { type, days: Number(days) } : { type, email: email.trim() };

  function invalidate() {
    setPreview(null);
    setDone("");
  }

  async function runPreview() {
    setBusy("preview");
    setError("");
    setDone("");
    try {
      const sp = new URLSearchParams({ type });
      if (type === "active") sp.set("days", days);
      if (type === "email") sp.set("email", email.trim());
      const r = await api<{ recipients: number }>(`/api/admin/notifications?${sp.toString()}`);
      setPreview(r.recipients);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Không thể xem trước.");
    } finally {
      setBusy(null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (preview === null) {
      await runPreview();
      return;
    }
    if (preview === 0) return;
    if (!window.confirm(`Gửi thông báo tới ${preview} người?`)) return;
    setBusy("send");
    setError("");
    try {
      const r = await api<{ recipients: number }>("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, message: { title, body, href } }),
      });
      setDone(`Đã gửi tới ${r.recipients} người.`);
      setPreview(null);
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi thất bại.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-700">Đối tượng nhận</legend>
        <div className="flex flex-col gap-1">
          {OPTIONS.map((o) => (
            <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink-900">
              <input
                type="radio"
                name="audience"
                value={o.value}
                checked={type === o.value}
                onChange={() => {
                  setType(o.value);
                  invalidate();
                }}
                className="size-4 accent-brand-600"
              />
              {o.label}
            </label>
          ))}
        </div>
        {type === "active" && (
          <Input
            label="Số ngày"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              invalidate();
            }}
            className="sm:max-w-40"
          />
        )}
        {type === "email" && (
          <Input
            label="Email người nhận"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              invalidate();
            }}
            placeholder="nguoidung@gmail.com"
          />
        )}
      </fieldset>

      <Input label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
      <Textarea label="Nội dung" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={4} required />
      <Input
        label="Đường dẫn khi bấm vào (bắt đầu bằng /)"
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="/library"
        maxLength={300}
        required
      />

      {preview !== null && (
        <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-accent-strong" role="status">
          {preview === 0 ? "Không có người nhận nào phù hợp." : `Sẽ gửi tới ${preview} người.`}
        </p>
      )}
      {done && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
          {done}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" onClick={runPreview} loading={busy === "preview"} disabled={busy !== null}>
          Xem số người nhận
        </Button>
        <Button type="submit" loading={busy === "send"} disabled={busy !== null || preview === null || preview === 0}>
          <Send className="size-4" aria-hidden />
          Gửi thông báo
        </Button>
      </div>
    </form>
  );
}
