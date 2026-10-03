import { Library, Search, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Container } from "@/components/layout/Container";
import { SetSaveButtons } from "@/components/library/SetSaveButtons";
import { LevelBadge } from "@/components/sets/LevelBadge";
import { Badge, Button, ButtonLink, Card, EmptyState, Breadcrumbs } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { listLibrary, listLibraryCategories } from "@/lib/library";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thư viện — Knowledge" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const q = one(sp.q)?.trim() ?? "";
  const category = one(sp.category)?.trim() ?? "";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const [{ sets, hasMore }, categories] = await Promise.all([
    listLibrary({ q, category, page }),
    listLibraryCategories(),
  ]);
  const ids = sets.map((s) => s.id);
  const [subs, mineRows] = await Promise.all([
    db.setSubscription.findMany({ where: { userId: user.id, setId: { in: ids } }, select: { setId: true } }),
    db.studySet.findMany({ where: { userId: user.id, id: { in: ids } }, select: { id: true } }),
  ]);
  const subscribed = new Set(subs.map((s) => s.setId));
  const owned = new Set(mineRows.map((s) => s.id));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (category) u.set("category", category);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/library${s ? `?${s}` : ""}`;
  };

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Thư viện" }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">Thư viện</h1>
        <p className="mt-1 text-sm text-ink-600">
          Các nhóm thẻ do cộng đồng chia sẻ. Lưu vào thư viện của bạn hoặc tạo bản sao để tự chỉnh sửa.
        </p>
      </div>

      <form action="/library" method="get" role="search" className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên hoặc mô tả…"
            aria-label="Tìm trong thư viện"
            className="min-h-11 w-full rounded-xl border border-ink-200 bg-surface pl-9 pr-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
          />
        </div>
        <select
          name="category"
          defaultValue={category}
          aria-label="Danh mục"
          className="min-h-11 rounded-xl border border-ink-200 bg-surface px-3 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <option value="">Mọi danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit">Tìm</Button>
      </form>

      {sets.length === 0 ? (
        <EmptyState
          icon={Library}
          title={q || category ? "Không tìm thấy nhóm thẻ phù hợp" : "Thư viện chưa có nhóm thẻ nào"}
          description={
            q || category
              ? "Thử đổi từ khoá hoặc danh mục khác."
              : "Hãy là người đầu tiên chia sẻ: mở một nhóm thẻ của bạn và chọn Chia sẻ, Công khai."
          }
          action={
            <ButtonLink href="/" variant="secondary">
              Về trang chủ
            </ButtonLink>
          }
        />
      ) : (
        <ul className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((s, i) => {
            const mine = owned.has(s.id);
            const saved = subscribed.has(s.id);
            const target = mine || saved ? `/sets/${s.id}` : s.token ? `/s/${s.token}` : `/sets/${s.id}`;
            return (
              <li key={s.id} style={{ "--i": i } as CSSProperties}>
                <Card className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {s.featured && <Badge tone="blue">Nổi bật</Badge>}
                    <CategoryBadge category={s.category} />
                    <LevelBadge level={s.level} />
                  </div>
                  <h2 className="line-clamp-2 break-words text-base font-semibold text-ink-900">
                    <Link
                      href={target}
                      className="hover:text-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      {s.title}
                    </Link>
                  </h2>
                  {s.description && <p className="line-clamp-3 break-words text-sm text-ink-600">{s.description}</p>}
                  <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    <span>Của {s.ownerName ?? "Ẩn danh"}</span>
                    <span>{s.cardCount} thẻ</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" aria-hidden />
                      {s.subscriberCount} đã lưu
                    </span>
                  </p>
                  {mine ? (
                    <p className="text-sm font-medium text-accent-strong">Nhóm thẻ của bạn</p>
                  ) : (
                    <SetSaveButtons setId={s.id} subscribed={saved} />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {(page > 1 || hasMore) && (
        <nav aria-label="Phân trang" className="mt-8 flex items-center justify-between gap-3">
          {page > 1 ? (
            <ButtonLink href={href(page - 1)} variant="secondary">
              Trang trước
            </ButtonLink>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-500">Trang {page}</span>
          {hasMore ? (
            <ButtonLink href={href(page + 1)} variant="secondary">
              Trang sau
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      )}
    </Container>
  );
}
