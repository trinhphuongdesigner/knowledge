"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui";
import type { ResetFormState } from "@/lib/auth/types";
import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetFormState, FormData>(resetPassword, undefined);
  const errors = state?.fieldErrors;
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <FormError message={state?.error} />
      <PasswordInput
        label="Mật khẩu mới"
        name="password"
        autoComplete="new-password"
        required
        error={errors?.password?.[0]}
      />
      <PasswordInput
        label="Nhập lại mật khẩu mới"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={errors?.confirmPassword?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Đang lưu…" : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
