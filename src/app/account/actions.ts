"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import type { AccountFormState } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { getT, setLocaleCookie } from "@/i18n/server";
import { localizeFieldErrors } from "@/i18n/validation";
import { profileValuesFromForm } from "@/lib/profile-form";
import { parseUiLanguage } from "@/lib/ui-language";
import { updateProfileSchema } from "@/lib/validators";

export async function updateProfile(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser();
  const values = profileValuesFromForm(formData);
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: await localizeFieldErrors(parsed.error.flatten().fieldErrors), values };

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  const t = await getT("account");
  return { success: t("profile.updated"), values };
}

/** Đổi ngôn ngữ giao diện: lưu vào user, ghi cookie cho trang công khai, làm mới toàn bộ layout. */
export async function updateUiLanguage(value: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const locale = parseUiLanguage(value);
  if (!locale) return { ok: false, error: (await getT("account"))("uiLanguage.invalid") };

  await db.user.update({ where: { id: user.id }, data: { uiLanguage: locale } });
  await setLocaleCookie(locale);
  revalidatePath("/", "layout");
  return { ok: true };
}
