import { getT } from "@/i18n/server";
import { localizeMessage } from "@/i18n/validation";
import { logAdminAction } from "@/lib/admin/audit";
import { toAiProviderDTO, updateAiProviderSchema } from "@/lib/admin/ai-providers";
import { aiEncryptionReady, encryptApiKey } from "@/lib/ai";
import { keyHint } from "@/lib/ai-crypto";
import { missingConfig } from "@/lib/ai-providers";
import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { apiError, json, notFound, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Sửa cấu hình / bật-tắt / đặt lại thời gian tạm nghỉ. apiKey trống = giữ key cũ. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const current = await db.aiProvider.findUnique({ where: { id } });
    if (!current) return notFound();

    const parsed = updateAiProviderSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { apiKey, resetCooldown, ...rest } = parsed.data;
    if (apiKey && !aiEncryptionReady()) return apiError("aiEncryptionMissing", 503);

    const next = {
      kind: rest.kind ?? current.kind,
      baseUrl: rest.baseUrl === undefined ? current.baseUrl : rest.baseUrl,
      model: rest.model === undefined ? current.model : rest.model,
    };
    const missing = missingConfig(next);
    if (missing.length > 0) {
      const fieldErrors: Record<string, string[]> = {};
      for (const f of missing) {
        fieldErrors[f] = [await localizeMessage(f === "baseUrl" ? "validation.aiBaseUrlRequired" : "validation.aiModelRequired")];
      }
      return apiError("invalidData", 400, undefined, { formErrors: [], fieldErrors });
    }

    // Đổi key / endpoint / model = cấu hình mới → xoá trạng thái lỗi cũ để key được thử lại ngay.
    const configChanged =
      !!apiKey || next.kind !== current.kind || next.baseUrl !== current.baseUrl || next.model !== current.model;
    const row = await db.aiProvider.update({
      where: { id },
      data: {
        ...rest,
        ...next,
        ...(apiKey ? { apiKey: encryptApiKey(apiKey), keyHint: keyHint(apiKey) } : {}),
        ...(resetCooldown || configChanged ? { cooldownUntil: null } : {}),
        ...(configChanged ? { lastError: null, lastErrorAt: null } : {}),
      },
    });

    const onlyReset = !!resetCooldown && !apiKey && Object.keys(rest).length === 0;
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: onlyReset ? "ai.provider.reset" : "ai.provider.update",
      targetType: "system",
      targetId: id,
      summary: onlyReset ? t("audit.aiProviderReset", { name: row.name }) : t("audit.aiProviderUpdate", { name: row.name }),
      meta: { ...rest, keyChanged: !!apiKey },
    });
    return json(toAiProviderDTO(row));
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    const { id } = await params;
    if (!isUuid(id)) return notFound();
    const row = await db.aiProvider.findUnique({ where: { id }, select: { name: true, kind: true } });
    if (!row) return notFound();
    await db.aiProvider.delete({ where: { id } });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "ai.provider.delete",
      targetType: "system",
      targetId: id,
      summary: t("audit.aiProviderDelete", { name: row.name }),
      meta: { kind: row.kind },
    });
    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}
