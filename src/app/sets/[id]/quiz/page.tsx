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
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("quiz");
  return { title: t("meta.title") };
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT("quiz");
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
      <Breadcrumbs items={[{ label: t("breadcrumb.home"), href: "/" }, { label: set.title, href: `/sets/${set.id}` }, { label: t("breadcrumb.quiz") }]} />
      {cards.length < 2 ? (
        <EmptyState
          icon={ListChecks}
          title={t("page.needTwoTitle")}
          description={t("page.needTwoDescription")}
          action={<ButtonLink href={`/sets/${set.id}`}>{t("page.backToSet")}</ButtonLink>}
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
