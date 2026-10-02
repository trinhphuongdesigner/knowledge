import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { roleForEmail } from "./admin";
import { generateToken, hashToken, SESSION_TTL_MS, shouldRefreshSession } from "./token";
import { SESSION_COOKIE, type SessionUser } from "./types";

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Creates a brand-new session row + cookie (never reuses an existing one). */
export async function createSession(userId: string, userAgent?: string | null): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { id: hashToken(token), userId, expiresAt, userAgent: userAgent?.slice(0, 300) || null },
  });
  await setSessionCookie(token, expiresAt);
}

/** Returns the user for a valid token, or null if missing/expired. Slides expiry when < 15 days remain. */
export async function validateSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const id = hashToken(token);
  const session = await db.session.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id } }).catch(() => undefined);
    return null;
  }
  if (shouldRefreshSession(session.expiresAt)) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.session.update({ where: { id }, data: { expiresAt } }).catch(() => undefined);
    // Cookies are only writable in Actions/Route Handlers; during render this throws, which is fine
    // (the DB row is already extended; the cookie is refreshed on the next write-capable request).
    await setSessionCookie(token, expiresAt).catch(() => undefined);
  }
  // Role luôn suy ra từ email: chỉ đúng một tài khoản là admin, không tin cột `role` trong DB.
  return { ...session.user, role: roleForEmail(session.user.email) };
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await db.session.delete({ where: { id: hashToken(token) } }).catch(() => undefined);
}

/** Deletes every session of the user except the one for `currentToken`. */
export async function deleteOtherSessions(userId: string, currentToken: string | undefined): Promise<void> {
  await db.session.deleteMany({
    where: { userId, ...(currentToken ? { id: { not: hashToken(currentToken) } } : {}) },
  });
}
