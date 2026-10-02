import "server-only";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { newResetToken } from "./reset";

/** Tạo token đặt lại mật khẩu mới (xoá token cũ của user) và trả link tuyệt đối. */
export async function createResetLink(userId: string): Promise<{ link: string; path: string; expiresAt: Date }> {
  const { token, id, expiresAt } = newResetToken();
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId } }),
    db.passwordResetToken.create({ data: { id, userId, expiresAt } }),
  ]);
  const path = `/reset-password?token=${token}`;
  return { link: `${siteUrl()}${path}`, path, expiresAt };
}
