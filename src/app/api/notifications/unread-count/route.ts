import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { json, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    return json({ unreadCount: await db.notification.count({ where: { userId: user.id, readAt: null } }) });
  } catch (e) {
    return serverError(e);
  }
}
