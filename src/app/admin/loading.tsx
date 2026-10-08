import { AdminPageSkeleton, AdminRegion } from "@/components/admin/AdminSkeletons";

// Nằm trong admin layout nên AdminNav vẫn hiện; chỉ phần nội dung hiện skeleton.
export default function Loading() {
  return (
    <AdminRegion>
      <AdminPageSkeleton />
    </AdminRegion>
  );
}
