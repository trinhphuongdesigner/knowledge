"use server";

import { getCurrentUser } from "@/lib/auth/dal";
import { createResetLink } from "@/lib/auth/reset-link";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";

export type ResetLinkState = { error?: string; link?: string; email?: string; expiresAt?: string } | undefined;

/** Admin tạo link đặt lại mật khẩu (hiệu lực 30 phút) cho một email — dùng khi người dùng chưa bật thông báo đẩy. */
export async function createUserResetLink(_prev: ResetLinkState, formData: FormData): Promise<ResetLinkState> {
  const admin = await getCurrentUser();
  // Kiểm tra ở server; người không phải admin nhận lỗi chung.
  if (!admin || admin.role !== "ADMIN") return { error: "Không có quyền thực hiện" };
  const raw = formData.get("email");
  const parsed = forgotPasswordSchema.safeParse({ email: typeof raw === "string" ? raw : "" });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Email không hợp lệ" };
  const user = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!user) return { error: "Không tìm thấy người dùng với email này" };
  const { link, expiresAt } = await createResetLink(user.id);
  return { link, email: parsed.data.email, expiresAt: expiresAt.toISOString() };
}
