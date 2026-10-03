import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { json, notFound, serverError } from "@/lib/http";

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
    if ("error" in target) return json({ error: target.error }, target.status);

    const { count } = await db.session.deleteMany({ where: { userId: id } });
    await logAdminAction(admin.id, {
      action: "user.sessions.revoke",
      targetType: "user",
      targetId: id,
      summary: `Đăng xuất mọi thiết bị của ${target.user.email} (${count} phiên)`,
      meta: { sessions: count },
    });
    return json({ ok: true, revoked: count });
  } catch (e) {
    return serverError(e);
  }
}
