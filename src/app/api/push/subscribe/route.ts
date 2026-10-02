import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { json, readJson, serverError, validationError } from "@/lib/http";
import { pushSubscribeSchema, pushUnsubscribeSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** Đăng ký (hoặc chuyển sang user hiện tại) một thiết bị nhận push, khoá theo endpoint. */
export async function POST(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = pushSubscribeSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { endpoint, keys } = parsed.data;
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) || null;
    await db.pushSubscription.upsert({
      where: { endpoint },
      create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
      update: { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return serverError(e);
  }
}

/** Huỷ đăng ký thiết bị (chỉ của chính mình). */
export async function DELETE(req: Request) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const parsed = pushUnsubscribeSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    await db.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint, userId: user.id } });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
