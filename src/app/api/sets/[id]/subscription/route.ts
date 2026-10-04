import { requireApiUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { badRequest, json, notFound, quotaExceeded, serverError } from "@/lib/http";
import { notifyLocalized } from "@/lib/notify";
import { checkQuota } from "@/lib/quota";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireApiUser(req);
    if (user instanceof Response) return user;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const set = await db.studySet.findUnique({
      where: { id },
      select: { userId: true, title: true, visibility: true, approved: true },
    });
    const shareable = set && (set.visibility === "LINK" || (set.visibility === "PUBLIC" && set.approved));
    if (!set || !shareable) return notFound("setNotFound");
    if (set.userId === user.id) return badRequest("ownSet");

    const key = { userId_setId: { userId: user.id, setId: id } };
    if (await db.setSubscription.findUnique({ where: key })) return json({ ok: true }); // idempotent
    const quotaError = await checkQuota(user, { subscriptions: 1 });
    if (quotaError) return quotaExceeded(quotaError);
    await db.setSubscription.upsert({
      where: key,
      create: { userId: user.id, setId: id },
      update: {},
    });
    // Báo cho chủ bộ, tránh spam: bỏ qua nếu đã có thông báo chưa đọc cùng link trong 24 giờ qua.
    const href = `/sets/${id}`;
    const recent = await db.notification.findFirst({
      where: { userId: set.userId, type: "SET_SUBSCRIBED", href, readAt: null, createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { id: true },
    });
    if (!recent) {
      await notifyLocalized(set.userId, (t) => ({
        type: "SET_SUBSCRIBED",
        title: t("notify.setSavedTitle"),
        body: t("notify.setSavedBody", { title: set.title }),
        href,
      }));
    }
    return json({ ok: true }, 201);
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
    await db.setSubscription.deleteMany({ where: { userId: user.id, setId: id } });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
