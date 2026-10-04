"use client";

import { Gauge, LogOut, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Textarea } from "@/components/ui";
import { useT } from "@/i18n/client";
import type { TFunction } from "@/i18n/translate";
import { parseQuotaField } from "@/lib/admin/users";

type Props = {
  userId: string;
  email: string;
  disabled: boolean;
  quota: { sets: number | null; cards: number | null; ai: number | null };
  defaults: { sets: number; cards: number; ai: number };
  impact: { publicSets: number; savers: number; sets: number; cards: number };
};

type ModalKind = "revoke" | "disable" | "enable" | "delete" | "quota" | null;

async function call(t: TFunction<"admin">, url: string, method: string, body?: unknown): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? t("requestFailed", { status: res.status }));
  }
}

export function UserActions(props: Props) {
  const { userId, email, disabled } = props;
  const router = useRouter();
  const t = useT("admin");
  const [modal, setModal] = useState<ModalKind>(null);
  const base = `/api/admin/users/${userId}`;

  const close = () => setModal(null);
  const done = () => {
    setModal(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setModal("revoke")}>
          <LogOut className="size-4" aria-hidden /> {t("actions.revoke")}
        </Button>
        <Button variant="secondary" onClick={() => setModal("quota")}>
          <Gauge className="size-4" aria-hidden /> {t("actions.quota")}
        </Button>
        {disabled ? (
          <Button variant="secondary" onClick={() => setModal("enable")}>
            <ShieldCheck className="size-4" aria-hidden /> {t("actions.enable")}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setModal("disable")}>
            <ShieldAlert className="size-4" aria-hidden /> {t("actions.disable")}
          </Button>
        )}
        <Button variant="danger" onClick={() => setModal("delete")}>
          <Trash2 className="size-4" aria-hidden /> {t("actions.delete")}
        </Button>
      </div>

      <Modal open={modal === "revoke"} onClose={close} title={t("actions.revoke")} centered>
        <ConfirmBody
          text={t("actions.revokeText", { email })}
          action={t("actions.revokeAction")}
          onCancel={close}
          onConfirm={async () => {
            await call(t, `${base}/sessions`, "DELETE");
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "enable"} onClose={close} title={t("actions.enable")} centered>
        <ConfirmBody
          text={t("actions.enableText", { email })}
          action={t("actions.enable")}
          onCancel={close}
          onConfirm={async () => {
            await call(t, `${base}/enable`, "POST");
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "disable"} onClose={close} title={t("actions.disable")} centered>
        <DisableForm email={email} onCancel={close} onSubmit={async (reason) => {
          await call(t, `${base}/disable`, "POST", { reason });
          done();
        }} />
      </Modal>

      <Modal open={modal === "quota"} onClose={close} title={t("actions.quotaTitle")} centered>
        <QuotaForm
          quota={props.quota}
          defaults={props.defaults}
          onCancel={close}
          onSubmit={async (v) => {
            await call(t, `${base}/quota`, "PATCH", v);
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "delete"} onClose={close} title={t("actions.delete")} centered>
        <DeleteForm
          email={email}
          impact={props.impact}
          onCancel={close}
          onSubmit={async (confirmEmail) => {
            await call(t, base, "DELETE", { confirmEmail });
            setModal(null);
            router.push("/admin/users");
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}

function ErrorLine({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

function Footer({ onCancel, loading, label, danger, disabled }: { onCancel: () => void; loading: boolean; label: string; danger?: boolean; disabled?: boolean }) {
  const t = useT("admin");
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        {t("cancel")}
      </Button>
      <Button type="submit" variant={danger ? "danger" : "primary"} loading={loading} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}

/** Chạy một thao tác async, gom trạng thái loading/lỗi. */
function useAction() {
  const t = useT("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(fn: () => Promise<void>) {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("genericError"));
      setLoading(false);
    }
  }
  return { loading, error, run };
}

function ConfirmBody({ text, action, onCancel, onConfirm }: { text: string; action: string; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const { loading, error, run } = useAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(onConfirm);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-ink-700">{text}</p>
      <ErrorLine message={error} />
      <Footer onCancel={onCancel} loading={loading} label={action} />
    </form>
  );
}

function DisableForm({ email, onCancel, onSubmit }: { email: string; onCancel: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const t = useT("admin");
  const [reason, setReason] = useState("");
  const { loading, error, run } = useAction();
  function submit(e: FormEvent) {
    e.preventDefault();
    void run(() => onSubmit(reason.trim()));
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-ink-700">
        {t("actions.disableText", { email })}
      </p>
      <Textarea label={t("actions.reason")} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={3} autoFocus />
      <ErrorLine message={error} />
      <Footer onCancel={onCancel} loading={loading} label={t("actions.disable")} danger disabled={!reason.trim()} />
    </form>
  );
}

function QuotaForm({
  quota,
  defaults,
  onCancel,
  onSubmit,
}: {
  quota: Props["quota"];
  defaults: Props["defaults"];
  onCancel: () => void;
  onSubmit: (v: { quotaSets: number | null; quotaCards: number | null; quotaAiPerDay: number | null }) => Promise<void>;
}) {
  const t = useT("admin");
  const [sets, setSets] = useState(quota.sets?.toString() ?? "");
  const [cards, setCards] = useState(quota.cards?.toString() ?? "");
  const [ai, setAi] = useState(quota.ai?.toString() ?? "");
  const [fieldError, setFieldError] = useState("");
  const { loading, error, run } = useAction();

  function submit(e: FormEvent) {
    e.preventDefault();
    const quotaSets = parseQuotaField(sets);
    const quotaCards = parseQuotaField(cards);
    const quotaAiPerDay = parseQuotaField(ai);
    if (quotaSets === undefined || quotaCards === undefined || quotaAiPerDay === undefined) {
      setFieldError(t("actions.quotaInvalid"));
      return;
    }
    setFieldError("");
    void run(() => onSubmit({ quotaSets, quotaCards, quotaAiPerDay }));
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-ink-600">{t("actions.quotaHint")}</p>
      <Input label={t("actions.quotaSets", { n: defaults.sets })} inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} placeholder={String(defaults.sets)} />
      <Input label={t("actions.quotaCards", { n: defaults.cards })} inputMode="numeric" value={cards} onChange={(e) => setCards(e.target.value)} placeholder={String(defaults.cards)} />
      <Input label={t("actions.quotaAi", { n: defaults.ai })} inputMode="numeric" value={ai} onChange={(e) => setAi(e.target.value)} placeholder={String(defaults.ai)} />
      <ErrorLine message={fieldError || error} />
      <Footer onCancel={onCancel} loading={loading} label={t("actions.saveQuota")} />
    </form>
  );
}

function DeleteForm({ email, impact, onCancel, onSubmit }: { email: string; impact: Props["impact"]; onCancel: () => void; onSubmit: (confirmEmail: string) => Promise<void> }) {
  const t = useT("admin");
  const [typed, setTyped] = useState("");
  const { loading, error, run } = useAction();
  const matches = typed === email;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!matches) return;
    void run(() => onSubmit(typed));
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
        <p className="font-semibold">{t("actions.irreversible")}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>
            {t("actions.deleteLine1", { sets: impact.sets, cards: impact.cards })}
          </li>
          <li>
            {t("actions.deleteLine2", { publicSets: impact.publicSets, savers: impact.savers })}
          </li>
        </ul>
      </div>
      <Input
        label={t("actions.deleteConfirm", { email })}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      <ErrorLine message={error} />
      <Footer onCancel={onCancel} loading={loading} label={t("actions.deleteAction")} danger disabled={!matches} />
    </form>
  );
}
