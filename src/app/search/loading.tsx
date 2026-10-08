import { Container } from "@/components/layout/Container";
import { SearchPageSkeleton } from "@/components/search/SearchSkeleton";
import { SkeletonRegion } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("common");
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <SkeletonRegion label={t("loading")} className="space-y-6">
        <SearchPageSkeleton />
      </SkeletonRegion>
    </Container>
  );
}
