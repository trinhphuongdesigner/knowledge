import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = { title: "Đăng nhập — Knowledge" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, expired } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Đăng nhập</h1>
      <p className="mb-6 text-sm text-ink-600">Chào mừng quay lại. Tiếp tục học nào!</p>
      {expired === "1" && (
        <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.
        </p>
      )}
      <GoogleSignInButton next={typeof next === "string" ? next : undefined} />
      <p className="mt-5 text-center text-sm text-ink-600">
        Lần đầu đăng nhập, tài khoản của bạn sẽ được tạo tự động.
      </p>
    </>
  );
}
