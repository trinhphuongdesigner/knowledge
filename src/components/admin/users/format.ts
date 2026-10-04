import type { Locale } from "@/i18n/config";
import { formatDate } from "@/i18n/format";

const TZ = "Asia/Ho_Chi_Minh";

type D = Date | string | null | undefined;

export function fmtDate(locale: Locale, d: D): string {
  if (!d) return "—";
  return formatDate(locale, d, { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateTime(locale: Locale, d: D): string {
  if (!d) return "—";
  return formatDate(locale, d, {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Ngày `@db.Date` (UTC 00:00) — không đổi múi giờ để khỏi lệch ngày. */
export function fmtDayOnly(locale: Locale, d: D): string {
  if (!d) return "—";
  return formatDate(locale, d, { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function displayName(u: { name: string | null; fullName: string | null; email: string }): string {
  return u.name || u.fullName || u.email.split("@")[0];
}
