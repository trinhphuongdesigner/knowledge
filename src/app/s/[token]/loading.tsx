import { Container } from "@/components/layout/Container";
import { Card, Skeleton, SkeletonRegion, SkeletonText } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("common");
  return (
    <Container className="py-6 sm:py-8">
      <SkeletonRegion label={t("loading")}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-2/3 max-w-md" />
            <Skeleton className="mt-2 h-4 w-40" />
            <SkeletonText lines={2} className="mt-3 max-w-xl" />
          </div>
          <Skeleton className="h-11 w-full shrink-0 rounded-xl sm:w-36" />
        </div>
        <ol className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <Card>
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 size-7 shrink-0 rounded-full" />
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <Skeleton className="mb-2 h-3 w-16" />
                      <SkeletonText lines={2} />
                    </div>
                    <div className="min-w-0">
                      <Skeleton className="mb-2 h-3 w-16" />
                      <SkeletonText lines={2} />
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </SkeletonRegion>
    </Container>
  );
}
