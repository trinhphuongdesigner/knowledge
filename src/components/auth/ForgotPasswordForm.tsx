"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { FormSuccess } from "@/components/account/FormSuccess";
import { Button, Input } from "@/components/ui";
import type { ResetFormState } from "@/lib/auth/types";
import { FormError } from "./FormError";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ResetFormState, FormData>(requestPasswordReset, undefined);
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
      </Button>
      <p className="text-center text-sm text-ink-600">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
