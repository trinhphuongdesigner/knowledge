import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { json, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Đánh dấu đã đọc (idempotent; chỉ của chính mình, id lạ cũng trả ok để không lộ thông tin). */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    await db.notification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
