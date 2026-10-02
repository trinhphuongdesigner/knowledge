import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { SetGroups } from "@/components/sets/SetGroups";
import { SetFilters } from "@/components/sets/SetFilters";
import { EmptyState } from "@/components/ui";
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
    listCategories(user.id),
  ]);
  const sets = rows.map((s) => toSetDTO(s, s._count.cards));
  const filtering = !!(where.categoryId || where.level || q);

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise motion-reduce:animate-none">
          <p className="mb-1 text-sm font-medium text-brand-700">
            Xin chào{user.name ? `, ${user.name}` : ""} 👋
          </p>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            Hôm nay mình <span className="highlight">ôn gì</span> nhé?
          </h1>
          <p className="mt-2 text-sm text-ink-600">Chọn một nhóm thẻ để ôn tập hoặc tạo nhóm thẻ mới.</p>
        </div>
        <CreateSetButton categories={categories} className="shrink-0" />
      </div>
      <div className="mb-6">
        <Suspense fallback={null}>
          <SetFilters categories={categories} />
        </Suspense>
      </div>
      {sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtering ? "Không tìm thấy nhóm thẻ phù hợp" : "Chưa có nhóm thẻ nào"}
          description={
            filtering ? "Thử đổi từ khoá hoặc bộ lọc khác." : "Tạo nhóm thẻ đầu tiên để bắt đầu học bằng flashcard."
          }
          action={filtering ? undefined : <CreateSetButton categories={categories} />}
        />
      ) : (
        <SetGroups categories={categories} sets={sets} showEmpty={!filtering} />
      )}
    </Container>
  );
}
