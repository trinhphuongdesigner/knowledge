"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/(auth)/actions";
import { Button, Input } from "@/components/ui";
import type { AuthFormState } from "@/lib/auth/types";
import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(login, undefined);
  const errors = state?.fieldErrors;
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state?.error} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state?.values?.email}
        error={errors?.email?.[0]}
      />
      <PasswordInput
        label="Mật khẩu"
        name="password"
        autoComplete="current-password"
        required
        error={errors?.password?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
      <p className="text-center text-sm text-ink-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
