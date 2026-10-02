import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NotificationList } from "@/components/notifications/NotificationList";
import { requireUser } from "@/lib/auth/dal";
import { listNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thông báo — Knowledge" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const page = await listNotifications(user.id);
  return (
    <Container className="max-w-2xl space-y-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-ink-900">Thông báo</h1>
      <NotificationList initialItems={page.items} initialCursor={page.nextCursor} initialUnread={page.unreadCount} />
    </Container>
  );
}
