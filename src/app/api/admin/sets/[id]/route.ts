import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { conflict, isNotFoundError, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { isUuid } from "@/lib/ids";
import { notifyLocalized } from "@/lib/notify";
import { z } from "zod";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Đúng một trong: duyệt/từ chối (`approved`), gỡ khỏi thư viện (`unpublish`), đánh dấu nổi bật (`featured`). */
const bodySchema = z.union([
  z.object({ approved: z.boolean() }),
  z.object({ unpublish: z.literal(true) }),
  z.object({ featured: z.boolean() }),
]);

/**
 * Admin quản lý bộ PUBLIC.
 * approved=true  → approved=true, publishedAt=now (nếu chưa có), hiện ở /library.
 * approved=false → từ chối: approved=false và visibility=LINK (chủ bộ vẫn giữ link chia sẻ, không còn ở thư viện).
 * unpublish      → gỡ bộ đã public khỏi thư viện (approved=false, visibility=LINK, bỏ nổi bật) + báo chủ bộ.
 * featured       → bật/tắt nổi bật (chỉ với bộ đang public đã duyệt).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound("setNotFound");
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const body = parsed.data;
    const t = await getT("admin");

    const set = await db.studySet.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true, visibility: true, approved: true, publishedAt: true },
    });
    if (!set) return notFound("setNotFound");

    if ("featured" in body) {
      if (body.featured && !(set.visibility === "PUBLIC" && set.approved)) {
        return conflict("featuredOnlyPublic");
      }
      const updated = await db.studySet.update({
        where: { id },
        data: { featured: body.featured },
        select: { id: true, featured: true },
      });
      await logAdminAction(admin.id, {
        action: "set.feature",
        targetType: "set",
        targetId: id,
        summary: t(body.featured ? "audit.setFeature" : "audit.setUnfeature", { title: set.title }),
      });
      return json(updated);
    }

    if ("unpublish" in body) {
      if (!(set.visibility === "PUBLIC" && set.approved)) {
        return conflict("setNotPublic");
      }
      const updated = await db.studySet.update({
        where: { id },
        data: { approved: false, visibility: "LINK", featured: false },
        select: { id: true, approved: true, visibility: true, featured: true },
      });
      await logAdminAction(admin.id, {
        action: "set.unpublish",
        targetType: "set",
        targetId: id,
        summary: t("audit.setUnpublish", { title: set.title }),
      });
      await notifyLocalized(set.userId, (tr) => ({
        type: "SET_REJECTED",
        title: tr("notify.setUnpublishedTitle"),
        body: tr("notify.setUnpublishedBody", { title: set.title }),
        href: `/sets/${id}`,
      }));
      return json(updated);
    }

    const updated = await db.studySet.update({
      where: { id },
      data: body.approved
        ? { approved: true, publishedAt: set.publishedAt ?? new Date() }
        : { approved: false, visibility: "LINK", featured: false },
      select: { id: true, approved: true, visibility: true },
    });
    await logAdminAction(admin.id, {
      action: body.approved ? "set.approve" : "set.reject",
      targetType: "set",
      targetId: id,
      summary: t(body.approved ? "audit.setApprove" : "audit.setReject", { title: set.title }),
    });
    // Báo cho chủ bộ; lỗi thông báo không làm hỏng thao tác duyệt (notify không ném lỗi).
    await notifyLocalized(set.userId, (tr) => ({
      type: body.approved ? "SET_APPROVED" : "SET_REJECTED",
      title: tr(body.approved ? "notify.setApprovedTitle" : "notify.setRejectedTitle"),
      body: tr(body.approved ? "notify.setApprovedBody" : "notify.setRejectedBody", { title: set.title }),
      href: `/sets/${id}`,
    }));
    return json(updated);
  } catch (e) {
    if (isNotFoundError(e)) return notFound("setNotFound");
    return serverError(e);
  }
}
