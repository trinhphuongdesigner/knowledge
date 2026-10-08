import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { NotificationsContent } from "@/components/notifications/NotificationsContent";
import { NotificationListSkeleton } from "@/components/notifications/NotificationsSkeleton";
import { requireUser } from "@/lib/auth/dal";
import { Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT("notifications"))("metaTitle") };
}

export default async function NotificationsPage() {
  const [user, t, tc] = await Promise.all([requireUser(), getT("notifications"), getT("common")]);
  return (
    <Container className="max-w-2xl space-y-4 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("title")}</h1>
      <Suspense fallback={<NotificationListSkeleton />}>
        <NotificationsContent userId={user.id} />
      </Suspense>
    </Container>
  );
}
