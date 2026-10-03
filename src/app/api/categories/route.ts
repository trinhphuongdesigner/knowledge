import { requireApiUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { json, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Danh mục dùng chung — mọi user đều đọc được. Tạo/sửa/xoá nằm ở /api/admin/categories. */
export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    return json(await listCategories());
  } catch (e) {
    return serverError(e);
  }
}
