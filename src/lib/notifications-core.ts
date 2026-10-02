// Logic thuần cho thông báo (không import "@/…" để vitest chạy được).

export type PushPayload = { title: string; body: string; href: string; tag: string };

export const NOTIFICATIONS_PAGE_SIZE = 20;
export const UNREAD_BADGE_MAX = 9;

/** Chỉ cho phép đường dẫn tương đối trong app ("/…", không phải "//host"); còn lại về "/". */
export function safeHref(href: string): string {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\") ? href : "/";
}

/** Payload JSON gửi cho service worker; cắt độ dài để vừa giới hạn ~4KB của Web Push. */
export function buildPushPayload(input: { title: string; body: string; href: string; tag?: string }): PushPayload {
  const href = safeHref(input.href);
  return {
    title: input.title.slice(0, 120),
    body: input.body.slice(0, 300),
    href,
    tag: input.tag || href,
  };
}

/** Push service báo subscription đã hết hạn/bị huỷ (cần xoá khỏi DB). */
export function isGonePushStatus(status: unknown): boolean {
  return status === 404 || status === 410;
}

/** Nhãn huy hiệu chuông: ẩn khi 0, "9+" khi vượt 9. */
export function badgeLabel(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > UNREAD_BADGE_MAX ? `${UNREAD_BADGE_MAX}+` : String(Math.floor(count));
}

/** Thời gian tương đối bằng tiếng Việt ("vừa xong", "5 phút trước", "2 ngày trước"…). */
export function relativeTimeVi(date: Date | string | number, now: Date | number = Date.now()): string {
  const diff = Math.max(0, new Date(now).getTime() - new Date(date).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** Chuyển Uint8Array<->base64url cho VAPID public key (applicationServerKey). */
export function urlBase64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export const READ_NOTIFICATION_RETENTION_DAYS = 30;
export const NOTIFICATION_RETENTION_DAYS = 90;

/** Mốc dọn dẹp: thông báo đã đọc > 30 ngày, mọi thông báo > 90 ngày. */
export function notificationCutoffs(now: Date): { read: Date; all: Date } {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return {
    read: new Date(now.getTime() - READ_NOTIFICATION_RETENTION_DAYS * DAY_MS),
    all: new Date(now.getTime() - NOTIFICATION_RETENTION_DAYS * DAY_MS),
  };
}
