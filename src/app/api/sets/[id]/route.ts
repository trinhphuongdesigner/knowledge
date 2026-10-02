import { requireApiUser } from "@/lib/auth/dal";
import { userOwnsCategory } from "@/lib/categories";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toSetDTO, toSetDetailDTO } from "@/lib/dto";
import {
  badRequest,
  isNotFoundError,
  json,
  notFound,
  readJson,
  serverError,
  validationError,
} from "@/lib/http";
import { setInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const set = await db.studySet.findFirst({
      where: { id, userId: user.id },
      include: { category: true, cards: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
    });
    if (!set) return notFound("Không tìm thấy nhóm thẻ");
    return json(toSetDetailDTO(set));
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = setInputSchema.partial().safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const owned = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) return notFound("Không tìm thấy nhóm thẻ");
    const { title, description, categoryId, level } = parsed.data;
    if (categoryId !== undefined && !(await userOwnsCategory(user.id, categoryId))) {
      return badRequest("Danh mục không hợp lệ");
    }
    const set = await db.studySet.update({
      where: { id },
      data: {
        title,
        categoryId,
        level,
        description: description === undefined ? undefined : description || null,
      },
      include: { category: true, _count: { select: { cards: true } } },
    });
    return json(toSetDTO(set, set._count.cards));
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy nhóm thẻ");
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const owned = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) return notFound("Không tìm thấy nhóm thẻ");
    await db.studySet.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy nhóm thẻ");
    return serverError(e);
  }
}
