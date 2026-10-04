import { z } from "zod";
import { getT } from "@/i18n/server";
import { requireApiAdmin } from "@/lib/auth/dal";
import { logAdminAction } from "@/lib/admin/audit";
import { findManageableUser, publicSetImpact } from "@/lib/admin/users-data";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { apiError, badRequest, json, notFound, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ confirmEmail: z.string().max(320) });

/** Xoá tài khoản (cascade toàn bộ dữ liệu). Bắt gõ lại đúng email. */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const target = await findManageableUser(id);
    if ("error" in target) return apiError(target.error, target.status);

    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    if (parsed.data.confirmEmail.trim().toLowerCase() !== target.user.email) {
      return badRequest("confirmEmailMismatch");
    }

    const [impact, sets, cards] = await Promise.all([
      publicSetImpact(id),
      db.studySet.count({ where: { userId: id } }),
      db.card.count({ where: { set: { userId: id } } }),
    ]);
    await db.user.delete({ where: { id } });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "user.delete",
      targetType: "user",
      targetId: id,
      summary: t("audit.userDelete", {
        email: target.user.email,
        sets,
        cards,
        publicSets: impact.publicSets,
        savers: impact.savers,
      }),
      meta: { email: target.user.email, sets, cards, ...impact },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
