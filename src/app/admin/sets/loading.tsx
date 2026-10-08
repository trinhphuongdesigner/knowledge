import { AdminHeaderSkeleton, AdminListSkeleton, AdminRegion } from "@/components/admin/AdminSkeletons";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <AdminRegion className="space-y-4">
      <AdminHeaderSkeleton />
      <div className="flex gap-1 border-b border-ink-200">
        <Skeleton className="mx-4 my-3 h-5 w-28" />
        <Skeleton className="mx-4 my-3 h-5 w-28" />
      </div>
      <AdminListSkeleton rows={6} />
    </AdminRegion>
  );
}
