import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isSameOrigin } from "./redirect";
import { readSessionToken, validateSession } from "./session";
import type { SessionUser } from "./types";

export type { SessionUser };

/** The logged-in user for this request (null if anonymous). Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  return validateSession(await readSessionToken());
});

/** For pages / server components: redirects to /login when anonymous. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  // Cookie present but session invalid/expired: proxy clears the cookie when it sees ?expired=1.
  if (!user) redirect((await readSessionToken()) ? "/login?expired=1" : "/login");
  return user;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** For Route Handlers: returns the user, or a 401/403 Response the handler must `return` immediately. */
export async function requireApiUser(req: Request): Promise<SessionUser | Response> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!SAFE_METHODS.has(req.method.toUpperCase())) {
    const h = await headers();
    if (!isSameOrigin(h.get("origin"), h.get("host"), h.get("x-forwarded-host"))) {
      return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 403 });
    }
  }
  return user;
}
