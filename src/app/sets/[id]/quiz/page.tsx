import { ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizSession } from "@/components/quiz/QuizSession";
import { ButtonLink, EmptyState } from "@/components/ui";
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
  const set = await db.studySet.findFirst({
    where: { id, userId: user.id },
    include: { category: true, cards: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!set) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <Link
        href={`/sets/${set.id}`}
        className="mb-4 inline-flex min-h-11 max-w-full items-center text-sm font-medium text-blue-600 hover:underline"
      >
        <span className="truncate">← {set.title}</span>
      </Link>
      {set.cards.length < 2 ? (
        <EmptyState
          icon={ListChecks}
          title="Cần ít nhất 2 thẻ để kiểm tra"
          description="Thêm thêm thẻ vào nhóm này rồi quay lại nhé."
          action={<ButtonLink href={`/sets/${set.id}`}>Về nhóm thẻ</ButtonLink>}
        />
      ) : (
        <QuizSession cards={set.cards.map(toCardDTO)} english={set.category.isEnglish} />
      )}
    </div>
  );
}
