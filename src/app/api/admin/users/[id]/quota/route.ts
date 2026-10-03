import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const limit = z.number().int().min(0).max(1_000_000).nullable();
const bodySchema = z.object({ quotaSets: limit, quotaCards: limit, quotaAiPerDay: limit });

/** Đặt override hạn mức (null = dùng mặc định). Cả 3 trường đều bắt buộc có mặt. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const target = await findManageableUser(id);
    if ("error" in target) return json({ error: target.error }, target.status);

    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const data = parsed.data;

    await db.user.update({ where: { id }, data });
    const fmt = (n: number | null) => (n === null ? "mặc định" : String(n));
    await logAdminAction(admin.id, {
      action: "user.quota",
      targetType: "user",
      targetId: id,
      summary: `Đặt hạn mức ${target.user.email}: bộ ${fmt(data.quotaSets)}, thẻ ${fmt(data.quotaCards)}, AI/ngày ${fmt(data.quotaAiPerDay)}`,
      meta: data,
    });
    return json({ ok: true, ...data });
  } catch (e) {
    return serverError(e);
  }
}
