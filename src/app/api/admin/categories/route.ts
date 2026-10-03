import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { findDuplicateCategory } from "@/lib/categories";
import { toCategoryDTO } from "@/lib/dto";
import { json, readJson, serverError, validationError } from "@/lib/http";
import { categoryInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** Admin tạo danh mục dùng chung (xếp cuối danh sách). Trùng tên (không phân biệt hoa/thường) → 409. */
export async function POST(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const parsed = categoryInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    if (await findDuplicateCategory(parsed.data.name)) return json({ error: "Tên danh mục đã tồn tại" }, 409);

    const last = await db.category.aggregate({ _max: { position: true } });
    const created = await db.category.create({
      data: { ...parsed.data, position: (last._max.position ?? -1) + 1 },
    });
    await logAdminAction(admin.id, {
      action: "category.create",
      targetType: "category",
      targetId: created.id,
      summary: `Tạo danh mục "${created.name}"`,
    });
    return json(toCategoryDTO(created, 0), 201);
  } catch (e) {
    return serverError(e);
  }
}
