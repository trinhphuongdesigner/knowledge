import { Card, Skeleton, SkeletonRegion } from "@/components/ui";

/** Khung giả của trang nhập thẻ: bước 1 (chọn nguồn) của ImportWizard. */
export function ImportSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label}>
      <div className="mb-3 flex min-h-11 items-center sm:min-h-9">
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="mb-6 h-9 w-2/3 max-w-md" />
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <span className="mx-1 h-px w-6 bg-ink-200" aria-hidden />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Card className="space-y-5">
          <Skeleton className="h-[3.75rem] rounded-xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
          <div className="space-y-3 border-t border-ink-200 pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-11 w-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </Card>
      </div>
    </SkeletonRegion>
  );
}
