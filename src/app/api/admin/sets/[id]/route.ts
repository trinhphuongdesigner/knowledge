import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { isNotFoundError, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { isUuid } from "@/lib/ids";
import { notify } from "@/lib/notify";
import { z } from "zod";

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
    if (!isUuid(id)) return notFound("Không tìm thấy bộ thẻ");
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const body = parsed.data;

    const set = await db.studySet.findUnique({
      where: { id },
      select: { id: true, userId: true, title: true, visibility: true, approved: true, publishedAt: true },
    });
    if (!set) return notFound("Không tìm thấy bộ thẻ");

    if ("featured" in body) {
      if (body.featured && !(set.visibility === "PUBLIC" && set.approved)) {
        return json({ error: "Chỉ bộ đang công khai trong thư viện mới được đánh dấu nổi bật" }, 409);
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
        summary: `${body.featured ? "Đánh dấu nổi bật" : "Bỏ nổi bật"} bộ "${set.title}"`,
      });
      return json(updated);
    }

    if ("unpublish" in body) {
      if (!(set.visibility === "PUBLIC" && set.approved)) {
        return json({ error: "Bộ này không còn công khai trong thư viện" }, 409);
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
        summary: `Gỡ bộ "${set.title}" khỏi thư viện`,
      });
      await notify(set.userId, {
        type: "SET_REJECTED",
        title: "Bộ thẻ đã bị gỡ khỏi thư viện",
        body: `"${set.title}" đã được gỡ khỏi thư viện công khai; bộ thẻ vẫn chia sẻ được bằng link.`,
        href: `/sets/${id}`,
      });
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
      summary: `${body.approved ? "Duyệt" : "Từ chối"} bộ "${set.title}"`,
    });
    // Báo cho chủ bộ; lỗi thông báo không làm hỏng thao tác duyệt (notify không ném lỗi).
    await notify(set.userId, {
      type: body.approved ? "SET_APPROVED" : "SET_REJECTED",
      title: body.approved ? "Bộ thẻ đã được duyệt" : "Bộ thẻ bị từ chối",
      body: body.approved
        ? `"${set.title}" đã được duyệt và hiển thị trong thư viện.`
        : `"${set.title}" không được duyệt công khai; bộ thẻ vẫn chia sẻ được bằng link.`,
      href: `/sets/${id}`,
    });
    return json(updated);
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy bộ thẻ");
    return serverError(e);
  }
}
