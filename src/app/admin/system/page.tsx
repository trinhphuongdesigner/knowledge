import type { Metadata } from "next";
import { RunCleanupButton } from "@/components/admin/dashboard/RunCleanupButton";
import { Card } from "@/components/ui";
import { formatBytes, getSystemStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hệ thống — Quản trị" };

const dtFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

function FailTable({ title, head, rows }: { title: string; head: string; rows: { key: string | null; n: number }[] }) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold text-ink-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-600">Không có lần đăng nhập thất bại nào trong 24 giờ qua.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">{head}</th>
                <th className="py-1 text-right font-medium">Số lần</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key ?? "—"} className="border-t border-ink-100">
                  <td className="max-w-[16rem] truncate py-1.5 font-mono text-xs">{r.key ?? "(không rõ)"}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default async function AdminSystemPage() {
  await requireAdmin();
  const s = await getSystemStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Hệ thống</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Tác vụ nền (cron)</h2>
        {s.jobs.length === 0 ? (
          <p className="text-sm text-ink-600">Chưa có lần chạy nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">Tên</th>
                  <th className="py-1 pr-3 font-medium">Lần chạy cuối</th>
                  <th className="py-1 pr-3 font-medium">Kết quả</th>
                  <th className="py-1 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {s.jobs.map((j) => (
                  <tr key={j.name} className="border-t border-ink-100">
                    <td className="py-1.5 pr-3 font-medium">{j.name}</td>
                    <td className="whitespace-nowrap py-1.5 pr-3">{dtFmt.format(j.lastRunAt)}</td>
                    <td className={`py-1.5 pr-3 font-medium ${j.ok ? "text-emerald-600" : "text-red-600"}`}>{j.ok ? "OK" : "Lỗi"}</td>
                    <td className="py-1.5 font-mono text-xs text-ink-600">{j.result ? JSON.stringify(j.result) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 border-t border-ink-100 pt-4">
          <RunCleanupButton />
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold text-ink-900">Dung lượng cơ sở dữ liệu</h2>
        <p className="mb-3 text-sm text-ink-600">Tổng: {formatBytes(s.dbBytes)}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">Bảng</th>
                <th className="py-1 text-right font-medium">Dung lượng</th>
              </tr>
            </thead>
            <tbody>
              {s.tables.map((t) => (
                <tr key={t.name} className="border-t border-ink-100">
                  <td className="py-1.5">{t.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatBytes(t.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <FailTable title="Đăng nhập thất bại 24h theo IP (top 10)" head="IP" rows={s.failedByIp} />
        <FailTable title="Đăng nhập thất bại 24h theo email (top 10)" head="Email" rows={s.failedByEmail} />
      </div>
    </div>
  );
}
