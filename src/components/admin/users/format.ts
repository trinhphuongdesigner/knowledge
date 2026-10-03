const TZ = "Asia/Ho_Chi_Minh";

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Ngày `@db.Date` (UTC 00:00) — không đổi múi giờ để khỏi lệch ngày. */
export function fmtDayOnly(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function displayName(u: { name: string | null; fullName: string | null; email: string }): string {
  return u.name || u.fullName || u.email.split("@")[0];
}
