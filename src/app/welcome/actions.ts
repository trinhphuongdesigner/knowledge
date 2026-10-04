"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uiLanguageFromNative } from "@/i18n/config";
import { localizeFieldErrors } from "@/i18n/validation";
import { setLocaleCookie } from "@/i18n/server";
import { requireUser } from "@/lib/auth/dal";
import { safeNext } from "@/lib/auth/redirect";
import type { ProfileFormState } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { profileValuesFromForm } from "@/lib/profile-form";
import { onboardingSchema } from "@/lib/validators";

export async function completeOnboarding(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await requireUser({ allowIncomplete: true });
  const values = profileValuesFromForm(formData);
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: await localizeFieldErrors(parsed.error.flatten().fieldErrors), values };

  // Lần đầu hoàn tất hồ sơ: ngôn ngữ giao diện theo tiếng mẹ đẻ (nếu được hỗ trợ), ngược lại en.
  // Gửi form lần hai (đã onboard) thì giữ nguyên lựa chọn hiện có của người dùng.
  const uiLanguage = user.onboarded ? undefined : uiLanguageFromNative(parsed.data.nativeLanguage);
  // Giữ nguyên onboardedAt nếu đã hoàn tất trước đó (gửi form hai lần).
  await db.user.update({
    where: { id: user.id },
    data: { ...parsed.data, ...(user.onboarded ? {} : { onboardedAt: new Date() }), ...(uiLanguage ? { uiLanguage } : {}) },
  });
  if (uiLanguage) await setLocaleCookie(uiLanguage);
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}
