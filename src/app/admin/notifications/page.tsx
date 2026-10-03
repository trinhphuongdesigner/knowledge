import type { Metadata } from "next";
import { BroadcastForm } from "@/components/admin/notifications/BroadcastForm";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thông báo — Quản trị" };

const dtFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const history = await db.adminAuditLog.findMany({
    where: { action: "notify.broadcast" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, summary: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Thông báo hệ thống</h1>
        <p className="mt-1 text-sm text-ink-600">
          Gửi thông báo trong app (kèm Web Push nếu người dùng đã bật). Tài khoản bị khoá không nhận.
        </p>
      </div>

      <Card>
        <BroadcastForm />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">20 lần gửi gần nhất</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink-600">Chưa gửi thông báo nào.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {history.map((h) => (
              <li key={h.id} className="py-2 text-sm">
                <p className="break-words text-ink-900">{h.summary}</p>
                <p className="text-xs text-ink-500">{dtFmt.format(h.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
