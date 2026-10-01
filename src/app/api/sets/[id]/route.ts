import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toSetDTO, toSetDetailDTO } from "@/lib/dto";
import {
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

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const set = await db.studySet.findUnique({
      where: { id },
      include: { cards: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
    });
    if (!set) return notFound("Không tìm thấy bộ học");
    return json(toSetDetailDTO(set));
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = setInputSchema.partial().safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { title, description, category, level } = parsed.data;
    const set = await db.studySet.update({
      where: { id },
      data: {
        title,
        category,
        level,
        description: description === undefined ? undefined : description || null,
      },
      include: { _count: { select: { cards: true } } },
    });
    return json(toSetDTO(set, set._count.cards));
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy bộ học");
    return serverError(e);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    await db.studySet.delete({ where: { id } });
    return json({ ok: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound("Không tìm thấy bộ học");
    return serverError(e);
  }
}
