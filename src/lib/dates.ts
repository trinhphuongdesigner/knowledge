/** "Hôm nay" luôn tính theo giờ Việt Nam (UTC+7, không có DST). */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC 00:00 của ngày hiện tại theo giờ VN — dùng cho cột `@db.Date`. */
export function todayVN(now: Date = new Date()): Date {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}

/** Thời điểm thật lúc 00:00 giờ VN của hôm nay + `days` ngày (days = 1 → 0:00 ngày mai). */
export function startOfDayVN(now: Date = new Date(), days = 0): Date {
  return new Date(todayVN(now).getTime() - VN_OFFSET_MS + days * DAY_MS);
}

/** Cộng `days` ngày (có thể âm) vào một mốc thời gian. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** "YYYY-MM-DD" của phần ngày UTC (dùng cho giá trị `@db.Date`). */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Số ngày lịch (giờ VN) từ ngày của `from` đến ngày của `to`; âm nếu `to` sớm hơn. */
export function daysBetweenVN(from: Date, to: Date): number {
  return Math.round((todayVN(to).getTime() - todayVN(from).getTime()) / DAY_MS);
}
