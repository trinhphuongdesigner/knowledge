import { z } from "zod";
import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { apiError, conflict, json, notFound, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ reason: z.string().trim().min(1, "validation.reasonRequired").max(300) });

/** Khoá tài khoản (bắt buộc lý do) và đăng xuất ngay mọi thiết bị. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const target = await findManageableUser(id);
    if ("error" in target) return apiError(target.error, target.status);
    if (target.user.disabledAt) return conflict("accountLocked");

    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { reason } = parsed.data;

    const [, revoked] = await db.$transaction([
      db.user.update({ where: { id }, data: { disabledAt: new Date(), disabledReason: reason } }),
      db.session.deleteMany({ where: { userId: id } }),
    ]);
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "user.disable",
      targetType: "user",
      targetId: id,
      summary: t("audit.userDisable", { email: target.user.email, reason }),
      meta: { reason, sessionsRevoked: revoked.count },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
