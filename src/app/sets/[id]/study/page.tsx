import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getReadableSet } from "@/lib/access";
import { isUuid } from "@/lib/ids";
import { toCardDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";
import { StudySession } from "@/components/study/StudySession";
import { getOnlyCardIds, getOnlyCounts } from "@/components/review/queries";
import { parseOnly, type ReviewOnly } from "@/components/review/session";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Học thẻ — Knowledge" };

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const readable = await getReadableSet(user.id, id);
  if (!readable) notFound();
  const { set } = readable;

  const counts = await getOnlyCounts(user.id, set.id);
  let only = parseOnly((await searchParams).only);
  if (only && counts[only] === 0) only = undefined;
  const onlyIds = only ? new Set(await getOnlyCardIds(user.id, set.id, only)) : null;

  const [cards, progress] = await Promise.all([
    db.card.findMany({
      where: { setId: set.id, ...(onlyIds ? { id: { in: [...onlyIds] } } : {}) },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
    only
      ? null
      : db.studyProgress.findUnique({
          where: { userId_setId: { userId: user.id, setId: set.id } },
          select: { known: true, unknown: true, order: true, index: true, shuffle: true, swap: true },
        }),
  ]);

  const base = `/sets/${set.id}/study`;
  const filters: { key: ReviewOnly | undefined; label: string; href: string }[] = [
    { key: undefined, label: "Tất cả", href: base },
    ...(counts.starred > 0 ? [{ key: "starred" as const, label: `Đánh sao (${counts.starred})`, href: `${base}?only=starred` }] : []),
    ...(counts.hard > 0 ? [{ key: "hard" as const, label: `Từ khó (${counts.hard})`, href: `${base}?only=hard` }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: set.title, href: `/sets/${set.id}` }, { label: "Học thẻ" }]} />
      {filters.length > 1 && (
        <nav aria-label="Lọc thẻ để học" className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              aria-current={f.key === only ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
                f.key === only
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50",
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      )}
      <StudySession
        key={only ?? "all"}
        setId={set.id}
        title={set.title}
        cards={cards.map(toCardDTO)}
        english={set.category.isEnglish}
        initialProgress={progress}
        persist={!only}
      />
    </div>
  );
}
