import { z } from "zod";
import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ id: z.string().uuid(), direction: z.enum(["up", "down"]) });

/** Đổi chỗ danh mục với danh mục liền kề; chuẩn hoá lại position = 0..n-1 trong 1 transaction. */
export async function POST(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { id, direction } = parsed.data;
    const t = await getT("admin");

    const all = await db.category.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    });
    const i = all.findIndex((c) => c.id === id);
    if (i < 0) return notFound("categoryNotFound");
    const j = direction === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < all.length) {
      [all[i], all[j]] = [all[j], all[i]];
    }
    await db.$transaction(all.map((c, idx) => db.category.update({ where: { id: c.id }, data: { position: idx } })));

    await logAdminAction(admin.id, {
      action: "category.reorder",
      targetType: "category",
      targetId: id,
      summary: t("audit.categoryReorder", {
        name: all[j >= 0 && j < all.length ? j : i].name,
        direction: t(direction === "up" ? "audit.up" : "audit.down"),
      }),
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
