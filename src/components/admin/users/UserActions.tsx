"use client";

import { Gauge, LogOut, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Textarea } from "@/components/ui";
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

async function call(url: string, method: string, body?: unknown): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Yêu cầu thất bại (${res.status})`);
  }
}

export function UserActions(props: Props) {
  const { userId, email, disabled } = props;
  const router = useRouter();
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
          <LogOut className="size-4" aria-hidden /> Đăng xuất mọi thiết bị
        </Button>
        <Button variant="secondary" onClick={() => setModal("quota")}>
          <Gauge className="size-4" aria-hidden /> Hạn mức
        </Button>
        {disabled ? (
          <Button variant="secondary" onClick={() => setModal("enable")}>
            <ShieldCheck className="size-4" aria-hidden /> Mở khoá
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setModal("disable")}>
            <ShieldAlert className="size-4" aria-hidden /> Khoá tài khoản
          </Button>
        )}
        <Button variant="danger" onClick={() => setModal("delete")}>
          <Trash2 className="size-4" aria-hidden /> Xoá tài khoản
        </Button>
      </div>

      <Modal open={modal === "revoke"} onClose={close} title="Đăng xuất mọi thiết bị" centered>
        <ConfirmBody
          text={`Mọi phiên đăng nhập của ${email} sẽ bị xoá; người dùng phải đăng nhập lại trên từng thiết bị.`}
          action="Đăng xuất"
          onCancel={close}
          onConfirm={async () => {
            await call(`${base}/sessions`, "DELETE");
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "enable"} onClose={close} title="Mở khoá tài khoản" centered>
        <ConfirmBody
          text={`Cho phép ${email} đăng nhập trở lại?`}
          action="Mở khoá"
          onCancel={close}
          onConfirm={async () => {
            await call(`${base}/enable`, "POST");
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "disable"} onClose={close} title="Khoá tài khoản" centered>
        <DisableForm email={email} onCancel={close} onSubmit={async (reason) => {
          await call(`${base}/disable`, "POST", { reason });
          done();
        }} />
      </Modal>

      <Modal open={modal === "quota"} onClose={close} title="Hạn mức riêng" centered>
        <QuotaForm
          quota={props.quota}
          defaults={props.defaults}
          onCancel={close}
          onSubmit={async (v) => {
            await call(`${base}/quota`, "PATCH", v);
            done();
          }}
        />
      </Modal>

      <Modal open={modal === "delete"} onClose={close} title="Xoá tài khoản" centered>
        <DeleteForm
          email={email}
          impact={props.impact}
          onCancel={close}
          onSubmit={async (confirmEmail) => {
            await call(base, "DELETE", { confirmEmail });
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
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        Huỷ
      </Button>
      <Button type="submit" variant={danger ? "danger" : "primary"} loading={loading} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}

/** Chạy một thao tác async, gom trạng thái loading/lỗi. */
function useAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(fn: () => Promise<void>) {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra.");
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
  const [reason, setReason] = useState("");
  const { loading, error, run } = useAction();
  function submit(e: FormEvent) {
    e.preventDefault();
    void run(() => onSubmit(reason.trim()));
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-ink-700">
        {email} sẽ bị đăng xuất khỏi mọi thiết bị ngay lập tức và không thể đăng nhập cho đến khi được mở khoá.
      </p>
      <Textarea label="Lý do khoá" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={3} autoFocus />
      <ErrorLine message={error} />
      <Footer onCancel={onCancel} loading={loading} label="Khoá tài khoản" danger disabled={!reason.trim()} />
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
      setFieldError("Chỉ nhập số nguyên từ 0 đến 1.000.000, hoặc để trống để dùng mặc định.");
      return;
    }
    setFieldError("");
    void run(() => onSubmit({ quotaSets, quotaCards, quotaAiPerDay }));
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-ink-600">Để trống = dùng mặc định của hệ thống.</p>
      <Input label={`Số bộ tối đa (mặc định ${defaults.sets})`} inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} placeholder={String(defaults.sets)} />
      <Input label={`Số thẻ tối đa (mặc định ${defaults.cards})`} inputMode="numeric" value={cards} onChange={(e) => setCards(e.target.value)} placeholder={String(defaults.cards)} />
      <Input label={`Lượt AI mỗi ngày (mặc định ${defaults.ai})`} inputMode="numeric" value={ai} onChange={(e) => setAi(e.target.value)} placeholder={String(defaults.ai)} />
      <ErrorLine message={fieldError || error} />
      <Footer onCancel={onCancel} loading={loading} label="Lưu hạn mức" />
    </form>
  );
}

function DeleteForm({ email, impact, onCancel, onSubmit }: { email: string; impact: Props["impact"]; onCancel: () => void; onSubmit: (confirmEmail: string) => Promise<void> }) {
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
        <p className="font-semibold">Hành động này không thể hoàn tác.</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>
            Xoá vĩnh viễn {impact.sets} bộ thẻ, {impact.cards} thẻ và toàn bộ tiến trình học của tài khoản.
          </li>
          <li>
            {impact.publicSets} bộ PUBLIC sẽ biến mất khỏi thư viện; {impact.savers} lượt lưu của người dùng khác sẽ mất.
          </li>
        </ul>
      </div>
      <Input
        label={`Gõ lại email ${email} để xác nhận`}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      <ErrorLine message={error} />
      <Footer onCancel={onCancel} loading={loading} label="Xoá vĩnh viễn" danger disabled={!matches} />
    </form>
  );
}
