"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { sendPushOnly } from "@/lib/notify";
import { hashPassword, verifyDummyPassword, verifyPassword } from "@/lib/auth/password";
import {
  RATE_LIMIT_MESSAGE,
  checkLoginAllowed,
  checkRegisterAllowed,
  checkResetAllowed,
  getClientIp,
  recordLoginAttempt,
  recordRegisterAttempt,
  recordResetRequest,
} from "@/lib/auth/rate-limit";
import { isResetTokenUsable } from "@/lib/auth/reset";
import { createResetLink } from "@/lib/auth/reset-link";
import { hashToken } from "@/lib/auth/token";
import { safeNext } from "@/lib/auth/redirect";
import { clearSessionCookie, createSession, deleteSession, readSessionToken } from "@/lib/auth/session";
import type { AuthFormState, ResetFormState } from "@/lib/auth/types";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validators";

const GENERIC_LOGIN_ERROR = "Email hoặc mật khẩu không đúng";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const rawEmail = str(formData.get("email"));
  const values = { email: rawEmail.trim() };
  const parsed = loginSchema.safeParse({ email: rawEmail, password: str(formData.get("password")) });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }
  const { email, password } = parsed.data;
  const h = await headers();
  const ip = getClientIp(h);

  if (!(await checkLoginAllowed(email, ip))) return { error: RATE_LIMIT_MESSAGE, values };

  const user = await db.user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(password, user.passwordHash) : await verifyDummyPassword(password);
  await recordLoginAttempt(email, ip, ok);
  if (!user || !ok) return { error: GENERIC_LOGIN_ERROR, values };

  await createSession(user.id, h.get("user-agent"));
  redirect(safeNext(formData.get("next")));
}

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const rawEmail = str(formData.get("email"));
  const values = { email: rawEmail.trim(), name: str(formData.get("name")).trim() };
  if (process.env.ALLOW_REGISTRATION === "false") {
    return { error: "Đăng ký hiện đã bị tắt", values };
  }
  const parsed = registerSchema.safeParse({
    name: str(formData.get("name")),
    email: rawEmail,
    password: str(formData.get("password")),
    confirmPassword: str(formData.get("confirmPassword")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }
  const { name, email, password } = parsed.data;
  const h = await headers();
  const ip = getClientIp(h);

  if (!(await checkRegisterAllowed(ip))) return { error: RATE_LIMIT_MESSAGE, values };
  await recordRegisterAttempt(ip);

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: ["Email này đã được đăng ký"] }, values };

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await hashPassword(password),
        categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c })) },
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (e) {
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002") {
      return { fieldErrors: { email: ["Email này đã được đăng ký"] }, values };
    }
    throw e;
  }

  await createSession(userId, h.get("user-agent"));
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession(await readSessionToken());
  await clearSessionCookie();
  redirect("/login");
}

const FORGOT_MESSAGE =
  "Nếu email tồn tại và đã bật thông báo, link đặt lại mật khẩu sẽ được gửi tới thiết bị của bạn dưới dạng thông báo đẩy";

/** Luôn trả cùng một thông báo (không lộ email có tồn tại hay không); link gửi bằng thông báo đẩy sau khi phản hồi. */
export async function requestPasswordReset(_prev: ResetFormState, formData: FormData): Promise<ResetFormState> {
  const rawEmail = str(formData.get("email"));
  const parsed = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values: { email: rawEmail.trim() } };
  }
  const { email } = parsed.data;
  const ip = getClientIp(await headers());
  const done: ResetFormState = { success: FORGOT_MESSAGE };

  // Vượt giới hạn: vẫn trả thông báo chung, chỉ không gửi gì.
  if (!(await checkResetAllowed(email, ip))) return done;
  await recordResetRequest(email, ip);

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return done;

  const { path } = await createResetLink(user.id);
  // Link chỉ đi qua thông báo đẩy tới thiết bị đã đăng ký, KHÔNG lưu vào trung tâm thông báo.
  after(async () => {
    await sendPushOnly(user.id, {
      title: "Đặt lại mật khẩu",
      body: "Chạm để mở liên kết đặt lại mật khẩu (hiệu lực 30 phút, dùng một lần). Nếu không phải bạn yêu cầu, hãy bỏ qua.",
      href: path,
      tag: "password-reset",
    });
  });
  return done;
}

const INVALID_LINK = "Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.";

export async function resetPassword(_prev: ResetFormState, formData: FormData): Promise<ResetFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: str(formData.get("token")),
    password: str(formData.get("password")),
    confirmPassword: str(formData.get("confirmPassword")),
  });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return fe.token ? { error: INVALID_LINK } : { fieldErrors: fe };
  }
  const { token, password } = parsed.data;
  const id = hashToken(token);
  const row = await db.passwordResetToken.findUnique({ where: { id } });
  if (!row || !isResetTokenUsable(row)) return { error: INVALID_LINK };

  const passwordHash = await hashPassword(password);
  const ok = await db.$transaction(async (tx) => {
    // Dùng một lần: chỉ một request thắng khi tranh chấp.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (claimed.count !== 1) return false;
    await tx.user.update({ where: { id: row.userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({ where: { userId: row.userId, id: { not: id } } });
    await tx.session.deleteMany({ where: { userId: row.userId } });
    return true;
  });
  if (!ok) return { error: INVALID_LINK };

  // Cookie của thiết bị này (nếu có) đã trỏ tới session vừa bị xoá.
  await clearSessionCookie();
  redirect("/login?reset=1");
}
