"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { useT } from "@/i18n/client";

type AudienceType = "all" | "active" | "email";

const OPTIONS = [
  { value: "all", label: "broadcast.audienceAll" },
  { value: "active", label: "broadcast.audienceActive" },
  { value: "email", label: "broadcast.audienceEmail" },
] as const;

async function api<T>(url: string, fallback: (status: number) => string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const first = data?.details?.fieldErrors && Object.values(data.details.fieldErrors as Record<string, string[]>).flat()[0];
    throw new Error(first || data?.error || fallback(res.status));
  }
  return data as T;
}

export function BroadcastForm() {
  const router = useRouter();
  const t = useT("admin");
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

  const failed = (status: number) => t("requestFailed", { status });
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
      const r = await api<{ recipients: number }>(`/api/admin/notifications?${sp.toString()}`, failed);
      setPreview(r.recipients);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : t("broadcast.previewFailed"));
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
    if (!window.confirm(t("broadcast.confirm", { count: preview }))) return;
    setBusy("send");
    setError("");
    try {
      const r = await api<{ recipients: number }>("/api/admin/notifications", failed, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, message: { title, body, href } }),
      });
      setDone(t("broadcast.sent", { count: r.recipients }));
      setPreview(null);
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("broadcast.sendFailed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-700">{t("broadcast.audience")}</legend>
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
              {t(o.label)}
            </label>
          ))}
        </div>
        {type === "active" && (
          <Input
            label={t("broadcast.days")}
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
            label={t("broadcast.recipientEmail")}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              invalidate();
            }}
            placeholder={t("broadcast.emailPlaceholder")}
          />
        )}
      </fieldset>

      <Input label={t("broadcast.title")} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
      <Textarea label={t("broadcast.body")} value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={4} required />
      <Input
        label={t("broadcast.href")}
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="/library"
        maxLength={300}
        required
      />

      {preview !== null && (
        <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-accent-strong" role="status">
          {preview === 0 ? t("broadcast.noRecipients") : t("broadcast.willSend", { count: preview })}
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
          {t("broadcast.previewBtn")}
        </Button>
        <Button type="submit" loading={busy === "send"} disabled={busy !== null || preview === null || preview === 0}>
          <Send className="size-4" aria-hidden />
          {t("broadcast.sendBtn")}
        </Button>
      </div>
    </form>
  );
}
