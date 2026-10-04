import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { apiError, json, notFound, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Đăng xuất mọi thiết bị: xoá toàn bộ Session của user. */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const target = await findManageableUser(id);
    if ("error" in target) return apiError(target.error, target.status);

    const { count } = await db.session.deleteMany({ where: { userId: id } });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "user.sessions.revoke",
      targetType: "user",
      targetId: id,
      summary: t("audit.sessionsRevoke", { email: target.user.email, count }),
      meta: { sessions: count },
    });
    return json({ ok: true, revoked: count });
  } catch (e) {
    return serverError(e);
  }
}
