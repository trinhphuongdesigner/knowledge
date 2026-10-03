"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

  // Giữ nguyên onboardedAt nếu đã hoàn tất trước đó (gửi form hai lần).
  await db.user.update({
    where: { id: user.id },
    data: { ...parsed.data, ...(user.onboarded ? {} : { onboardedAt: new Date() }) },
  });
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}
