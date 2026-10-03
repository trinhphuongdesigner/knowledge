"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import type { AccountFormState } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validators";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function updateProfile(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser();
  const values = {
    name: str(formData.get("name")).trim(),
    fullName: str(formData.get("fullName")).trim(),
    birthYear: str(formData.get("birthYear")).trim(),
    nativeLanguage: str(formData.get("nativeLanguage")),
  };
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  return { success: "Đã cập nhật thông tin tài khoản", values };
}
