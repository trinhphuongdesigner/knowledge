import { Container } from "@/components/layout/Container";
import {
  FiltersSkeleton,
  HomeHeaderSkeleton,
  SetListSkeleton,
  StatsRowSkeleton,
} from "@/components/home/HomeSkeleton";
import { SkeletonRegion } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("common");
  return (
    <Container className="py-6 sm:py-8">
      <SkeletonRegion label={t("loading")}>
        <HomeHeaderSkeleton />
        <StatsRowSkeleton />
        <div className="mb-6">
          <FiltersSkeleton />
        </div>
        <SetListSkeleton />
      </SkeletonRegion>
    </Container>
  );
}
