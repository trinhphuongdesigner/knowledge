import { AdminChipsSkeleton, AdminHeaderSkeleton, AdminPagerSkeleton, AdminRegion, AdminTableSkeleton } from "@/components/admin/AdminSkeletons";

export default function Loading() {
  return (
    <AdminRegion className="space-y-6">
      <AdminHeaderSkeleton />
      <AdminChipsSkeleton />
      <AdminTableSkeleton rows={12} cols={4} />
      <AdminPagerSkeleton />
    </AdminRegion>
  );
}
