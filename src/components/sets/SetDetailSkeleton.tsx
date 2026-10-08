import { Card, Skeleton, SkeletonRegion, SkeletonText } from "@/components/ui";

/** Khung giả của trang chi tiết bộ thẻ: breadcrumb, đầu trang, hàng nút, danh sách thẻ. */
export function SetDetailSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label}>
      <div className="mb-3 flex min-h-11 items-center sm:min-h-9">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="mb-8 flex flex-col gap-5">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <SkeletonText lines={2} className="mt-3 max-w-xl" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 rounded-xl sm:w-28" />
          ))}
        </div>
      </div>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
        <ul className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>
              <Card>
                <div className="flex items-start gap-3">
                  <Skeleton className="size-7 shrink-0 rounded-full" />
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </SkeletonRegion>
  );
}
