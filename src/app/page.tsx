import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { SetCard } from "@/components/sets/SetCard";
import { SetFilters } from "@/components/sets/SetFilters";
import { EmptyState } from "@/components/ui";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { toSetDTO } from "@/lib/dto";
import { CATEGORIES, LEVELS } from "@/lib/validators";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const category = one(sp.category);
  const level = one(sp.level);
  const q = one(sp.q)?.trim();

  const where: Prisma.StudySetWhereInput = {};
  if (level && (LEVELS as readonly string[]).includes(level)) {
    where.level = level as (typeof LEVELS)[number];
  }
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    where.category = category as (typeof CATEGORIES)[number];
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await db.studySet.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });
  const sets = rows.map((s) => toSetDTO(s, s._count.cards));
  const filtering = !!(where.category || where.level || q);

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bộ học của bạn</h1>
          <p className="mt-1 text-sm text-slate-600">Chọn một bộ học để ôn tập hoặc tạo bộ mới.</p>
        </div>
        <CreateSetButton className="shrink-0" />
      </div>
      <div className="mb-6">
        <Suspense fallback={null}>
          <SetFilters />
        </Suspense>
      </div>
      {sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtering ? "Không tìm thấy bộ học phù hợp" : "Chưa có bộ học nào"}
          description={
            filtering ? "Thử đổi từ khoá hoặc bộ lọc khác." : "Tạo bộ học đầu tiên để bắt đầu học bằng flashcard."
          }
          action={filtering ? undefined : <CreateSetButton />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((s) => (
            <SetCard key={s.id} set={s} />
          ))}
        </div>
      )}
    </Container>
  );
}
