import { requireApiUser } from "@/lib/auth/dal";
import { getReadableSet } from "@/lib/access";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";
import { badRequest, json, notFound, serverError } from "@/lib/http";
import { checkQuota } from "@/lib/quota";
import { copySetForUser } from "@/lib/copy-set";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Sao chép sâu một bộ thẻ vào tài khoản người gọi. Nguồn: bộ của mình, bộ đã lưu,
 * hoặc bộ LINK / PUBLIC+approved (copy từ trang /s/[token] hoặc /library không cần lưu trước).
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();

    const source = await db.studySet.findUnique({
      where: { id },
      include: { category: true, user: { select: { name: true } }, _count: { select: { cards: true } } },
    });
    const readable = source && (source.userId === user.id || (await getReadableSet(user.id, id)) !== null);
    const shareable = source && (source.visibility === "LINK" || (source.visibility === "PUBLIC" && source.approved));
    if (!source || !(readable || shareable)) return notFound("Không tìm thấy nhóm thẻ");

    const quotaError = await checkQuota(user, { sets: 1, cards: source._count.cards });
    if (quotaError) return badRequest(quotaError);

    const copy = await copySetForUser(user.id, source);
    return json(toSetDTO(copy, source._count.cards, { isOwner: true, ownerName: user.name }), 201);
  } catch (e) {
    return serverError(e);
  }
}
