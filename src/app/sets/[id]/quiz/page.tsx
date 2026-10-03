import { ListChecks } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizSession } from "@/components/quiz/QuizSession";
import { ButtonLink, EmptyState, Breadcrumbs } from "@/components/ui";
import { getReadableSet } from "@/lib/access";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { toCardDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kiểm tra — Knowledge" };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const readable = await getReadableSet(user.id, id);
  if (!readable) notFound();
  const { set } = readable;
  const cards = await db.card.findMany({
    where: { setId: set.id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const progress = await db.studyProgress.findUnique({
    where: { userId_setId: { userId: user.id, setId: set.id } },
    select: { known: true },
  });
  const cardIds = new Set(cards.map((c) => c.id));
  const knownIds = (progress?.known ?? []).filter((cid) => cardIds.has(cid));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: set.title, href: `/sets/${set.id}` }, { label: "Kiểm tra" }]} />
      {cards.length < 2 ? (
        <EmptyState
          icon={ListChecks}
          title="Cần ít nhất 2 thẻ để kiểm tra"
          description="Thêm thêm thẻ vào nhóm này rồi quay lại nhé."
          action={<ButtonLink href={`/sets/${set.id}`}>Về nhóm thẻ</ButtonLink>}
        />
      ) : (
        <QuizSession
          setId={set.id}
          cards={cards.map(toCardDTO)}
          english={set.category.isEnglish}
          knownIds={knownIds}
        />
      )}
    </div>
  );
}
