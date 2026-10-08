import { Card, Skeleton } from "@/components/ui";

/** Skeleton cho phần kết quả: dòng đếm + vài nhóm bộ, mỗi nhóm có vài thẻ khớp. */
export function SearchResultsSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-56 max-w-full" />
      <div className="space-y-4">
        {[3, 2, 2].map((rows, g) => (
          <Card key={g} className="space-y-3">
            <Skeleton className="h-5 w-48 max-w-full" />
            <div className="divide-y divide-ink-100">
              {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="space-y-1.5 py-2 first:pt-0 last:pb-0">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/** Skeleton cho cả trang: breadcrumb, tiêu đề, ô tìm kiếm, kết quả. */
export function SearchPageSkeleton() {
  return (
    <>
      <div className="flex min-h-11 items-center sm:min-h-9">
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <SearchResultsSkeleton />
    </>
  );
}
