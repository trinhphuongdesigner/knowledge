import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Quên mật khẩu — Knowledge" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">Quên mật khẩu</h1>
      <p className="mb-3 text-sm text-ink-600">
        Nhập email của bạn. Liên kết đặt lại mật khẩu sẽ được gửi dưới dạng thông báo đẩy tới các thiết bị bạn đã bật
        thông báo.
      </p>
      <p className="mb-6 text-sm text-ink-600">
        Nếu bạn chưa từng bật thông báo trên thiết bị nào, hãy liên hệ quản trị viên để được cấp link đặt lại mật khẩu.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
