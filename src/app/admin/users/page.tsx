import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { UserAvatar } from "@/components/avatar";
import { displayName, fmtDate, fmtDateTime, fmtDayOnly } from "@/components/admin/users/format";
import { Badge, Button, Card, EmptyState, Breadcrumbs } from "@/components/ui";
import { fieldClass } from "@/components/ui/fieldStyles";
import { requireAdmin } from "@/lib/auth/dal";
import { listUsers } from "@/lib/admin/users-data";
import {
  USER_FILTERS,
  USER_FILTER_LABELS,
  USER_SORTS,
  parseUserListQuery,
  userListHref,
  type UserSort,
} from "@/lib/admin/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tài khoản — Quản trị" };
export const dynamic = "force-dynamic";

const SORT_LABELS: Record<UserSort, string> = {
  createdAt: "Ngày đăng ký",
  lastLoginAt: "Đăng nhập cuối",
  cards: "Số thẻ",
  sets: "Số bộ",
};

function pctClass(pct: number) {
  return pct >= 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-ink-500";
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const q = parseUserListQuery(await searchParams);
  const { rows, total, pageSize } = await listUsers(q);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(q.page, pages);

  const sortHeader = (key: UserSort, label: string) => {
    const active = q.sort === key;
    const nextDir = active && q.dir === "desc" ? "asc" : "desc";
    return (
      <Link
        href={userListHref(q, { sort: key, dir: nextDir, page: 1 })}
        className={cn("inline-flex items-center gap-1 hover:text-accent", active && "text-ink-900")}
        aria-label={`Sắp xếp theo ${label}`}
      >
        {label}
        {active && (q.dir === "desc" ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUp className="size-3" aria-hidden />)}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản trị", href: "/admin" }, { label: "Tài khoản" }]} className="mb-0" />
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Tài khoản</h1>
        <p className="text-sm text-ink-600">{total} tài khoản{q.q || q.filter ? " khớp bộ lọc" : ""}.</p>
      </div>

      <Card>
        <form method="get" action="/admin/users" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium text-ink-700">
            Tìm kiếm
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                type="search"
                name="q"
                defaultValue={q.q}
                placeholder="Email hoặc tên"
                maxLength={100}
                className={fieldClass(undefined, "min-h-11 pl-9")}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
            Bộ lọc
            <select name="filter" defaultValue={q.filter ?? ""} className={fieldClass(undefined, "min-h-11")}>
              <option value="">Tất cả</option>
              {USER_FILTERS.map((f) => (
                <option key={f} value={f}>
                  {USER_FILTER_LABELS[f]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
            Sắp xếp
            <select name="sort" defaultValue={q.sort} className={fieldClass(undefined, "min-h-11")}>
              {USER_SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="dir" value={q.dir} />
          <Button type="submit">Lọc</Button>
          {(q.q || q.filter) && (
            <Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium text-ink-600 hover:text-accent">
              Xoá lọc
            </Link>
          )}
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Không có tài khoản nào" description="Thử đổi từ khoá hoặc bộ lọc." />
      ) : (
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-ink-200 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Tài khoản</th>
                  <th scope="col" className="px-3 py-3">{sortHeader("createdAt", "Đăng ký")}</th>
                  <th scope="col" className="px-3 py-3">{sortHeader("lastLoginAt", "Đăng nhập cuối")}</th>
                  <th scope="col" className="px-3 py-3">Học cuối</th>
                  <th scope="col" className="px-3 py-3 text-right">{sortHeader("sets", "Bộ")}</th>
                  <th scope="col" className="px-3 py-3 text-right">{sortHeader("cards", "Thẻ")}</th>
                  <th scope="col" className="px-3 py-3 text-right">Đã lưu</th>
                  <th scope="col" className="px-3 py-3 text-right">Lượt ôn</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="flex min-w-0 items-center gap-3">
                        <UserAvatar src={u.avatarUrl} gender={u.gender} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink-900">{displayName(u)}</span>
                          <span className="block truncate text-xs text-ink-500">{u.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDate(u.createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDateTime(u.lastLoginAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{fmtDayOnly(u.lastStudyDay)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      {u.sets} <span className={cn("text-xs", pctClass(u.setsPct))}>({u.setsPct}%)</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                      {u.cards} <span className={cn("text-xs", pctClass(u.cardsPct))}>({u.cardsPct}%)</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{u.saved}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{u.reviews}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.role === "ADMIN" && <Badge tone="blue">Admin</Badge>}
                        {u.disabledAt && <Badge tone="gray" className="bg-red-50 text-red-700 ring-red-600/20">Bị khoá</Badge>}
                        {!u.onboardedAt && <Badge tone="gray">Chưa hoàn tất hồ sơ</Badge>}
                        {u.onboardedAt && !u.disabledAt && u.role !== "ADMIN" && <Badge tone="green">Hoạt động</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={userListHref(q, { page: page - 1 })} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium text-ink-700 hover:bg-ink-100">
              <ChevronLeft className="size-4" aria-hidden /> Trước
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-600">
            Trang {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={userListHref(q, { page: page + 1 })} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium text-ink-700 hover:bg-ink-100">
              Sau <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
