import { BookOpen, CirclePlay } from "lucide-react";
import type { CSSProperties } from "react";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { SetCard } from "@/components/sets/SetCard";
import { SetGroups } from "@/components/sets/SetGroups";
import { getSetStatuses } from "@/components/sets/queries";
import { EmptyState } from "@/components/ui";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { getT } from "@/i18n/server";
import { isUuid } from "@/lib/ids";
import { LEVELS, type CategoryDTO } from "@/lib/validators";

/** Phần danh sách bộ của trang chủ (tầng 2): truy vấn nặng nằm trong Suspense để header hiện ngay. */
export async function HomeSets({
  userId,
  isAdmin,
  categories,
  category,
  level,
  q,
}: {
  userId: string;
  isAdmin: boolean;
  categories: CategoryDTO[];
  category?: string;
  level?: string;
  q?: string;
}) {
  const t = await getT("layout");

  const where: Prisma.StudySetWhereInput = { userId };
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
  const rows = await db.studySet.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { cards: true } } },
  });
  const sets = rows.map((s) => toSetDTO(s, s._count.cards, { isOwner: true }));
  const filtering = !!(where.categoryId || where.level || q);

  const subWhere: Prisma.StudySetWhereInput = {
    subscribers: { some: { userId } },
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

  const statuses = await getSetStatuses(userId, [...sets.map((s) => s.id), ...savedSets.map((s) => s.id)]);
  // Bộ đang học dở (còn thẻ chưa thuộc / thuộc hết mà chưa đạt kiểm tra) lên đầu, học gần nhất trước.
  const inProgress = [...sets, ...savedSets]
    .filter((s) => statuses[s.id]?.inProgress)
    .sort((a, b) => (statuses[b.id].studiedAt?.getTime() ?? 0) - (statuses[a.id].studiedAt?.getTime() ?? 0));
  const pinnedIds = new Set(inProgress.map((s) => s.id));
  const restSaved = savedSets.filter((s) => !pinnedIds.has(s.id));

  return (
    <>
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
          action={filtering ? undefined : <CreateSetButton categories={categories} canManageCategories={isAdmin} />}
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
    </>
  );
}
