import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập — Knowledge" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Đăng nhập</h1>
      <p className="mb-6 text-sm text-slate-600">Chào mừng quay lại. Tiếp tục học nào!</p>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </>
  );
}
