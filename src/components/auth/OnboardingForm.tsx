"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/app/welcome/actions";
import { ProfileFields } from "@/components/account/ProfileFields";
import { Button } from "@/components/ui";
import type { ProfileFormState } from "@/lib/auth/types";
import { DEFAULT_NATIVE_LANGUAGE } from "@/lib/languages";
import { FormError } from "./FormError";

export function OnboardingForm({ defaultName, next }: { defaultName: string; next?: string }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(completeOnboarding, undefined);
  const v = state?.values;
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state?.error} />
      <ProfileFields
        defaults={{
          name: v?.name ?? defaultName,
          fullName: v?.fullName ?? "",
          birthYear: v?.birthYear ?? "",
          nativeLanguage: v?.nativeLanguage ?? DEFAULT_NATIVE_LANGUAGE,
        }}
        errors={state?.fieldErrors}
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Đang lưu…" : "Hoàn tất"}
      </Button>
    </form>
  );
}
