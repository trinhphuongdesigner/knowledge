import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

/** Danh mục giờ dùng chung toàn hệ thống: admin quản lý ở /admin/categories, người khác quay về trang chủ. */
export default async function CategoriesPage() {
  const user = await requireUser();
  redirect(user.role === "ADMIN" ? "/admin/categories" : "/");
}
