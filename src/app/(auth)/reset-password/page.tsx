import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { isResetTokenUsable } from "@/lib/auth/reset";
import { hashToken } from "@/lib/auth/token";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đặt lại mật khẩu — Knowledge", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token: raw } = await searchParams;
  const token = typeof raw === "string" ? raw.slice(0, 200) : "";
  const row = token ? await db.passwordResetToken.findUnique({ where: { id: hashToken(token) } }) : null;

  if (!row || !isResetTokenUsable(row)) {
    return (
      <>
        <h1 className="mb-2 text-xl font-bold">Liên kết không hợp lệ</h1>
        <p className="mb-6 text-sm text-ink-600">
          Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu một liên kết mới.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium text-accent hover:underline">
          Yêu cầu liên kết mới
        </Link>
      </>
    );
  }
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Đặt lại mật khẩu</h1>
      <p className="mb-6 text-sm text-ink-600">Chọn mật khẩu mới. Các thiết bị đang đăng nhập sẽ bị đăng xuất.</p>
      <ResetPasswordForm token={token} />
    </>
  );
}
