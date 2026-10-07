import { BookOpen, CirclePlay, Library } from "lucide-react";
import { Suspense, type CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { DueTodayCard } from "@/components/review/DueTodayCard";
import { StreakCard } from "@/components/stats/StreakCard";
import { SetCard } from "@/components/sets/SetCard";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { getSetStatuses } from "@/components/sets/queries";
import { SetGroups } from "@/components/sets/SetGroups";
import { SetFilters } from "@/components/sets/SetFilters";
import { ButtonLink, EmptyState, RichText } from "@/components/ui";
import type { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { getT } from "@/i18n/server";
import { isUuid } from "@/lib/ids";
import { LEVELS } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, t] = await Promise.all([requireUser(), getT("layout")]);
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

  const statuses = await getSetStatuses(user.id, [...sets.map((s) => s.id), ...savedSets.map((s) => s.id)]);
  // Bộ đang học dở (còn thẻ chưa thuộc / thuộc hết mà chưa đạt kiểm tra) lên đầu, học gần nhất trước.
  const inProgress = [...sets, ...savedSets]
    .filter((s) => statuses[s.id]?.inProgress)
    .sort((a, b) => (statuses[b.id].studiedAt?.getTime() ?? 0) - (statuses[a.id].studiedAt?.getTime() ?? 0));
  const pinnedIds = new Set(inProgress.map((s) => s.id));
  const restSaved = savedSets.filter((s) => !pinnedIds.has(s.id));

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise motion-reduce:animate-none">
          <p className="mb-1 text-sm font-medium text-accent-strong">
            {user.name ? t("home.greetingNamed", { name: user.name }) : t("home.greeting")}
          </p>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            <RichText text={t("home.heading")} boldClassName="highlight" />
          </h1>
          <p className="mt-2 text-sm text-ink-600">{t("home.subtitle")}</p>
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
                {t("home.explore")}
              </ButtonLink>
            }
          />
        </Suspense>
      </div>
      {inProgress.length > 0 && (
        <section aria-labelledby="in-progress-heading" className="mb-8">
          <h2 id="in-progress-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
            <CirclePlay className="size-5 text-accent-strong" aria-hidden />
            {t("home.inProgress")} <span className="text-sm font-normal text-ink-500">· {inProgress.length}</span>
          </h2>
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((s, i) => (
              <div key={s.id} className="h-full" style={{ "--i": i } as CSSProperties}>
                <SetCard set={s} status={statuses[s.id]} />
              </div>
            ))}
          </div>
        </section>
      )}
      {sets.length === 0 && savedSets.length > 0 ? null : sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtering ? t("home.emptyFilteredTitle") : t("home.emptyTitle")}
          description={
            filtering ? t("home.emptyFilteredDescription") : t("home.emptyDescription")
          }
          action={filtering ? undefined : <CreateSetButton categories={categories} canManageCategories={user.role === "ADMIN"} />}
        />
      ) : (
        <SetGroups
          categories={categories}
          sets={sets}
          showEmpty={!filtering && savedSets.length === 0}
          statuses={statuses}
          pinnedIds={pinnedIds}
        />
      )}
      {restSaved.length > 0 && (
        <section aria-labelledby="saved-heading" className="mt-10">
          <h2 id="saved-heading" className="mb-4 text-lg font-semibold text-ink-900">
            {t("home.saved")} <span className="text-sm font-normal text-ink-500">· {restSaved.length}</span>
          </h2>
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restSaved.map((s, i) => (
              <div key={s.id} className="h-full" style={{ "--i": i } as CSSProperties}>
                <SetCard set={s} status={statuses[s.id]} />
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
