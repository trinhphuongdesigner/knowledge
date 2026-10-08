import type { ReactNode } from "react";
import { Card, Skeleton, SkeletonRegion } from "@/components/ui";
import { getT } from "@/i18n/server";

/** Vỏ SkeletonRegion có nhãn "đang tải" lấy từ namespace common (dùng cho loading.tsx và fallback Suspense). */
export async function AdminRegion({ className, children }: { className?: string; children: ReactNode }) {
  const t = await getT("common");
  return (
    <SkeletonRegion label={t("loading")} className={className}>
      {children}
    </SkeletonRegion>
  );
}

/** Breadcrumb + tiêu đề (+ dòng mô tả tuỳ chọn). */
export function AdminHeaderSkeleton({ desc = false }: { desc?: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-44" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        {desc && <Skeleton className="h-4 w-80 max-w-full" />}
      </div>
    </div>
  );
}

/** Lưới ô thống kê giống StatCard. */
export function AdminStatsSkeleton({ count = 7, className = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="p-3 sm:p-4">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-2 h-7 w-16" />
          <Skeleton className="mt-1.5 h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}

/** Card chứa tiêu đề + khối biểu đồ. */
export function AdminChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <Skeleton className="mb-3 h-5 w-40" />
      <Skeleton className="h-40 w-full" />
    </Card>
  );
}

/** Bảng giả: hàng tiêu đề + n hàng dữ liệu. */
export function AdminTableSkeleton({ rows = 8, cols = 4, withCard = true }: { rows?: number; cols?: number; withCard?: boolean }) {
  const table = (
    <div>
      <div className="flex gap-4 py-2">
        {Array.from({ length: cols }, (_, c) => (
          <Skeleton key={c} className="h-3.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 border-t border-ink-100 py-3">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={c === 0 ? "h-4 flex-[2]" : "h-4 flex-1"} />
          ))}
        </div>
      ))}
    </div>
  );
  return withCard ? <Card>{table}</Card> : table;
}

/** Danh sách dòng (tiêu đề + phụ đề, nút bên phải) trong Card. */
export function AdminListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <ul className="divide-y divide-ink-100">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-9 w-24" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Thanh phân trang giả. */
export function AdminPagerSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-9 w-24" />
    </div>
  );
}

/** Thanh lọc dạng chip (audit, quick links). */
export function AdminChipsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-7 w-20 rounded-full" />
      ))}
    </div>
  );
}

/** Trang admin mặc định: tiêu đề + một khối bảng. */
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <AdminHeaderSkeleton desc />
      <AdminTableSkeleton />
    </div>
  );
}

/** Phần thân dashboard (dưới tiêu đề). */
export function DashboardBodySkeleton() {
  return (
    <div className="space-y-6">
      <AdminStatsSkeleton />
      <AdminChipsSkeleton count={7} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminChartCardSkeleton />
        <AdminChartCardSkeleton />
      </div>
      <Card>
        <Skeleton className="mb-3 h-5 w-32" />
        <AdminTableSkeleton rows={5} cols={3} withCard={false} />
      </Card>
    </div>
  );
}

/** Form lọc giả cho trang users. */
export function AdminUsersFiltersSkeleton() {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 sm:w-40" />
        <Skeleton className="h-11 sm:w-40" />
        <Skeleton className="h-11 sm:w-24" />
      </div>
    </Card>
  );
}

/** Trang chi tiết user. */
export function AdminUserDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </Card>
      <AdminStatsSkeleton count={8} className="grid grid-cols-2 gap-3 sm:grid-cols-4" />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCardSkeleton />
        <AdminChartCardSkeleton />
      </div>
      <AdminListSkeleton rows={4} />
    </div>
  );
}

/** Trang system: 2 bảng lớn + 2 bảng nhỏ. */
export function AdminSystemSkeleton() {
  return (
    <div className="space-y-6">
      <AdminHeaderSkeleton />
      <Card>
        <Skeleton className="mb-3 h-5 w-32" />
        <AdminTableSkeleton rows={4} cols={4} withCard={false} />
      </Card>
      <Card>
        <Skeleton className="mb-2 h-5 w-40" />
        <Skeleton className="mb-3 h-4 w-48" />
        <AdminTableSkeleton rows={6} cols={2} withCard={false} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminTableSkeleton rows={4} cols={2} />
        <AdminTableSkeleton rows={4} cols={2} />
      </div>
    </div>
  );
}
