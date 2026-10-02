"use client";

import { Check, Copy, Globe, Link2, Lock, Share2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Modal } from "@/components/ui";
import { api } from "@/lib/api";
import type { Visibility } from "@/lib/validators";

const OPTIONS: { value: Visibility; label: string; hint: string; icon: typeof Lock }[] = [
  { value: "PRIVATE", label: "Riêng tư", hint: "Chỉ mình bạn xem được.", icon: Lock },
  { value: "LINK", label: "Ai có link", hint: "Ai có liên kết đều xem được, không cần đăng nhập.", icon: Link2 },
  {
    value: "PUBLIC",
    label: "Công khai trong thư viện — chờ duyệt",
    hint: "Hiện ở trang Thư viện sau khi quản trị viên duyệt. Ai có link vẫn xem được ngay.",
    icon: Globe,
  },
];

export function ShareButton({
  setId,
  visibility: initialVisibility,
  shareToken: initialToken,
  approved: initialApproved,
}: {
  setId: string;
  visibility: Visibility;
  shareToken: string | null;
  approved: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [token, setToken] = useState(initialToken);
  const [approved, setApproved] = useState(initialApproved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const link = token && typeof window !== "undefined" ? `${window.location.origin}/s/${token}` : "";

  async function choose(next: Visibility) {
    if (next === visibility || saving) return;
    setSaving(true);
    setError("");
    try {
      const dto = await api.setVisibility(setId, next);
      // Server: chuyển sang PUBLIC từ chế độ khác luôn chờ duyệt; giữ nguyên nếu đã PUBLIC.
      setApproved(next === "PUBLIC" && visibility === "PUBLIC" ? approved : false);
      setVisibility(dto.visibility);
      setToken(dto.shareToken ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể đổi chế độ chia sẻ.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Không sao chép được, hãy chọn và copy liên kết thủ công.");
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Share2 className="size-4" aria-hidden />
        Chia sẻ
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Chia sẻ nhóm thẻ">
        <fieldset disabled={saving} className="flex flex-col gap-2">
          <legend className="sr-only">Chế độ chia sẻ</legend>
          {OPTIONS.map((o) => {
            const checked = visibility === o.value;
            return (
              <label
                key={o.value}
                className={
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600 " +
                  (checked ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:bg-ink-50")
                }
              >
                <input
                  type="radio"
                  name="visibility"
                  value={o.value}
                  checked={checked}
                  onChange={() => choose(o.value)}
                  className="mt-1 size-4 accent-brand-600"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <o.icon className="size-4 shrink-0" aria-hidden />
                    {o.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-600">{o.hint}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {visibility === "PUBLIC" && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-600">
            Trạng thái:
            <Badge tone={approved ? "green" : "gray"}>{approved ? "Đã duyệt" : "Chờ duyệt"}</Badge>
          </p>
        )}

        {visibility !== "PRIVATE" && token && (
          <div className="mt-4">
            <label htmlFor="share-link" className="mb-1 block text-sm font-medium text-ink-700">
              Liên kết chia sẻ
            </label>
            <div className="flex gap-2">
              <input
                id="share-link"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 text-sm text-ink-900"
              />
              <Button variant="secondary" onClick={copyLink} aria-live="polite">
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Đã chép" : "Chép link"}
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Xong
          </Button>
        </div>
      </Modal>
    </>
  );
}
