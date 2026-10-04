import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NotificationList } from "@/components/notifications/NotificationList";
import { requireUser } from "@/lib/auth/dal";
import { listNotifications } from "@/lib/notifications";
import { Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT("notifications"))("metaTitle") };
}

export default async function NotificationsPage() {
  const [user, t, tc] = await Promise.all([requireUser(), getT("notifications"), getT("common")]);
  const page = await listNotifications(user.id);
  return (
    <Container className="max-w-2xl space-y-4 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("title")}</h1>
      <NotificationList initialItems={page.items} initialCursor={page.nextCursor} initialUnread={page.unreadCount} />
    </Container>
  );
}
