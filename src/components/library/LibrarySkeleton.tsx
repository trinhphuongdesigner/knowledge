import { Container } from "@/components/layout/Container";
import { Card, Skeleton, SkeletonRegion, SkeletonText } from "@/components/ui";

/** Lưới thẻ bộ từ giả, cùng cột/breakpoint với lưới thật. */
function LibraryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Card className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <SkeletonText lines={2} />
            <Skeleton className="mt-auto h-3.5 w-2/3" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </Card>
        </li>
      ))}
    </ul>
  );
}

/** Skeleton cho phần danh sách (tier 2) khi lọc/chuyển trang. */
export function LibraryListSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label}>
      <LibraryGridSkeleton />
    </SkeletonRegion>
  );
}

/** Ô chọn danh mục giả trong form tìm kiếm. */
export function CategorySelectSkeleton() {
  return <Skeleton aria-hidden className="min-h-11 rounded-xl sm:w-44" />;
}

/** Skeleton toàn trang cho /library (tier 1). */
export function LibraryPageSkeleton({ label }: { label: string }) {
  return (
    <Container className="py-6 sm:py-8">
      <SkeletonRegion label={label}>
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <Skeleton className="min-h-11 flex-1 rounded-xl" />
          <Skeleton className="min-h-11 rounded-xl sm:w-44" />
          <Skeleton className="min-h-11 rounded-xl sm:w-24" />
        </div>
        <LibraryGridSkeleton />
      </SkeletonRegion>
    </Container>
  );
}
