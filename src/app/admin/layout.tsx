import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/layout/Container";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

/** Khung chung cho /admin/**: chỉ admin vào được (người khác thấy 404). Mỗi page vẫn tự gọi requireAdmin(). */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <Container className="max-w-7xl py-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <AdminNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
