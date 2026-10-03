"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/account/actions";
import { FormError } from "@/components/auth/FormError";
import { Button, Input } from "@/components/ui";
import type { AccountFormState } from "@/lib/auth/types";
import { FormSuccess } from "./FormSuccess";
import { ProfileFields } from "./ProfileFields";

export function ProfileForm({
  name,
  fullName,
  birthYear,
  nativeLanguage,
  gender,
  useGoogleAvatar,
  googleAvatarUrl,
  email,
}: {
  name: string;
  fullName: string;
  birthYear: string;
  nativeLanguage: string;
  /** "" = chưa chọn (tài khoản cũ) */
  gender: string;
  useGoogleAvatar: boolean;
  googleAvatarUrl: string | null;
  email: string;
}) {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(updateProfile, undefined);
  const v = state?.values;
  // Remount sau khi lưu thành công để các giá trị mặc định được làm mới.
  const formKey = state?.success ? `ok-${v?.name}-${v?.fullName}-${v?.birthYear}-${v?.nativeLanguage}-${v?.gender}-${v?.useGoogleAvatar}` : "form";
  return (
    <form key={formKey} action={action} noValidate className="flex flex-col gap-4">
      <FormError message={state?.error} />
      <FormSuccess message={state?.success} />
      <ProfileFields
        defaults={{
          name: v?.name ?? name,
          fullName: v?.fullName ?? fullName,
          birthYear: v?.birthYear ?? birthYear,
          nativeLanguage: v?.nativeLanguage ?? nativeLanguage,
          gender: v?.gender ?? gender,
          useGoogleAvatar: v?.useGoogleAvatar ?? useGoogleAvatar,
        }}
        googleAvatarUrl={googleAvatarUrl}
        errors={state?.fieldErrors}
      />
      <div className="flex flex-col gap-1.5">
        <Input label="Email" type="email" value={email} readOnly disabled autoComplete="email" />
        <p className="text-xs text-ink-500">Đăng nhập bằng Google</p>
      </div>
      <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
