import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nhật ký — Quản trị" };

const PAGE_SIZE = 50;
const FILTERS = [
  { key: "", label: "Tất cả" },
  { key: "user", label: "Tài khoản" },
  { key: "category", label: "Danh mục" },
  { key: "set", label: "Bộ thẻ" },
  { key: "notify", label: "Thông báo" },
  { key: "system", label: "Hệ thống" },
] as const;

const dtFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" });

function href(prefix: string, page: number) {
  const q = new URLSearchParams();
  if (prefix) q.set("action", prefix);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/audit?${s}` : "/admin/audit";
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const rawAction = typeof sp.action === "string" ? sp.action : "";
  const prefix = FILTERS.some((f) => f.key === rawAction) ? rawAction : "";
  const rawPage = Number(typeof sp.page === "string" ? sp.page : 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const where = prefix ? { action: { startsWith: `${prefix}.` } } : {};
  const [total, logs] = await Promise.all([
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        summary: true,
        createdAt: true,
        admin: { select: { email: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Nhật ký thao tác</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={href(f.key, 1)}
            className={`rounded-full border px-3 py-1 text-sm ${
              prefix === f.key
                ? "border-brand-600 bg-brand-50 text-accent-strong"
                : "border-ink-200 bg-surface text-ink-700 hover:border-brand-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-600">Chưa có thao tác nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="text-left text-xs text-ink-500">
                <tr>
                  <th className="py-1 pr-3 font-medium">Thời gian</th>
                  <th className="py-1 pr-3 font-medium">Thao tác</th>
                  <th className="py-1 pr-3 font-medium">Mô tả</th>
                  <th className="py-1 font-medium">Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-ink-100 align-top">
                    <td className="whitespace-nowrap py-1.5 pr-3 text-ink-600">{dtFmt.format(l.createdAt)}</td>
                    <td className="py-1.5 pr-3">
                      <Badge tone="gray" className="font-mono">
                        {l.action}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-3">
                      {l.targetType === "user" && l.targetId ? (
                        <Link href={`/admin/users/${l.targetId}`} className="hover:text-accent">
                          {l.summary}
                        </Link>
                      ) : (
                        l.summary
                      )}
                    </td>
                    <td className="max-w-[12rem] truncate py-1.5 text-ink-600">{l.admin?.email ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>
          {total.toLocaleString("vi-VN")} bản ghi · Trang {Math.min(page, pages)}/{pages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <ButtonLink href={href(prefix, page - 1)} variant="secondary" size="sm">
              Trước
            </ButtonLink>
          )}
          {page < pages && (
            <ButtonLink href={href(prefix, page + 1)} variant="secondary" size="sm">
              Sau
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}
