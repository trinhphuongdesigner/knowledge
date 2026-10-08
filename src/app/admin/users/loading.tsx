import { AdminHeaderSkeleton, AdminRegion, AdminTableSkeleton, AdminUsersFiltersSkeleton } from "@/components/admin/AdminSkeletons";

export default function Loading() {
  return (
    <AdminRegion className="flex flex-col gap-4">
      <AdminHeaderSkeleton desc />
      <AdminUsersFiltersSkeleton />
      <AdminTableSkeleton rows={10} cols={7} />
    </AdminRegion>
  );
}
