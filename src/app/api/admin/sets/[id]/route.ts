import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isNotFoundError, json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { isUuid } from "@/lib/ids";
import { notify } from "@/lib/notify";
import { z } from "zod";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ approved: z.boolean() });

/**
 * Admin duyệt bộ PUBLIC.
 * approved=true  → approved=true, publishedAt=now (nếu chưa có), hiện ở /library.
 * approved=false → từ chối: approved=false và visibility=LINK (chủ bộ vẫn giữ link chia sẻ, không còn ở thư viện).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    // Kiểm tra role ở server; người không phải admin thấy 404 như thể route không tồn tại.
    if (user.role !== "ADMIN") return notFound();
    const { id } = await params;
    if (!isUuid(id)) return notFound("Không tìm thấy bộ thẻ");
    const parsed = bodySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);

    const set = await db.studySet.findUnique({ where: { id }, select: { id: true, userId: true, title: true, visibility: true, publishedAt: true },
    });
    if (!set) return notFound("Không tìm thấy bộ thẻ");

    const updated = await db.studySet.update({
      where: { id },
      data: parsed.data.approved
        ? { approved: true, publishedAt: set.publishedAt ?? new Date() }
        : { approved: false, visibility: "LINK" },
      select: { id: true, approved: true, visibility: true },
    });
    // Báo cho chủ bộ; lỗi thông báo không làm hỏng thao tác duyệt (notify không ném lỗi).
    await notify(set.userId, {
      type: parsed.data.approved ? "SET_APPROVED" : "SET_REJECTED",
      title: parsed.data.approved ? "Bộ thẻ đã được duyệt" : "Bộ thẻ bị từ chối",
      body: parsed.data.approved
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
