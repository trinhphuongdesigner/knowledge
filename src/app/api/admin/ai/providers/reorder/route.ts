import { getT } from "@/i18n/server";
import { logAdminAction } from "@/lib/admin/audit";
import { reorderAiProvidersSchema } from "@/lib/admin/ai-providers";
import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { json, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

/** body { ids } theo thứ tự ưu tiên mới (đầu danh sách được thử trước). */
export async function POST(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const parsed = reorderAiProvidersSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { ids } = parsed.data;

    await db.$transaction(ids.map((id, priority) => db.aiProvider.updateMany({ where: { id }, data: { priority } })));
    const rows = await db.aiProvider.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
    const names = new Map(rows.map((r) => [r.id, r.name]));
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "ai.provider.reorder",
      targetType: "system",
      summary: t("audit.aiProviderReorder", { order: ids.map((id) => names.get(id) ?? "?").join(" → ") }),
      meta: { ids },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
