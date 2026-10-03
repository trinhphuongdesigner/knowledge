import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSameOrigin, safeNext } from "./redirect";
import { readSessionToken, validateSession } from "./session";
import type { SessionUser } from "./types";

export type { SessionUser };

/** The logged-in user for this request (null if anonymous). Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  return validateSession(await readSessionToken());
});

/** Đường dẫn + query của request hiện tại (proxy gắn vào header x-pathname), nếu biết. */
async function currentPath(): Promise<string | null> {
  const p = (await headers()).get("x-kn-path");
  return p && safeNext(p) === p ? p : null;
}

/**
 * For pages / server components: redirects to /login when anonymous, and to /welcome while the
 * profile is incomplete (only /welcome passes `allowIncomplete`).
 */
export async function requireUser(opts?: { allowIncomplete?: boolean }): Promise<SessionUser> {
  const user = await getCurrentUser();
  // Cookie present but session invalid/expired: proxy clears the cookie when it sees ?expired=1.
  if (!user) redirect((await readSessionToken()) ? "/login?expired=1" : "/login");
  if (!user.onboarded && !opts?.allowIncomplete) {
    const path = await currentPath();
    redirect(path && path !== "/" && !path.startsWith("/welcome") ? `/welcome?next=${encodeURIComponent(path)}` : "/welcome");
  }
  return user;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** For Route Handlers: returns the user, or a 401/403 Response the handler must `return` immediately. */
export async function requireApiUser(req: Request): Promise<SessionUser | Response> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!user.onboarded) return NextResponse.json({ error: "Vui lòng hoàn tất hồ sơ" }, { status: 403 });
  if (!SAFE_METHODS.has(req.method.toUpperCase())) {
    const h = await headers();
    if (!isSameOrigin(h.get("origin"), h.get("host"), h.get("x-forwarded-host"))) {
      return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 403 });
    }
  }
  return user;
}

/** For admin pages/layouts: non-admins get a 404 (as if the route did not exist). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}

/** For /api/admin/** handlers: non-admins (and anonymous callers) get a 404 Response the handler must `return`. */
export async function requireApiAdmin(req: Request): Promise<SessionUser | Response> {
  const current = await getCurrentUser();
  if (!current || current.role !== "ADMIN") return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return requireApiUser(req); // thêm kiểm tra onboarded + same-origin cho thao tác ghi
}
