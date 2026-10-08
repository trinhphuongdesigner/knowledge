import { Card, Skeleton } from "@/components/ui";

/** Skeleton cho khối streak/ôn tập (cùng khung Card với DueTodayCard / StreakCard). */
export function StatCardSkeleton() {
  return (
    <Card className="flex items-center gap-3">
      <Skeleton className="size-12 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56 max-w-full" />
      </div>
    </Card>
  );
}

/** Hàng thẻ thống kê: 1 cột trên mobile, 2 cột từ md. */
export function StatsRowSkeleton() {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

/** Skeleton cho thanh lọc (tab danh mục + ô tìm kiếm + chọn level). */
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-hidden pb-1">
        {[20, 24, 28, 20, 24].map((w, i) => (
          <Skeleton key={i} className="h-11 shrink-0 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Skeleton className="h-11 w-full rounded-xl md:max-w-sm md:flex-1" />
        <Skeleton className="h-11 w-full rounded-xl md:w-48" />
        <Skeleton className="h-11 w-full rounded-xl md:ml-auto md:w-36" />
      </div>
    </div>
  );
}

/** Một thẻ bộ học giả, cao gần bằng SetCard thật. */
export function SetCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="mt-auto pt-1">
        <Skeleton className="mb-1.5 h-3 w-24" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </Card>
  );
}

/** Lưới bộ học (giữ nguyên breakpoint với trang thật). */
export function SetGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SetCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Phần danh sách bộ (tầng 2): tiêu đề nhóm + lưới. */
export function SetListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <SetGridSkeleton />
    </div>
  );
}

/** Header chào + nút tạo bộ (khớp khung header của trang chủ). */
export function HomeHeaderSkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-9 w-72 max-w-full sm:h-10 sm:w-96" />
        <Skeleton className="mt-3 h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full shrink-0 rounded-xl sm:w-36" />
    </div>
  );
}
