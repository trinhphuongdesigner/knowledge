import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/admin/charts";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Card } from "@/components/ui";
import { formatBytes, getDashboardStats } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị — Knowledge" };

const quickLinks = [
  { href: "/admin/users", label: "Tài khoản" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/sets", label: "Thư viện" },
  { href: "/admin/notifications", label: "Thông báo" },
  { href: "/admin/ai", label: "Dùng AI" },
  { href: "/admin/audit", label: "Nhật ký" },
  { href: "/admin/system", label: "Hệ thống" },
];

export default async function AdminPage() {
  await requireAdmin();
  const s = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Tổng quan</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Người dùng" value={s.users} hint={`+${s.new7} / 7 ngày · +${s.new30} / 30 ngày`} href="/admin/users" />
        <StatCard label="Hoạt động 7 ngày" value={s.active7} hint="Có ôn tập" />
        <StatCard
          label="Bộ thẻ"
          value={s.setsPrivate + s.setsLink + s.setsPublic}
          hint={`Riêng tư ${s.setsPrivate} · Link ${s.setsLink} · Public ${s.setsPublic}`}
        />
        <StatCard label="Thẻ" value={s.cards} />
        <StatCard label="Chờ duyệt" value={s.pending} hint="Bộ PUBLIC" href="/admin/sets" tone={s.pending > 0 ? "warn" : undefined} />
        <StatCard label="Tài khoản bị khoá" value={s.disabled} href="/admin/users" />
        <StatCard label="Dung lượng DB" value={formatBytes(s.dbBytes)} href="/admin/system" />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-ink-200 bg-surface px-3 py-1 text-sm text-ink-700 hover:border-brand-400 hover:text-accent"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Đăng ký mới / ngày (30 ngày)</h2>
          <BarChart data={s.signups} label="Đăng ký mới mỗi ngày trong 30 ngày" unit=" người" />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-ink-900">Lượt ôn tập / ngày (30 ngày)</h2>
          <BarChart data={s.reviews} label="Lượt ôn tập mỗi ngày trong 30 ngày" unit=" lượt" />
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-ink-900">Danh mục</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-500">
              <tr>
                <th className="py-1 font-medium">Tên</th>
                <th className="py-1 text-right font-medium">Số bộ</th>
                <th className="py-1 text-right font-medium">Số thẻ</th>
              </tr>
            </thead>
            <tbody>
              {s.categories.map((c) => (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="py-1.5">{c.name}</td>
                  <td className="py-1.5 text-right tabular-nums">{c.sets.toLocaleString("vi-VN")}</td>
                  <td className="py-1.5 text-right tabular-nums">{c.cards.toLocaleString("vi-VN")}</td>
                </tr>
              ))}
              {s.categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-3 text-center text-ink-500">
                    Chưa có danh mục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
