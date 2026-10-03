import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/avatar";
import { UserActions } from "@/components/admin/users/UserActions";
import { displayName, fmtDate, fmtDateTime } from "@/components/admin/users/format";
import { Badge, Card, Breadcrumbs } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { isUuid } from "@/lib/ids";
import { usagePercent } from "@/lib/admin/users";
import { getUserDetail } from "@/lib/admin/users-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Chi tiết tài khoản — Quản trị" };
export const dynamic = "force-dynamic";

const VIS_LABEL = { PRIVATE: "Riêng tư", LINK: "Có link", PUBLIC: "Public" } as const;

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <div className="text-xs text-ink-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-ink-900">{value}</div>
      {hint && <div className="text-xs text-ink-500">{hint}</div>}
    </div>
  );
}

function Bars({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <svg viewBox={`0 0 ${data.length * 10} 48`} className="h-16 w-full" role="img" aria-label={label} preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = d.value === 0 ? 1 : Math.max(2, (d.value / max) * 44);
        return (
          <rect key={d.day} x={i * 10 + 1} y={46 - h} width={8} height={h} rx={1.5} className={d.value ? "fill-brand-600" : "fill-ink-200"}>
            <title>{`${d.day}: ${d.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const d = await getUserDetail(id);
  if (!d) notFound();
  const { user: u, limits } = d;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Quản trị", href: "/admin" }, { label: "Tài khoản", href: "/admin/users" }, { label: displayName(u) }]} className="mb-0" />

      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <UserAvatar src={u.avatarUrl} gender={u.gender} name={displayName(u)} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink-900">{displayName(u)}</h1>
            <p className="break-all text-sm text-ink-600">{u.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {u.isAdmin && <Badge tone="blue">Admin</Badge>}
              {u.disabledAt && <Badge tone="gray" className="bg-red-50 text-red-700 ring-red-600/20">Bị khoá</Badge>}
              {!u.onboardedAt && <Badge tone="gray">Chưa hoàn tất hồ sơ</Badge>}
            </div>
          </div>
        </div>

        {u.disabledAt && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            Bị khoá lúc {fmtDateTime(u.disabledAt)}. Lý do: {u.disabledReason ?? "—"}
          </p>
        )}

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row label="Họ tên" value={u.fullName ?? "—"} />
          <Row label="Năm sinh" value={u.birthYear ?? "—"} />
          <Row label="Ngôn ngữ mẹ đẻ" value={u.nativeLanguage ?? "—"} />
          <Row label="Giới tính" value={u.gender ?? "—"} />
          <Row label="Đăng ký" value={fmtDateTime(u.createdAt)} />
          <Row label="Hoàn tất hồ sơ" value={fmtDateTime(u.onboardedAt)} />
          <Row label="Đăng nhập cuối" value={fmtDateTime(u.lastLoginAt)} />
          <Row label="Thiết bị nhận push" value={d.pushCount} />
        </dl>

        {u.isAdmin ? (
          <p className="text-sm text-ink-500">Tài khoản admin không thể bị khoá, xoá hay chỉnh hạn mức.</p>
        ) : (
          <UserActions
            userId={u.id}
            email={u.email}
            disabled={!!u.disabledAt}
            quota={{ sets: u.quotaSets, cards: u.quotaCards, ai: u.quotaAiPerDay }}
            defaults={d.defaults}
            impact={{ ...d.impact, sets: d.counts.sets, cards: d.counts.cards }}
          />
        )}
      </Card>

      <section aria-labelledby="usage" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <h2 id="usage" className="sr-only">Mức sử dụng</h2>
        <Stat label="Số bộ" value={d.counts.sets} hint={`${usagePercent(d.counts.sets, limits.setsPerUser)}% của ${limits.setsPerUser}${u.quotaSets !== null ? " (riêng)" : ""}`} />
        <Stat label="Số thẻ" value={d.counts.cards} hint={`${usagePercent(d.counts.cards, limits.cardsPerUser)}% của ${limits.cardsPerUser}${u.quotaCards !== null ? " (riêng)" : ""}`} />
        <Stat label="Bộ đã lưu" value={d.counts.saved} />
        <Stat label="Tổng lượt ôn" value={d.counts.reviews} />
        <Stat label="Streak hiện tại" value={`${d.streak.current} ngày`} />
        <Stat label="Streak dài nhất" value={`${d.streak.longest} ngày`} />
        <Stat label="AI mỗi ngày" value={limits.aiPerDay} hint={u.quotaAiPerDay !== null ? "hạn mức riêng" : "mặc định"} />
        <Stat label="AI 30 ngày" value={d.ai30.reduce((s, a) => s + a.count, 0)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold text-ink-900">Lượt ôn 30 ngày</h2>
          <Bars data={d.last30.map((x) => ({ day: x.day, value: x.reviewed }))} label="Lượt ôn mỗi ngày trong 30 ngày qua" />
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold text-ink-900">Lượt dùng AI 30 ngày</h2>
          <Bars data={d.ai30.map((x) => ({ day: x.day, value: x.count }))} label="Lượt dùng AI mỗi ngày trong 30 ngày qua" />
        </Card>
      </div>

      <Card className="p-0 sm:p-0">
        <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">Bộ thẻ ({d.counts.sets})</h2>
        {d.sets.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">Chưa có bộ thẻ nào.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {d.sets.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm sm:px-5">
                <Link href={`/sets/${s.id}`} className="min-w-0 flex-1 truncate font-medium text-ink-900 hover:text-accent">
                  {s.title}
                </Link>
                <span className="text-ink-500">{s.category.name}</span>
                <span className="tabular-nums text-ink-500">{s._count.cards} thẻ</span>
                <span className="tabular-nums text-ink-500">{s._count.subscribers} lưu</span>
                <Badge tone={s.visibility === "PUBLIC" ? (s.approved ? "green" : "blue") : "gray"}>
                  {VIS_LABEL[s.visibility]}
                  {s.visibility === "PUBLIC" && !s.approved ? " · chờ duyệt" : ""}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-0 sm:p-0">
          <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">Phiên đăng nhập ({d.sessions.length})</h2>
          {d.sessions.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">Không có phiên nào.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {d.sessions.map((s) => (
                <li key={s.id} className="px-4 py-2.5 text-sm sm:px-5">
                  <div className={cn("break-words text-ink-900", !s.userAgent && "text-ink-500")}>{s.userAgent ?? "Không rõ thiết bị"}</div>
                  <div className="text-xs text-ink-500">
                    Tạo {fmtDateTime(s.createdAt)} · hết hạn {fmtDate(s.expiresAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-0 sm:p-0">
          <h2 className="px-4 pt-4 font-semibold text-ink-900 sm:px-5">Nhật ký thao tác</h2>
          {d.logs.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-600 sm:px-5">Chưa có thao tác admin nào.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {d.logs.map((l) => (
                <li key={l.id} className="px-4 py-2.5 text-sm sm:px-5">
                  <div className="text-ink-900">{l.summary}</div>
                  <div className="text-xs text-ink-500">
                    {l.action} · {fmtDateTime(l.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-100 py-1">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
