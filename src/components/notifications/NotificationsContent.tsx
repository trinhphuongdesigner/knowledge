import { listNotifications } from "@/lib/notifications";
import { NotificationList } from "./NotificationList";

/** Tải trang thông báo đầu tiên (tầng 2) để tiêu đề hiện ngay trong khi chờ DB. */
export async function NotificationsContent({ userId }: { userId: string }) {
  const page = await listNotifications(userId);
  return <NotificationList initialItems={page.items} initialCursor={page.nextCursor} initialUnread={page.unreadCount} />;
}
