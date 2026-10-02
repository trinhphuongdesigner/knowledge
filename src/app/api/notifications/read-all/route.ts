import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { json, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const res = await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return json({ ok: true, updated: res.count });
  } catch (e) {
    return serverError(e);
  }
}
