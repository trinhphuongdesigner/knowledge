import { Container } from "@/components/layout/Container";
import { NotificationsPageSkeleton } from "@/components/notifications/NotificationsSkeleton";
import { SkeletonRegion } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("common");
  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <SkeletonRegion label={t("loading")} className="space-y-4">
        <NotificationsPageSkeleton />
      </SkeletonRegion>
    </Container>
  );
}
