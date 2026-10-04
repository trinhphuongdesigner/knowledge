import { getT } from "@/i18n/server";
import { logAdminAction } from "@/lib/admin/audit";
import { requireApiAdmin } from "@/lib/auth/dal";
import { runCleanup } from "@/lib/cleanup";
import { json, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await requireApiAdmin(req);
  if (admin instanceof Response) return admin;
  const t = await getT("admin");
  try {
    const result = await runCleanup();
    await logAdminAction(admin.id, {
      action: "system.cleanup",
      targetType: "system",
      summary: t("audit.cleanup", {
        details: Object.entries(result)
          .map(([k, v]) => `${k}=${v}`)
          .join(", "),
      }),
      meta: { ...result },
    });
    return json(result);
  } catch (e) {
    await logAdminAction(admin.id, {
      action: "system.cleanup",
      targetType: "system",
      summary: t("audit.cleanupFailed"),
    });
    return serverError(e);
  }
}
