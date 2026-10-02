"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/account/actions";
import { FormError } from "@/components/auth/FormError";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui";
import type { AccountFormState } from "@/lib/auth/types";
import { FormSuccess } from "./FormSuccess";

export function PasswordForm() {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(changePassword, undefined);
  const errors = state?.fieldErrors;
  // Remount on success to clear all password fields.
  return (
    <form key={state?.success ? "ok" : "form"} action={action} noValidate className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <PasswordInput
        label="Mật khẩu hiện tại"
        name="currentPassword"
        autoComplete="current-password"
        required
        error={errors?.currentPassword?.[0]}
      />
      <PasswordInput
        label="Mật khẩu mới (8–128 ký tự)"
        name="newPassword"
        autoComplete="new-password"
        required
        error={errors?.newPassword?.[0]}
      />
      <PasswordInput
        label="Nhập lại mật khẩu mới"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={errors?.confirmPassword?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Đang đổi mật khẩu…" : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
