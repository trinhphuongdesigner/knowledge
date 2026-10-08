import { Card, Skeleton, SkeletonRegion } from "@/components/ui";

/** Khung giả của trang sửa bộ thẻ: tiêu đề, form (4 trường + nút) và khu vực xoá. */
export function SetEditSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label}>
      <div className="mb-3 flex min-h-11 items-center sm:min-h-9">
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="mb-6 h-8 w-48" />
      <Card>
        <div className="flex flex-col gap-4">
          {[44, 112, 44, 44].map((h, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="rounded-xl" style={{ height: h }} />
            </div>
          ))}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Skeleton className="h-11 rounded-xl sm:w-24" />
            <Skeleton className="h-11 rounded-xl sm:w-36" />
          </div>
        </div>
      </Card>
      <Card className="mt-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mb-4 mt-2 h-4 w-3/4" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </Card>
    </SkeletonRegion>
  );
}
