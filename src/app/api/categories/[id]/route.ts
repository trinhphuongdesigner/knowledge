import { requireApiUser } from "@/lib/auth/dal";
import { findDuplicateCategory } from "@/lib/categories";
import { db } from "@/lib/db";
import { toCategoryDTO } from "@/lib/dto";
import { isNotFoundError, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { isUuid } from "@/lib/ids";
import { categoryUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const DUPLICATE_NAME_MESSAGE = "Đã có danh mục trùng tên";
const NOT_FOUND = "Không tìm thấy danh mục";

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound(NOT_FOUND);
    const parsed = categoryUpdateSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const owned = await db.category.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) return notFound(NOT_FOUND);
    const { name, color, isEnglish } = parsed.data;
    if (name !== undefined && (await findDuplicateCategory(user.id, name, id))) {
      return json({ error: DUPLICATE_NAME_MESSAGE }, 409);
    }
    const updated = await db.category.update({
      where: { id },
      data: { name, color, isEnglish },
      include: { _count: { select: { sets: true } } },
    });
    return json(toCategoryDTO(updated, updated._count.sets));
  } catch (e) {
    if (isNotFoundError(e)) return notFound(NOT_FOUND);
    if ((e as { code?: string } | null)?.code === "P2002") return json({ error: DUPLICATE_NAME_MESSAGE }, 409);
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound(NOT_FOUND);
    const category = await db.category.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { sets: true } } },
    });
    if (!category) return notFound(NOT_FOUND);
    if (category._count.sets > 0) {
      return json({ error: `Danh mục còn ${category._count.sets} nhóm thẻ, hãy chuyển hoặc xoá chúng trước` }, 409);
    }
    await db.category.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound(NOT_FOUND);
    // FK Restrict: a set was added between the count and the delete.
    if ((e as { code?: string } | null)?.code === "P2003") {
      return json({ error: "Danh mục còn nhóm thẻ, hãy chuyển hoặc xoá chúng trước" }, 409);
    }
    return serverError(e);
  }
}
