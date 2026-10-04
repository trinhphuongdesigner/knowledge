import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { apiError, conflict, json, notFound, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Mở khoá tài khoản. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const target = await findManageableUser(id);
    if ("error" in target) return apiError(target.error, target.status);
    if (!target.user.disabledAt) return conflict("accountNotLocked");

    await db.user.update({ where: { id }, data: { disabledAt: null, disabledReason: null } });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "user.enable",
      targetType: "user",
      targetId: id,
      summary: t("audit.userEnable", { email: target.user.email }),
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
