import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingSets } from "./PendingSets";
import { ResetLinkTool } from "./ResetLinkTool";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { addDays } from "@/lib/dates";
import { db } from "@/lib/db";
import { QUOTA } from "@/lib/quota-limits";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị — Knowledge" };

const dtFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

function bytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

type UsageRow = { email: string; sets: number; cards: number };
type SizeRow = { name: string; bytes: bigint | number };

export default async function AdminPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();

  const now = new Date();
  const [users, newUsers, sets, cards, dbSize, tables, usage, jobs, pending] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: addDays(now, -7) } } }),
    db.studySet.count(),
    db.card.count(),
    db.$queryRaw<{ bytes: bigint }[]>`SELECT pg_database_size(current_database()) AS bytes`,
    db.$queryRaw<SizeRow[]>`
      SELECT c.relname AS name, pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 8`,
    db.$queryRaw<UsageRow[]>`
      SELECT u.email AS email, COUNT(DISTINCT s.id)::int AS sets, COUNT(c.id)::int AS cards
      FROM "User" u
      LEFT JOIN "StudySet" s ON s."userId" = u.id
      LEFT JOIN "Card" c ON c."setId" = s.id
      GROUP BY u.id
      ORDER BY cards DESC, sets DESC LIMIT 10`,
    db.jobRun.findMany({ orderBy: { name: "asc" } }),
    db.studySet.findMany({
      where: { visibility: "PUBLIC", approved: false },
      orderBy: { updatedAt: "asc" },
      take: 50,
      select: { id: true, title: true, user: { select: { email: true } }, _count: { select: { cards: true } } },
    }),
  ]);

  const stats = [
    { label: "Người dùng", value: users },
    { label: "Mới 7 ngày", value: newUsers },
    { label: "Bộ thẻ", value: sets },
    { label: "Thẻ", value: cards },
    { label: "Dung lượng DB", value: bytes(Number(dbSize[0]?.bytes ?? 0)) },
  ];

  return (
    <Container className="space-y-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-ink-900">Quản trị</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-3 sm:p-4">
            <p className="text-xs text-ink-600">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{typeof s.value === "number" ? s.value.toLocaleString("vi-VN") : s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Bộ PUBLIC chờ duyệt ({pending.length})</h2>
        <PendingSets
          sets={pending.map((p) => ({ id: p.id, title: p.title, ownerEmail: p.user.email, cardCount: p._count.cards }))}
        />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Tạo link đặt lại mật khẩu</h2>
        <ResetLinkTool />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Bảng lớn nhất</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">Bảng</th>
                <th className="py-1 text-right font-medium">Dung lượng</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.name} className="border-t border-ink-100">
                  <td className="py-1.5">{t.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{bytes(Number(t.bytes))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Top 10 người dùng theo số thẻ</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">Email</th>
                <th className="py-1 text-right font-medium">Bộ</th>
                <th className="py-1 text-right font-medium">Thẻ / hạn mức</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.email} className="border-t border-ink-100">
                  <td className="max-w-[12rem] truncate py-1.5">{u.email}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {u.sets}/{QUOTA.setsPerUser}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {u.cards}/{QUOTA.cardsPerUser} ({Math.round((u.cards / QUOTA.cardsPerUser) * 100)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Tác vụ nền (cron)</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-ink-600">Chưa có lần chạy nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink-500">
                <tr>
                  <th className="py-1 font-medium">Tên</th>
                  <th className="py-1 font-medium">Lần chạy cuối</th>
                  <th className="py-1 font-medium">Kết quả</th>
                  <th className="py-1 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.name} className="border-t border-ink-100">
                    <td className="py-1.5 font-medium">{j.name}</td>
                    <td className="py-1.5">{dtFmt.format(j.lastRunAt)}</td>
                    <td className={`py-1.5 font-medium ${j.ok ? "text-emerald-600" : "text-red-600"}`}>{j.ok ? "OK" : "Lỗi"}</td>
                    <td className="py-1.5 font-mono text-xs text-ink-600">{j.result ? JSON.stringify(j.result) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Container>
  );
}
