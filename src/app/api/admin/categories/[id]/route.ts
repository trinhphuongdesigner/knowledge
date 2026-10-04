import { z } from "zod";
import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { findDuplicateCategory } from "@/lib/categories";
import { toCategoryDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";
import { badRequest, conflict, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { categoryUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound("categoryNotFound");
    const parsed = categoryUpdateSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const current = await db.category.findUnique({ where: { id } });
    if (!current) return notFound("categoryNotFound");
    if (parsed.data.name !== undefined && (await findDuplicateCategory(parsed.data.name, id))) {
      return conflict("categoryNameTaken");
    }
    const updated = await db.category.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { sets: true } } },
    });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "category.update",
      targetType: "category",
      targetId: id,
      summary:
        current.name !== updated.name
          ? t("audit.categoryRename", { from: current.name, to: updated.name })
          : t("audit.categoryUpdate", { name: updated.name }),
      meta: { before: { name: current.name, color: current.color, isEnglish: current.isEnglish }, after: parsed.data },
    });
    return json(toCategoryDTO(updated, updated._count.sets));
  } catch (e) {
    return serverError(e);
  }
}

const deleteSchema = z.object({ reassignTo: z.string().uuid().optional() }).optional();

/**
 * Xoá danh mục. Còn bộ thẻ → bắt buộc `reassignTo` (danh mục đích); chuyển toàn bộ bộ rồi xoá trong 1 transaction.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound("categoryNotFound");
    const raw = await readJson(req);
    const parsed = deleteSchema.safeParse(raw ?? undefined);
    if (!parsed.success) return validationError(parsed.error);
    const reassignTo = parsed.data?.reassignTo;

    const current = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { sets: true } } },
    });
    if (!current) return notFound("categoryNotFound");

    let moved = 0;
    let targetName: string | null = null;
    if (current._count.sets > 0 || reassignTo) {
      if (!reassignTo) return conflict("categoryHasSets");
      if (reassignTo === id) return badRequest("categoryTargetSame");
      const target = await db.category.findUnique({ where: { id: reassignTo }, select: { name: true } });
      if (!target) return notFound("categoryTargetNotFound");
      targetName = target.name;
    }

    await db.$transaction(async (tx) => {
      if (reassignTo) {
        const r = await tx.studySet.updateMany({ where: { categoryId: id }, data: { categoryId: reassignTo } });
        moved = r.count;
      }
      await tx.category.delete({ where: { id } });
    });

    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "category.delete",
      targetType: "category",
      targetId: id,
      summary: targetName
        ? t("audit.categoryDeleteMoved", { name: current.name, moved, target: targetName })
        : t("audit.categoryDelete", { name: current.name }),
      meta: { movedSets: moved, ...(reassignTo ? { reassignTo } : {}) },
    });
    return json({ ok: true, moved });
  } catch (e) {
    return serverError(e);
  }
}
