"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/account/actions";
import { FormError } from "@/components/auth/FormError";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button, Input } from "@/components/ui";
import type { AccountFormState } from "@/lib/auth/types";
import { FormSuccess } from "./FormSuccess";

export function ProfileForm({ name, email }: { name: string | null; email: string }) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(updateProfile, undefined);
  const errors = state?.fieldErrors;
  // Remount after a successful save so the password field is cleared and defaults refresh.
  const formKey = state?.success ? `ok-${state.values?.email}-${state.values?.name}` : "form";
  return (
    <form key={formKey} action={action} noValidate className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <Input
        label="Tên hiển thị (tuỳ chọn)"
        name="name"
        autoComplete="name"
        maxLength={80}
        defaultValue={state?.values?.name ?? name ?? ""}
        error={errors?.name?.[0]}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email ?? email}
        error={errors?.email?.[0]}
      />
      <PasswordInput
        label="Mật khẩu hiện tại (chỉ cần khi đổi email)"
        name="currentPassword"
        autoComplete="current-password"
        error={errors?.currentPassword?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
