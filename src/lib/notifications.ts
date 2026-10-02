import "server-only";
import { db } from "@/lib/db";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/notifications-core";
import type { NotificationDTO, NotificationsPageDTO } from "@/lib/validators";

/** Trang thông báo mới nhất của user (cursor = id của mục cuối trang trước) kèm số chưa đọc. */
export async function listNotifications(userId: string, cursor?: string | null): Promise<NotificationsPageDTO> {
  const [rows, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: NOTIFICATIONS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);
  const page = rows.slice(0, NOTIFICATIONS_PAGE_SIZE);
  const items: NotificationDTO[] = page.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }));
  return { items, nextCursor: rows.length > NOTIFICATIONS_PAGE_SIZE ? page[page.length - 1].id : null, unreadCount };
}
