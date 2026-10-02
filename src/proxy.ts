import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "kn_session";
const AUTH_PAGES = new Set(["/login", "/register"]);
const SESSION_MAX_AGE_S = 30 * 24 * 60 * 60;

/** Re-set the cookie (same value) so the browser-side expiry slides too. DB expiry stays the authority. */
function withSlidingCookie(req: NextRequest, res: NextResponse): NextResponse {
  const value = req.cookies.get(SESSION_COOKIE)?.value;
  if (value) {
    res.cookies.set(SESSION_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    });
  }
  return res;
}

/**
 * Optimistic auth check: looks ONLY at the presence of the session cookie (no DB).
 * The real validation happens in the DAL (src/lib/auth/dal.ts).
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasCookie = !!req.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/api/")) {
    if (!hasCookie) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    return withSlidingCookie(req, NextResponse.next());
  }

  if (AUTH_PAGES.has(pathname)) {
    if (hasCookie) {
      // requireUser() sends users with a stale/invalid cookie to /login?expired=1: clear it (no redirect loop).
      if (req.nextUrl.searchParams.get("expired") === "1") {
        const res = NextResponse.next();
        res.cookies.delete(SESSION_COOKIE);
        return res;
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return withSlidingCookie(req, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/|manifest\\.webmanifest|sw\\.js|offline\\.html|icon\\.svg|apple-icon\\.png|favicon\\.ico|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|xlsx|md|txt)$).*)"],
};
