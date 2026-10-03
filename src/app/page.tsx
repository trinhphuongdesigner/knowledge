import { BookOpen, Library } from "lucide-react";
import { Suspense, type CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { DueTodayCard } from "@/components/review/DueTodayCard";
import { StreakCard } from "@/components/stats/StreakCard";
import { SetCard } from "@/components/sets/SetCard";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { SetGroups } from "@/components/sets/SetGroups";
import { SetFilters } from "@/components/sets/SetFilters";
import { ButtonLink, EmptyState } from "@/components/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";
import { LEVELS } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const category = one(sp.category);
  const level = one(sp.level);
  const q = one(sp.q)?.trim();

  const where: Prisma.StudySetWhereInput = { userId: user.id };
  if (level && (LEVELS as readonly string[]).includes(level)) {
    where.level = level as (typeof LEVELS)[number];
  }
  if (category && isUuid(category)) where.categoryId = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  const [rows, categories] = await Promise.all([
    db.studySet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { cards: true } } },
    }),
    listCategories(),
  ]);
  const sets = rows.map((s) => toSetDTO(s, s._count.cards, { isOwner: true }));
  const filtering = !!(where.categoryId || where.level || q);

  const subWhere: Prisma.StudySetWhereInput = {
    subscribers: { some: { userId: user.id } },
    OR: [{ visibility: "LINK" }, { visibility: "PUBLIC", approved: true }],
  };
  const and: Prisma.StudySetWhereInput[] = [];
  if (where.level) subWhere.level = where.level;
  if (where.categoryId) subWhere.categoryId = where.categoryId;
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (and.length) subWhere.AND = and;
  const savedRows = await db.studySet.findMany({
    where: subWhere,
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { category: true, user: { select: { name: true } }, _count: { select: { cards: true } } },
  });
  const savedSets = savedRows.map((s) =>
    toSetDTO(s, s._count.cards, { isOwner: false, ownerName: s.user.name }),
  );

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise motion-reduce:animate-none">
          <p className="mb-1 text-sm font-medium text-accent-strong">
            Xin chào{user.name ? `, ${user.name}` : ""} 👋
          </p>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            Hôm nay mình <span className="highlight">ôn gì</span> nhé?
          </h1>
          <p className="mt-2 text-sm text-ink-600">Chọn một nhóm thẻ để ôn tập hoặc tạo nhóm thẻ mới.</p>
        </div>
        <CreateSetButton categories={categories} canManageCategories={user.role === "ADMIN"} className="shrink-0" />
      </div>
      <div className="mb-6 grid gap-4 empty:hidden md:grid-cols-2">
        <Suspense fallback={null}>
          <DueTodayCard userId={user.id} />
        </Suspense>
        <Suspense fallback={null}>
          <StreakCard userId={user.id} />
        </Suspense>
      </div>
      <div className="mb-6">
        <Suspense fallback={null}>
          <SetFilters
            categories={categories}
            canManageCategories={user.role === "ADMIN"}
            trailing={
              <ButtonLink href="/library" variant="secondary" className="w-full whitespace-nowrap md:w-auto">
                <Library className="size-4" aria-hidden />
                Khám phá thư viện
              </ButtonLink>
            }
          />
        </Suspense>
      </div>
      {sets.length === 0 && savedSets.length > 0 ? null : sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtering ? "Không tìm thấy nhóm thẻ phù hợp" : "Chưa có nhóm thẻ nào"}
          description={
            filtering ? "Thử đổi từ khoá hoặc bộ lọc khác." : "Tạo nhóm thẻ đầu tiên để bắt đầu học bằng flashcard."
          }
          action={filtering ? undefined : <CreateSetButton categories={categories} canManageCategories={user.role === "ADMIN"} />}
        />
      ) : (
        <SetGroups categories={categories} sets={sets} showEmpty={!filtering && savedSets.length === 0} />
      )}
      {savedSets.length > 0 && (
        <section aria-labelledby="saved-heading" className="mt-10">
          <h2 id="saved-heading" className="mb-4 text-lg font-semibold text-ink-900">
            Thư viện đã lưu <span className="text-sm font-normal text-ink-500">· {savedSets.length}</span>
          </h2>
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedSets.map((s, i) => (
              <div key={s.id} className="h-full" style={{ "--i": i } as CSSProperties}>
                <SetCard set={s} />
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
