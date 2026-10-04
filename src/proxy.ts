import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n/config";
import en from "@/i18n/messages/en/errors";
import vi from "@/i18n/messages/vi/errors";
import zh from "@/i18n/messages/zh/errors";
import ja from "@/i18n/messages/ja/errors";
import ko from "@/i18n/messages/ko/errors";
import ru from "@/i18n/messages/ru/errors";
import fr from "@/i18n/messages/fr/errors";
import th from "@/i18n/messages/th/errors";

/** Chỉ namespace `errors` (nhẹ) — proxy chạy trước DAL nên đọc cookie kn_locale. */
const ERRORS: Record<string, { notSignedIn?: string }> = { en, vi, zh, ja, ko, ru, fr, th };

function notSignedInMessage(req: NextRequest): string {
  const c = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(c) ? c : DEFAULT_LOCALE;
  return ERRORS[locale]?.notSignedIn || en.notSignedIn;
}

const SESSION_COOKIE = "kn_session";
const AUTH_PAGES = new Set(["/login"]);
const PUBLIC_PAGES = new Set(["/about", "/privacy", "/terms"]);
/** Header nội bộ để Server Components biết đường dẫn hiện tại (dùng cho /welcome?next=). */
const PATH_HEADER = "x-kn-path";
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

  // Vercel Cron has no session cookie; the route authenticates itself with CRON_SECRET.
  if (pathname.startsWith("/api/cron/")) return NextResponse.next();

  // Public share links (viewable anonymously): pages /s/<token> and API /api/share/*.
  // Trang giới thiệu + chính sách quyền riêng tư / điều khoản: ai cũng xem được (Google OAuth yêu cầu công khai).
  if (PUBLIC_PAGES.has(pathname)) return NextResponse.next();

  if (pathname.startsWith("/s/") || pathname.startsWith("/api/share/")) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    if (!hasCookie) return NextResponse.json({ error: notSignedInMessage(req) }, { status: 401 });
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
  // Không tin giá trị do client gửi: luôn ghi đè header đường dẫn.
  const headers = new Headers(req.headers);
  const sp = new URLSearchParams(search);
  sp.delete("_rsc");
  const qs = sp.toString();
  headers.set(PATH_HEADER, pathname + (qs ? `?${qs}` : ""));
  return withSlidingCookie(req, NextResponse.next({ request: { headers } }));
}

export const config = {
  matcher: ["/((?!_next/|__/|manifest\\.webmanifest|sw\\.js|offline\\.html|icon\\.svg|apple-icon\\.png|favicon\\.ico|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|xlsx|md|txt)$).*)"],
};
