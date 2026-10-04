"use client";

import { BookmarkCheck, BookmarkPlus, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useT } from "@/i18n/client";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/** "Lưu vào thư viện" / "Đã lưu" (bấm để bỏ lưu) + "Tạo bản sao". Dùng ở /library, /s/[token], trang chi tiết. */
export function SetSaveButtons({
  setId,
  subscribed: initialSubscribed,
  canSubscribe = true,
  unsaveLabel = false,
  size = "sm",
  className,
}: {
  setId: string;
  subscribed: boolean;
  /** false: ẩn nút lưu (vd. bộ công khai chưa được duyệt, chỉ xem bằng link) */
  canSubscribe?: boolean;
  /** true: nút đã lưu hiện chữ "Bỏ lưu" thay vì "Đã lưu" */
  unsaveLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const t = useT("library");
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [busy, setBusy] = useState<"save" | "copy" | null>(null);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy("save");
    setError("");
    try {
      if (subscribed) await api.unsubscribe(setId);
      else await api.subscribe(setId);
      setSubscribed(!subscribed);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveButtons.failed"));
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    setBusy("copy");
    setError("");
    try {
      const created = await api.copySet(setId);
      router.push(`/sets/${created.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveButtons.copyFailed"));
      setBusy(null);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        {canSubscribe && (
          <Button
            size={size}
            variant={subscribed ? "secondary" : "primary"}
            onClick={toggle}
            loading={busy === "save"}
            disabled={busy === "copy"}
            aria-pressed={subscribed}
            title={subscribed ? t("saveButtons.unsaveTitle") : undefined}
          >
            {subscribed ? <BookmarkCheck className="size-4" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}
            {subscribed ? (unsaveLabel ? t("saveButtons.unsave") : t("saveButtons.saved")) : t("saveButtons.save")}
          </Button>
        )}
        <Button size={size} variant="secondary" onClick={copy} loading={busy === "copy"} disabled={busy === "save"}>
          <Copy className="size-4" aria-hidden />
          {t("saveButtons.copy")}
        </Button>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
