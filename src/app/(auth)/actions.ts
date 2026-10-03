"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { verifyFirebaseIdToken, type GoogleIdentity } from "@/lib/auth/google";
import {
  INVALID_TOKEN_MARKER,
  RATE_LIMIT_MESSAGE,
  checkLoginAllowed,
  getClientIp,
  recordLoginAttempt,
} from "@/lib/auth/rate-limit";
import { safeNext } from "@/lib/auth/redirect";
import { sanitizePictureUrl } from "@/lib/profile";
import { clearSessionCookie, createSession, deleteSession, readSessionToken } from "@/lib/auth/session";

const GENERIC_ERROR = "Không thể đăng nhập bằng Google. Vui lòng thử lại.";
const CLOSED_ERROR = "Hiện không nhận tài khoản mới";

const isUniqueViolation = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";

type UserRow = { id: string; firebaseUid: string | null; onboardedAt: Date | null; avatarUrl: string | null };
const userSelect = { id: true, firebaseUid: true, onboardedAt: true, avatarUrl: true } as const;

async function createUser(identity: GoogleIdentity, withUid: boolean): Promise<UserRow> {
  return db.user.create({
    data: {
      email: identity.email,
      name: identity.name?.slice(0, 40) || null,
      avatarUrl: sanitizePictureUrl(identity.picture),
      ...(withUid ? { firebaseUid: identity.uid } : {}),
      categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c })) },
    },
    select: userSelect,
  });
}

/** Tìm theo email (khoá định danh) hoặc tạo mới; xử lý tranh chấp P2002 bằng cách đọc lại. */
async function findOrCreateUser(identity: GoogleIdentity): Promise<UserRow | null> {
  const existing = await db.user.findUnique({ where: { email: identity.email }, select: userSelect });
  if (existing) return existing;
  if (process.env.ALLOW_REGISTRATION === "false") return null;
  try {
    return await createUser(identity, true);
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    const raced = await db.user.findUnique({ where: { email: identity.email }, select: userSelect });
    if (raced) return raced;
    // Trùng firebaseUid với tài khoản khác (đổi email phía Google): vẫn tạo theo email, bỏ qua uid.
    return createUser(identity, false);
  }
}

/** Đăng nhập bằng Firebase ID token (Google). Thành công thì redirect; lỗi thì trả { error }. */
export async function signInWithGoogle(idToken: string, next?: string): Promise<{ error: string } | void> {
  if (typeof idToken !== "string" || idToken.length === 0 || idToken.length > 8192) return { error: GENERIC_ERROR };
  const h = await headers();
  const ip = getClientIp(h);

  if (!(await checkLoginAllowed(null, ip))) return { error: RATE_LIMIT_MESSAGE };

  let identity: GoogleIdentity;
  try {
    identity = await verifyFirebaseIdToken(idToken);
  } catch (e) {
    console.error("[auth] token Google không hợp lệ:", e instanceof Error ? e.message : e);
    await recordLoginAttempt(INVALID_TOKEN_MARKER, ip, false).catch(() => undefined);
    return { error: GENERIC_ERROR };
  }

  if (!(await checkLoginAllowed(identity.email, ip))) return { error: RATE_LIMIT_MESSAGE };

  const user = await findOrCreateUser(identity);
  if (!user) return { error: CLOSED_ERROR };

  if (user.firebaseUid !== identity.uid) {
    // Chỉ là thông tin tham khảo: trùng uid với tài khoản khác thì bỏ qua.
    await db.user.update({ where: { id: user.id }, data: { firebaseUid: identity.uid } }).catch((e) => {
      if (!isUniqueViolation(e)) throw e;
    });
  }

  // Làm mới ảnh Google nếu đổi (không đụng tới tên/họ tên người dùng đã sửa).
  const picture = sanitizePictureUrl(identity.picture);
  if (picture && picture !== user.avatarUrl) {
    await db.user.update({ where: { id: user.id }, data: { avatarUrl: picture } }).catch((e) => {
      console.error("[auth] không cập nhật được ảnh đại diện:", e instanceof Error ? e.message : e);
    });
  }

  await recordLoginAttempt(identity.email, ip, true);
  await createSession(user.id, h.get("user-agent"));

  const dest = safeNext(next);
  if (!user.onboardedAt) redirect(dest === "/" ? "/welcome" : `/welcome?next=${encodeURIComponent(dest)}`);
  redirect(dest);
}

export async function logout(): Promise<void> {
  await deleteSession(await readSessionToken());
  await clearSessionCookie();
  redirect("/login");
}
