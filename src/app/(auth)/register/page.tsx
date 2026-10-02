import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Đăng ký — Knowledge" };

export default function RegisterPage() {
  if (process.env.ALLOW_REGISTRATION === "false") {
    return (
      <>
        <h1 className="mb-2 text-xl font-bold">Đăng ký đang tạm tắt</h1>
        <p className="mb-6 text-sm text-slate-600">
          Hiện chưa mở đăng ký tài khoản mới. Vui lòng quay lại sau.
        </p>
        <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </>
    );
  }
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Tạo tài khoản</h1>
      <p className="mb-6 text-sm text-slate-600">Bộ thẻ của bạn sẽ được lưu riêng cho bạn.</p>
      <RegisterForm />
    </>
  );
}
