"use client";

import { ArrowDown, ArrowUp, Pencil, Plug, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card, Input, Modal, Select } from "@/components/ui";
import { useLocale, useT } from "@/i18n/client";
import { formatDate, formatNumber } from "@/i18n/format";
import type { TFunction } from "@/i18n/translate";
import type { AiProviderDTO } from "@/lib/admin/ai-providers";
import { AI_PROVIDER_INFO, AI_PROVIDER_KINDS, type AiProviderKindName } from "@/lib/ai-providers";
import { cn } from "@/lib/utils";

type Props = { providers: AiProviderDTO[]; encryptionReady: boolean; envFallback: boolean };

type FieldErrors = Partial<Record<"name" | "apiKey" | "baseUrl" | "model", string>>;

class RequestError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }
}

async function call<T>(t: TFunction<"admin">, url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fe = (data?.details?.fieldErrors ?? {}) as Record<string, string[] | undefined>;
    const fieldErrors = Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0]]).filter(([, v]) => v)) as FieldErrors;
    throw new RequestError(data?.error ?? t("requestFailed", { status: res.status }), fieldErrors);
  }
  return data as T;
}

const DT_OPTS: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" };

type Status = "ready" | "cooling" | "off";
function statusOf(p: AiProviderDTO, now: number): Status {
  if (!p.enabled) return "off";
  return p.cooldownUntil && new Date(p.cooldownUntil).getTime() > now ? "cooling" : "ready";
}

export function AiProviderManager({ providers, encryptionReady, envFallback }: Props) {
  const router = useRouter();
  const t = useT("admin");
  const locale = useLocale();
  const [editing, setEditing] = useState<AiProviderDTO | "new" | null>(null);
  const [deleting, setDeleting] = useState<AiProviderDTO | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ id: string; ok: boolean; text: string } | null>(null);
  // Mốc thời gian cố định cho một lần render (trạng thái "tạm nghỉ" được làm mới khi router.refresh()).
  const [now] = useState(() => Date.now());

  const enabled = providers.filter((p) => p.enabled);
  const ready = enabled.filter((p) => statusOf(p, now) === "ready");

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("actionFailed"));
    } finally {
      setBusy(null);
    }
  }

  const move = (index: number, dir: -1 | 1) =>
    run(`move:${providers[index].id}`, async () => {
      const ids = providers.map((p) => p.id);
      [ids[index], ids[index + dir]] = [ids[index + dir], ids[index]];
      await call(t, "/api/admin/ai/providers/reorder", "POST", { ids });
    });

  const patch = (p: AiProviderDTO, body: Record<string, unknown>, key: string) =>
    run(`${key}:${p.id}`, async () => {
      await call(t, `/api/admin/ai/providers/${p.id}`, "PATCH", body);
    });

  const test = (p: AiProviderDTO) =>
    run(`test:${p.id}`, async () => {
      setNotice(null);
      const r = await call<{ ok: boolean; ms: number; error?: string }>(t, `/api/admin/ai/providers/${p.id}/test`, "POST");
      setNotice({
        id: p.id,
        ok: r.ok,
        text: r.ok ? t("aiProviders.testOk", { ms: formatNumber(locale, r.ms) }) : t("aiProviders.testFail", { error: r.error ?? "" }),
      });
    });

  return (
    <div className="space-y-4">
      {!encryptionReady && (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {t("aiProviders.noEncryptionKey")}
        </p>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink-900">
            {providers.length === 0
              ? envFallback
                ? t("aiProviders.statusEnv")
                : t("aiProviders.statusDisabled")
              : enabled.length === 0
                ? t("aiProviders.statusAllOff")
                : ready.length === 0
                  ? t("aiProviders.statusMaintenance")
                  : t("aiProviders.statusReady", { ready: ready.length, total: enabled.length })}
          </p>
          <p className="mt-0.5 text-sm text-ink-600">{t("aiProviders.statusHint")}</p>
        </div>
        <Button onClick={() => setEditing("new")} disabled={!encryptionReady}>
          <Plus className="size-4" aria-hidden />
          {t("aiProviders.add")}
        </Button>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {providers.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-600">{t("aiProviders.empty")}</p>
        </Card>
      ) : (
        <ol className="space-y-3">
          {providers.map((p, i) => {
            const status = statusOf(p, now);
            const info = AI_PROVIDER_INFO[p.kind];
            return (
              <li key={p.id}>
                <Card className={cn("space-y-3", status === "cooling" && "border-amber-300", status === "off" && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums text-ink-500">#{i + 1}</span>
                        <h2 className="truncate font-semibold text-ink-900">{p.name}</h2>
                        <Badge tone="gray">{info.label}</Badge>
                        {status === "ready" && <Badge tone="green">{t("aiProviders.stReady")}</Badge>}
                        {status === "off" && <Badge tone="gray">{t("aiProviders.stOff")}</Badge>}
                        {status === "cooling" && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                            {t("aiProviders.stCooling", { until: formatDate(locale, p.cooldownUntil!, DT_OPTS) })}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 break-all text-sm text-ink-600">
                        {t("aiProviders.model")}: <span className="font-mono">{p.model || info.model}</span>
                        {!p.model && ` (${t("aiProviders.default")})`}
                        {" · "}
                        {t("aiProviders.key")}: <span className="font-mono">••••{p.keyHint}</span>
                      </p>
                      <p className="break-all text-xs text-ink-500">
                        {t("aiProviders.baseUrl")}: <span className="font-mono">{p.baseUrl || info.baseUrl}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={t("aiProviders.moveUp")}
                        title={t("aiProviders.moveUp")}
                        disabled={i === 0 || busy !== null}
                        onClick={() => void move(i, -1)}
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={t("aiProviders.moveDown")}
                        title={t("aiProviders.moveDown")}
                        disabled={i === providers.length - 1 || busy !== null}
                        onClick={() => void move(i, 1)}
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-ink-500">
                    {t("aiProviders.counts", { ok: formatNumber(locale, p.successCount), fail: formatNumber(locale, p.failCount) })}
                    {p.lastSuccessAt && ` · ${t("aiProviders.lastSuccess", { when: formatDate(locale, p.lastSuccessAt, DT_OPTS) })}`}
                  </p>
                  {p.lastError && (
                    <p className="break-words rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-700">
                      <span className="font-medium">{t("aiProviders.lastError")}</span>
                      {p.lastErrorAt && ` (${formatDate(locale, p.lastErrorAt, DT_OPTS)})`}: <span className="font-mono">{p.lastError}</span>
                    </p>
                  )}
                  {notice?.id === p.id && (
                    <p role="status" className={cn("text-sm", notice.ok ? "text-green-700" : "text-red-700")}>
                      {notice.text}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" loading={busy === `test:${p.id}`} disabled={busy !== null} onClick={() => void test(p)}>
                      <Plug className="size-4" aria-hidden />
                      {t("aiProviders.test")}
                    </Button>
                    {status === "cooling" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busy === `reset:${p.id}`}
                        disabled={busy !== null}
                        onClick={() => void patch(p, { resetCooldown: true }, "reset")}
                      >
                        <RotateCcw className="size-4" aria-hidden />
                        {t("aiProviders.reset")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busy === `toggle:${p.id}`}
                      disabled={busy !== null}
                      onClick={() => void patch(p, { enabled: !p.enabled }, "toggle")}
                    >
                      {p.enabled ? t("aiProviders.disable") : t("aiProviders.enable")}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setEditing(p)}>
                      <Pencil className="size-4" aria-hidden />
                      {t("aiProviders.edit")}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-700" disabled={busy !== null} onClick={() => setDeleting(p)}>
                      <Trash2 className="size-4" aria-hidden />
                      {t("aiProviders.delete")}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      {editing && (
        <ProviderForm
          provider={editing === "new" ? null : editing}
          encryptionReady={encryptionReady}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={t("aiProviders.deleteTitle")} centered>
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm text-ink-700">{t("aiProviders.deleteText", { name: deleting.name })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                {t("cancel")}
              </Button>
              <Button
                variant="danger"
                loading={busy === `delete:${deleting.id}`}
                onClick={() =>
                  void run(`delete:${deleting.id}`, async () => {
                    await call(t, `/api/admin/ai/providers/${deleting.id}`, "DELETE");
                    setDeleting(null);
                  })
                }
              >
                {t("aiProviders.delete")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ProviderForm({
  provider,
  encryptionReady,
  onClose,
  onSaved,
}: {
  provider: AiProviderDTO | null;
  encryptionReady: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT("admin");
  const [kind, setKind] = useState<AiProviderKindName>(provider?.kind ?? "ANTHROPIC");
  const [name, setName] = useState(provider?.name ?? AI_PROVIDER_INFO.ANTHROPIC.label);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(provider?.baseUrl ?? "");
  const [model, setModel] = useState(provider?.model ?? "");
  const [enabled, setEnabled] = useState(provider?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const info = AI_PROVIDER_INFO[kind];

  function changeKind(next: AiProviderKindName) {
    // Tên đang là nhãn mặc định của loại cũ → đổi theo loại mới.
    if (!name.trim() || name === AI_PROVIDER_INFO[kind].label) setName(AI_PROVIDER_INFO[next].label);
    setKind(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const body = { name, kind, baseUrl, model, enabled, ...(apiKey.trim() || !provider ? { apiKey } : {}) };
      if (provider) await call(t, `/api/admin/ai/providers/${provider.id}`, "PATCH", body);
      else await call(t, "/api/admin/ai/providers", "POST", body);
      onSaved();
    } catch (err) {
      if (err instanceof RequestError) setFieldErrors(err.fieldErrors);
      setError(err instanceof Error ? err.message : t("actionFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={provider ? t("aiProviders.editTitle") : t("aiProviders.addTitle")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Select
          label={t("aiProviders.kind")}
          value={kind}
          onValueChange={(v) => changeKind(v as AiProviderKindName)}
          options={AI_PROVIDER_KINDS.map((k) => ({ value: k, label: AI_PROVIDER_INFO[k].label }))}
        />
        {kind === "OPENAI_COMPATIBLE" && <p className="-mt-2 text-xs text-ink-500">{t("aiProviders.compatibleHint")}</p>}
        <Input label={t("aiProviders.name")} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required error={fieldErrors.name} />
        <Input
          label={t("aiProviders.apiKey")}
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={provider ? t("aiProviders.apiKeyKeep", { hint: provider.keyHint }) : "sk-..."}
          required={!provider}
          disabled={!encryptionReady}
          error={fieldErrors.apiKey}
        />
        <Input
          label={t("aiProviders.baseUrlOptional")}
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={info.baseUrl || "https://openrouter.ai/api/v1"}
          error={fieldErrors.baseUrl}
        />
        <Input
          label={t("aiProviders.modelOptional")}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={info.model || "openai/gpt-4.1-mini"}
          maxLength={120}
          error={fieldErrors.model}
        />
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink-900">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-4 accent-brand-600" />
          {t("aiProviders.enabledLabel")}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" loading={saving}>
            {t("aiProviders.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
