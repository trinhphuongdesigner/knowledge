import { requireApiUser } from "@/lib/auth/dal";
import { json, serverError } from "@/lib/http";
import { listNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const cursor = new URL(req.url).searchParams.get("cursor");
    return json(await listNotifications(user.id, cursor && cursor.length <= 64 ? cursor : null));
  } catch (e) {
    // cursor không tồn tại (P2025) cũng trả về lỗi chung
    return serverError(e);
  }
}
