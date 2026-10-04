import { getT } from "@/i18n/server";
import { logAdminAction } from "@/lib/admin/audit";
import { createAiProviderSchema, listAiProviders, toAiProviderDTO } from "@/lib/admin/ai-providers";
import { aiEncryptionReady, encryptApiKey } from "@/lib/ai";
import { keyHint } from "@/lib/ai-crypto";
import { AI_PROVIDER_INFO } from "@/lib/ai-providers";
import { requireApiAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { apiError, json, readJson, serverError, validationError } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Danh sách nhà cung cấp AI (không kèm API key). */
export async function GET(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    return json({ providers: await listAiProviders(), encryptionReady: aiEncryptionReady() });
  } catch (e) {
    return serverError(e);
  }
}

/** Thêm một API key; xếp cuối hàng ưu tiên. */
export async function POST(req: Request) {
  try {
    const admin = await requireApiAdmin(req);
    if (admin instanceof Response) return admin;
    if (!aiEncryptionReady()) return apiError("aiEncryptionMissing", 503);
    const parsed = createAiProviderSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationError(parsed.error);
    const { apiKey, ...data } = parsed.data;

    const last = await db.aiProvider.aggregate({ _max: { priority: true } });
    const row = await db.aiProvider.create({
      data: {
        ...data,
        baseUrl: data.baseUrl ?? null,
        model: data.model ?? null,
        apiKey: encryptApiKey(apiKey),
        keyHint: keyHint(apiKey),
        priority: (last._max.priority ?? -1) + 1,
      },
    });
    const t = await getT("admin");
    await logAdminAction(admin.id, {
      action: "ai.provider.create",
      targetType: "system",
      targetId: row.id,
      summary: t("audit.aiProviderCreate", { name: row.name, kind: AI_PROVIDER_INFO[row.kind].label }),
      meta: { kind: row.kind, baseUrl: row.baseUrl, model: row.model, keyHint: row.keyHint },
    });
    return json(toAiProviderDTO(row), 201);
  } catch (e) {
    return serverError(e);
  }
}
