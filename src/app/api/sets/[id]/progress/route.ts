import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { json, notFound, readJson, serverError, validationError } from "@/lib/http";
import { studyProgressInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const parsed = studyProgressInputSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const owned = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) return notFound("Không tìm thấy nhóm thẻ");
    const { completed, ...state } = parsed.data;
    await db.studyProgress.upsert({
      where: { userId_setId: { userId: user.id, setId: id } },
      create: { userId: user.id, setId: id, ...state, completedAt: completed ? new Date() : null },
      // Only touch completedAt when finishing; a later partial save keeps the last completion time.
      update: { ...state, ...(completed ? { completedAt: new Date() } : {}) },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    await db.studyProgress.deleteMany({ where: { userId: user.id, setId: id } });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
