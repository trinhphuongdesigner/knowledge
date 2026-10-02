"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { roleForEmail } from "@/lib/auth/admin";
import { requireUser } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { RATE_LIMIT_MESSAGE, checkLoginAllowed, getClientIp, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { deleteOtherSessions, readSessionToken } from "@/lib/auth/session";
import type { AccountFormState } from "@/lib/auth/types";
import { changePasswordSchema, updateProfileSchema } from "@/lib/validators";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const WRONG_CURRENT = "Mật khẩu hiện tại không đúng";
const EMAIL_TAKEN = "Email này đã được đăng ký";

/** Verifies the current password with rate limiting; returns an error message or null when OK. */
async function checkCurrentPassword(email: string, password: string, hash: string): Promise<string | null> {
  const ip = getClientIp(await headers());
  if (!(await checkLoginAllowed(email, ip))) return RATE_LIMIT_MESSAGE;
  const ok = await verifyPassword(password, hash);
  await recordLoginAttempt(email, ip, ok);
  return ok ? null : WRONG_CURRENT;
}

export async function updateProfile(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser();
  const values = { name: str(formData.get("name")).trim(), email: str(formData.get("email")).trim() };
  const parsed = updateProfileSchema.safeParse({
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    currentPassword: str(formData.get("currentPassword")),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  const { name, email, currentPassword } = parsed.data;

  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record) return { error: "Không tìm thấy tài khoản", values };

  if (email !== user.email) {
    if (!currentPassword) {
      return { fieldErrors: { currentPassword: ["Nhập mật khẩu hiện tại để đổi email"] }, values };
    }
    const err = await checkCurrentPassword(user.email, currentPassword, record.passwordHash);
    if (err === WRONG_CURRENT) return { fieldErrors: { currentPassword: [err] }, values };
    if (err) return { error: err, values };
    if (roleForEmail(email) === "ADMIN") return { fieldErrors: { email: [EMAIL_TAKEN] }, values };
    const taken = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (taken) return { fieldErrors: { email: [EMAIL_TAKEN] }, values };
  }

  try {
    await db.user.update({ where: { id: user.id }, data: { name: name || null, email } });
  } catch (e) {
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002") {
      return { fieldErrors: { email: [EMAIL_TAKEN] }, values };
    }
    throw e;
  }
  revalidatePath("/", "layout");
  return { success: "Đã cập nhật thông tin tài khoản", values: { name, email } };
}

export async function changePassword(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: str(formData.get("currentPassword")),
    newPassword: str(formData.get("newPassword")),
    confirmPassword: str(formData.get("confirmPassword")),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { currentPassword, newPassword } = parsed.data;

  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record) return { error: "Không tìm thấy tài khoản" };

  const err = await checkCurrentPassword(user.email, currentPassword, record.passwordHash);
  if (err === WRONG_CURRENT) return { fieldErrors: { currentPassword: [err] } };
  if (err) return { error: err };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  await deleteOtherSessions(user.id, await readSessionToken());
  revalidatePath("/account");
  return { success: "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất." };
}
