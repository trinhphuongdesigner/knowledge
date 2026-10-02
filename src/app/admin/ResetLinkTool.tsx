"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button, Input } from "@/components/ui";
import { createUserResetLink, type ResetLinkState } from "./actions";

export function ResetLinkTool() {
  const [state, action, pending] = useActionState<ResetLinkState, FormData>(createUserResetLink, undefined);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!state?.link) return;
    try {
      await navigator.clipboard.writeText(state.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trình duyệt chặn clipboard: người dùng tự chọn và sao chép trong ô bên dưới
    }
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <p className="text-sm text-ink-600">
        Dùng khi người dùng chưa bật thông báo đẩy. Link có hiệu lực 30 phút, chỉ dùng một lần; tạo link mới sẽ vô hiệu hoá link cũ.
      </p>
      <FormError message={state?.error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input label="Email người dùng" name="email" type="email" inputMode="email" autoComplete="off" required />
        </div>
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          Tạo link
        </Button>
      </div>
      {state?.link && (
        <div className="space-y-2 rounded-xl border border-ink-200 bg-ink-50 p-3">
          <p className="text-xs text-ink-600">Link cho {state.email}:</p>
          <input
            readOnly
            value={state.link}
            aria-label="Link đặt lại mật khẩu"
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-ink-200 bg-surface px-2 py-2 font-mono text-xs text-ink-800"
          />
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? "Đã sao chép" : "Sao chép link"}
          </Button>
        </div>
      )}
    </form>
  );
}
