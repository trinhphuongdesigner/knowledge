import "server-only";
import webpush from "web-push";
import type { NotificationType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { buildPushPayload, isGonePushStatus, type PushPayload } from "@/lib/notifications-core";

const PUSH_TIMEOUT_MS = 5_000;
const PUSH_TTL_S = 24 * 60 * 60;

export type NotifyInput = { type: NotificationType; title: string; body: string; href: string };

let vapidReady: boolean | undefined;

/** Cấu hình VAPID một lần; thiếu key → false (log 1 lần), không bao giờ ném lỗi. */
function ensureVapid(): boolean {
  if (vapidReady !== undefined) return vapidReady;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    console.info("[push] thiếu NEXT_PUBLIC_VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY — bỏ qua gửi push (thông báo vẫn được lưu).");
    return (vapidReady = false);
  }
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", pub, priv);
    return (vapidReady = true);
  } catch (e) {
    console.error("[push] VAPID key không hợp lệ", e);
    return (vapidReady = false);
  }
}

/** Gửi payload tới mọi thiết bị của user; 404/410 → xoá subscription. Không ném lỗi. */
async function deliver(userId: string, payload: PushPayload): Promise<number> {
  try {
    if (!ensureVapid()) return 0;
    const subs = await db.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return 0;
    const body = JSON.stringify(payload);
    const results = await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
            TTL: PUSH_TTL_S,
            timeout: PUSH_TIMEOUT_MS,
          });
          return { id: s.id, ok: true, gone: false };
        } catch (e) {
          const gone = isGonePushStatus((e as { statusCode?: number }).statusCode);
          if (!gone) console.error("[push] gửi thất bại", (e as { statusCode?: number }).statusCode ?? (e as Error).message);
          return { id: s.id, ok: false, gone };
        }
      }),
    );
    const goneIds = results.filter((r) => r.gone).map((r) => r.id);
    const okIds = results.filter((r) => r.ok).map((r) => r.id);
    if (goneIds.length) await db.pushSubscription.deleteMany({ where: { id: { in: goneIds } } });
    if (okIds.length) await db.pushSubscription.updateMany({ where: { id: { in: okIds } }, data: { lastUsedAt: new Date() } });
    return okIds.length;
  } catch (e) {
    console.error("[push] lỗi không mong đợi", e);
    return 0;
  }
}

/** Lưu thông báo trong app VÀ đẩy tới các thiết bị của user. Lỗi push không ảnh hưởng người gọi. */
export async function notify(userId: string, input: NotifyInput): Promise<void> {
  try {
    await db.notification.create({ data: { userId, ...input } });
  } catch (e) {
    console.error("[notify] không lưu được thông báo", e);
    return;
  }
  await deliver(userId, buildPushPayload({ ...input, tag: input.type === "REVIEW_REMINDER" ? "review-reminder" : input.href }));
}

/** Chỉ đẩy, KHÔNG lưu. Trả số thiết bị đã gửi được. */
export async function sendPushOnly(userId: string, payload: { title: string; body: string; href: string; tag?: string }): Promise<number> {
  return deliver(userId, buildPushPayload(payload));
}
