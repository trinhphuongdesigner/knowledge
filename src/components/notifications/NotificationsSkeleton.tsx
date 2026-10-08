import { Skeleton } from "@/components/ui";

/** Skeleton cho danh sách: nút "đánh dấu đã đọc" + khung chứa các dòng thông báo. */
export function NotificationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-36 rounded-xl" />
      </div>
      <div className="rounded-xl border border-ink-200 bg-surface p-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-3 min-h-11 rounded-lg px-3 py-2.5">
            <Skeleton className="mt-1.5 size-2.5 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton cho cả trang thông báo: breadcrumb, tiêu đề, danh sách. */
export function NotificationsPageSkeleton() {
  return (
    <>
      <div className="flex min-h-11 items-center sm:min-h-9">
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-48" />
      <NotificationListSkeleton />
    </>
  );
}
