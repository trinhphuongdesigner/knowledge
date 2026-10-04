import { z } from "zod";
import { getT } from "@/i18n/server";
import { logAdminAction } from "@/lib/admin/audit";
import { audienceSchema, countAudience, messageSchema, sendBroadcast } from "@/lib/admin/broadcast";
import { requireApiAdmin } from "@/lib/auth/dal";
import { json, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const previewSchema = z.object({ audience: audienceSchema });
const sendSchema = previewSchema.extend({ message: messageSchema });

/** Xem trước số người nhận: GET ?type=all | active&days=N | email&email=... */
export async function GET(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const sp = new URL(req.url).searchParams;
    const days = sp.get("days");
    const email = sp.get("email");
    const parsed = previewSchema.safeParse({
      audience: { type: sp.get("type"), ...(days ? { days: Number(days) } : {}), ...(email ? { email } : {}) },
    });
    if (!parsed.success) return validationError(parsed.error);
    return json({ recipients: await countAudience(parsed.data.audience) });
  } catch (e) {
    return serverError(e);
  }
}

/** Gửi thông báo hệ thống: body { audience, message: { title, body, href } } → { recipients }. */
export async function POST(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const parsed = sendSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { audience, message } = parsed.data;

    const { recipients } = await sendBroadcast(audience, message);
    const t = await getT("admin");
    const who =
      audience.type === "all"
        ? t("audit.whoAll")
        : audience.type === "active"
          ? t("audit.whoActive", { days: audience.days })
          : audience.email;
    await logAdminAction(admin.id, {
      action: "notify.broadcast",
      targetType: "system",
      summary: t("audit.broadcast", { title: message.title, who, count: recipients }),
      meta: { audience, title: message.title, body: message.body, href: message.href, recipients },
    });
    return json({ recipients });
  } catch (e) {
    return serverError(e);
  }
}
