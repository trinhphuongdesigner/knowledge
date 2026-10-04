import "server-only";
import { z } from "zod";
import type { AiProvider } from "@/generated/prisma/client";
import { AI_PROVIDER_KINDS, missingConfig } from "@/lib/ai-providers";
import { db } from "@/lib/db";

/** Dữ liệu trả về trang admin — KHÔNG có API key (chỉ 4 ký tự cuối). */
export type AiProviderDTO = {
  id: string;
  name: string;
  kind: AiProvider["kind"];
  keyHint: string;
  baseUrl: string | null;
  model: string | null;
  priority: number;
  enabled: boolean;
  cooldownUntil: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  lastSuccessAt: string | null;
  successCount: number;
  failCount: number;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

export function toAiProviderDTO(p: AiProvider): AiProviderDTO {
  return {
    id: p.id,
    name: p.name,
    kind: p.kind,
    keyHint: p.keyHint,
    baseUrl: p.baseUrl,
    model: p.model,
    priority: p.priority,
    enabled: p.enabled,
    cooldownUntil: iso(p.cooldownUntil),
    lastError: p.lastError,
    lastErrorAt: iso(p.lastErrorAt),
    lastSuccessAt: iso(p.lastSuccessAt),
    successCount: p.successCount,
    failCount: p.failCount,
  };
}

export async function listAiProviders(): Promise<AiProviderDTO[]> {
  const rows = await db.aiProvider.findMany({ orderBy: [{ priority: "asc" }, { createdAt: "asc" }] });
  return rows.map(toAiProviderDTO);
}

/** "" → null cho các trường tuỳ chọn. */
const optional = (inner: z.ZodType<string, string>) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.union([z.literal(""), inner]))
    .transform((s) => s || null)
    .nullable()
    .optional();

const baseUrl = optional(z.url({ protocol: /^https?$/, message: "validation.aiBaseUrlInvalid" }).max(300));
const model = optional(z.string().max(120));
const name = z.string().trim().min(1, "validation.aiNameRequired").max(60, "validation.aiNameMax");
const apiKey = z.string().trim().min(1, "validation.aiKeyRequired").max(500);
const kind = z.enum(AI_PROVIDER_KINDS);

function requireCompatibleFields(
  v: { kind?: AiProvider["kind"]; baseUrl?: string | null; model?: string | null },
  ctx: z.RefinementCtx,
) {
  if (!v.kind) return;
  for (const field of missingConfig({ kind: v.kind, baseUrl: v.baseUrl ?? null, model: v.model ?? null })) {
    ctx.addIssue({
      code: "custom",
      path: [field],
      message: field === "baseUrl" ? "validation.aiBaseUrlRequired" : "validation.aiModelRequired",
    });
  }
}

export const createAiProviderSchema = z
  .object({ name, kind, apiKey, baseUrl, model, enabled: z.boolean().default(true) })
  .superRefine(requireCompatibleFields);

/** Sửa: apiKey bỏ trống = giữ key cũ; resetCooldown = cho key quay lại vòng xoay ngay. */
export const updateAiProviderSchema = z.object({
  name: name.optional(),
  kind: kind.optional(),
  apiKey: z.string().trim().max(500).optional(),
  baseUrl,
  model,
  enabled: z.boolean().optional(),
  resetCooldown: z.boolean().optional(),
});

export const reorderAiProvidersSchema = z.object({ ids: z.array(z.uuid()).min(1).max(100) });
