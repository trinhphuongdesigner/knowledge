import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type AdminAction = {
  /** vd "user.disable", "user.delete", "category.create", "set.unpublish", "notify.broadcast" */
  action: string;
  targetType: "user" | "category" | "set" | "system";
  targetId?: string | null;
  /** Mô tả ngắn tiếng Việt (giữ được kể cả khi đối tượng đã bị xoá). */
  summary: string;
  meta?: Prisma.InputJsonValue;
};

/** Ghi nhật ký thao tác admin. KHÔNG bao giờ ném lỗi (chỉ log console) để không làm hỏng thao tác chính. */
export async function logAdminAction(adminId: string | null, entry: AdminAction): Promise<void> {
  try {
    await db.adminAuditLog.create({
      data: {
        adminId,
        action: entry.action.slice(0, 80),
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        summary: entry.summary.slice(0, 500),
        ...(entry.meta !== undefined ? { meta: entry.meta } : {}),
      },
    });
  } catch (e) {
    console.error("[admin-audit] không ghi được nhật ký:", e instanceof Error ? e.message : e);
  }
}
