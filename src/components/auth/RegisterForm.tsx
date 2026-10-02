"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/(auth)/actions";
import { Button, Input } from "@/components/ui";
import type { AuthFormState } from "@/lib/auth/types";
import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(register, undefined);
  const errors = state?.fieldErrors;
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <Input
        label="Tên hiển thị (tuỳ chọn)"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name}
        error={errors?.name?.[0]}
      />
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
        label="Mật khẩu (8–128 ký tự)"
        name="password"
        autoComplete="new-password"
        required
        error={errors?.password?.[0]}
      />
      <PasswordInput
        label="Nhập lại mật khẩu"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={errors?.confirmPassword?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Đang tạo tài khoản…" : "Đăng ký"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
