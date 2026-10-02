"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyDummyPassword, verifyPassword } from "@/lib/auth/password";
import {
  RATE_LIMIT_MESSAGE,
  checkLoginAllowed,
  checkRegisterAllowed,
  getClientIp,
  recordLoginAttempt,
  recordRegisterAttempt,
} from "@/lib/auth/rate-limit";
import { safeNext } from "@/lib/auth/redirect";
import { clearSessionCookie, createSession, deleteSession, readSessionToken } from "@/lib/auth/session";
import type { AuthFormState } from "@/lib/auth/types";
import { loginSchema, registerSchema } from "@/lib/validators";

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
      data: { email, name: name || null, passwordHash: await hashPassword(password) },
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
