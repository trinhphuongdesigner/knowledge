import type { Metadata } from "next";
import { FormSuccess } from "@/components/account/FormSuccess";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập — Knowledge" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, reset } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Đăng nhập</h1>
      <p className="mb-6 text-sm text-ink-600">Chào mừng quay lại. Tiếp tục học nào!</p>
      {reset === "1" && (
        <div className="mb-4">
          <FormSuccess message="Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới." />
        </div>
      )}
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </>
  );
}
