import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/admin/charts";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Card, Breadcrumbs } from "@/components/ui";
import { getAiStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dùng AI — Quản trị" };

type Row = { id: string; email: string; total: number; limit: number };

function TopTable({ rows, perDay }: { rows: Row[]; perDay: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-ink-600">Chưa có dữ liệu.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-ink-500">
          <tr>
            <th className="py-1 font-medium">Email</th>
            <th className="py-1 text-right font-medium">Lượt</th>
            <th className="py-1 text-right font-medium">Hạn mức/ngày</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-ink-100">
              <td className="max-w-[14rem] truncate py-1.5">
                <Link href={`/admin/users/${r.id}`} className="hover:text-accent">
                  {r.email}
                </Link>
              </td>
              <td className={`py-1.5 text-right tabular-nums ${perDay && r.total >= r.limit ? "font-semibold text-red-600" : ""}`}>
                {r.total.toLocaleString("vi-VN")}
              </td>
              <td className="py-1.5 text-right tabular-nums">{r.limit.toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminAiPage() {
  await requireAdmin();
  const s = await getAiStats();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản trị", href: "/admin" }, { label: "Dùng AI" }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">Dùng AI</h1>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard label="Hôm nay" value={s.totalToday} hint="lượt" />
        <StatCard label="30 ngày" value={s.total30} hint="lượt" />
      </div>
      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Lượt AI / ngày (30 ngày)</h2>
        <BarChart data={s.series} label="Lượt dùng AI mỗi ngày trong 30 ngày" unit=" lượt" />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Top 10 hôm nay</h2>
          <TopTable rows={s.topToday} perDay />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Top 10 trong 30 ngày</h2>
          <TopTable rows={s.top30} perDay={false} />
        </Card>
      </div>
    </div>
  );
}
