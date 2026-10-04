import { FileUp, ListChecks, Pencil, Play } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardList } from "@/components/cards/CardList";
import { Container } from "@/components/layout/Container";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { SetSaveButtons } from "@/components/library/SetSaveButtons";
import { getReviewFlags } from "@/components/review/queries";
import { ExportMenu } from "@/components/sets/ExportMenu";
import { LevelBadge } from "@/components/sets/LevelBadge";
import { ShareButton } from "@/components/sets/ShareButton";
import { Badge, ButtonLink, Breadcrumbs } from "@/components/ui";
import { computeSetStatus } from "@/lib/set-status";
import { getReadableSet } from "@/lib/access";
import { requireUser } from "@/lib/auth/dal";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";
import { db } from "@/lib/db";
import { toSetDetailDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("sets");
  return { title: t("detail.metaTitle") };
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" };

export default async function SetDetailPage({ params }: PageProps<"/sets/[id]">) {
  const user = await requireUser();
  const t = await getT("sets");
  const locale = await getLocale();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const readable = await getReadableSet(user.id, id);
  if (!readable) notFound();
  const { isOwner } = readable;
  const [cards, progress, flags] = await Promise.all([
    db.card.findMany({ where: { setId: id }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    db.studyProgress.findUnique({
      where: { userId_setId: { userId: user.id, setId: id } },
      select: { known: true, completedAt: true, quizBestPct: true },
    }),
    getReviewFlags(user.id, id),
  ]);
  const row = readable.set;
  const set = toSetDetailDTO({ ...row, cards }, { isOwner, ownerName: row.user.name });
  const knownIds = progress?.known ?? [];
  const status = computeSetStatus({
    cardIds: cards.map((c) => c.id),
    known: knownIds,
    quizBestPct: progress?.quizBestPct ?? null,
  });
  const empty = set.cardCount === 0;
  const completedAt = !empty ? progress?.completedAt ?? null : null;
  const canQuiz = set.cardCount >= 2;
  const quizFirst = completedAt !== null && canQuiz;

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: set.title }]} />
      <CardList
        setId={set.id}
        initialCards={set.cards}
        english={set.category.isEnglish}
        knownIds={knownIds}
        starredIds={flags.starredIds}
        hardIds={flags.hardIds}
        readOnly={!isOwner}
        info={
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={set.category} />
              <LevelBadge level={set.level} />
              <span className="text-sm text-ink-500">{t("cardCount", { count: set.cardCount })}</span>
              {isOwner && set.visibility === "LINK" && <Badge tone="blue">{t("detail.anyoneWithLink")}</Badge>}
              {isOwner && set.visibility === "PUBLIC" && (
                <Badge tone={row.approved ? "green" : "gray"}>
                  {row.approved ? t("detail.publicApproved") : t("detail.publicPending")}
                </Badge>
              )}
              {!isOwner && <Badge tone="gray">{t("detail.readOnly")}</Badge>}
              {completedAt && <Badge tone="green">{t("detail.finished", { date: formatDate(locale, completedAt, DATE_OPTIONS) })}</Badge>}
              {status.mastered && <Badge tone="green">{t("detail.mastered")}</Badge>}
              {status.quizPassed ? (
                <Badge className="bg-sun-300 text-ink-900 ring-sun-400/60">{t("detail.quizPassed", { pct: status.quizBestPct ?? 0 })}</Badge>
              ) : (
                status.quizBestPct !== null && <Badge tone="gray">{t("detail.quizBest", { pct: status.quizBestPct })}</Badge>
              )}
            </div>
            <h1 className="break-words text-2xl font-bold text-ink-900">{set.title}</h1>
            {!isOwner && (
              <p className="mt-1 text-sm text-ink-500">{t("detail.by", { name: row.user.name ?? t("detail.anotherUser") })}</p>
            )}
            {set.description && (
              <p className="mt-2 whitespace-pre-wrap break-words text-ink-600">{set.description}</p>
            )}
            {!isOwner && (
              <SetSaveButtons setId={set.id} subscribed unsaveLabel size="md" className="mt-3" />
            )}
          </div>
        }
        actions={
          <>
            {empty ? (
              <span
                aria-disabled="true"
                title={t("detail.addCardsToStudy")}
                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white opacity-50"
              >
                <Play className="size-4" aria-hidden />
                {t("detail.studyNow")}
              </span>
            ) : (
              <ButtonLink href={`/sets/${set.id}/study`} variant={quizFirst ? "secondary" : undefined}>
                <Play className="size-4" aria-hidden />
                {completedAt ? t("detail.studyAgain") : t("detail.studyNow")}
              </ButtonLink>
            )}
            {canQuiz && (
              <ButtonLink href={`/sets/${set.id}/quiz`} variant={quizFirst ? undefined : "secondary"}>
                <ListChecks className="size-4" aria-hidden />
                {quizFirst ? t("detail.takeQuiz") : t("detail.quiz")}
              </ButtonLink>
            )}
            {!empty && <ExportMenu setId={set.id} />}
            {isOwner && (
              <>
                <ShareButton
                  setId={set.id}
                  visibility={set.visibility}
                  shareToken={set.shareToken ?? null}
                  approved={row.approved}
                />
                <ButtonLink href={`/sets/${set.id}/import`} variant="secondary">
                  <FileUp className="size-4" aria-hidden />
                  {t("detail.import")}
                </ButtonLink>
                <ButtonLink href={`/sets/${set.id}/edit`} variant="secondary">
                  <Pencil className="size-4" aria-hidden />
                  {t("detail.edit")}
                </ButtonLink>
              </>
            )}
          </>
        }
      />
    </Container>
  );
}
