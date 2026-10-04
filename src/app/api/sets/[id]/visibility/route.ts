import { randomBytes } from "node:crypto";
import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { visibilityInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** 16 byte ngẫu nhiên → 22 ký tự base64url. */
function newShareToken() {
  return randomBytes(16).toString("base64url");
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = visibilityInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { visibility } = parsed.data;

    const current = await db.studySet.findFirst({
      where: { id, userId: user.id },
      select: { visibility: true, shareToken: true, publishedAt: true, approved: true },
    });
    if (!current) return notFound("setNotFound");

    const data =
      visibility === "PRIVATE"
        ? { visibility, approved: false, publishedAt: null, shareToken: null }
        : {
            visibility,
            shareToken: current.shareToken ?? newShareToken(),
            publishedAt: current.publishedAt ?? new Date(),
            // Công khai cần admin duyệt (bộ của admin tự động được duyệt); chuyển từ LINK sang PUBLIC thì chờ duyệt lại.
            approved:
              visibility === "PUBLIC" ? user.role === "ADMIN" || (current.visibility === "PUBLIC" && current.approved) : false,
          };

    const set = await db.studySet.update({
      where: { id },
      data,
      include: { category: true, _count: { select: { cards: true } } },
    });
    if (visibility === "PRIVATE") {
      // Người đã lưu mất quyền truy cập → dọn tham chiếu.
      await db.setSubscription.deleteMany({ where: { setId: id } });
    }
    return json(toSetDTO(set, set._count.cards, { isOwner: true, ownerName: user.name }));
  } catch (e) {
    return serverError(e);
  }
}
