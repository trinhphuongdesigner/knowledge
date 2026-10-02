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
import { Badge, ButtonLink } from "@/components/ui";
import { getReadableSet } from "@/lib/access";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { toSetDetailDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chi tiết nhóm thẻ — Knowledge" };

export default async function SetDetailPage({ params }: PageProps<"/sets/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const readable = await getReadableSet(user.id, id);
  if (!readable) notFound();
  const { isOwner } = readable;
  const [cards, progress, flags] = await Promise.all([
    db.card.findMany({ where: { setId: id }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    db.studyProgress.findUnique({
      where: { userId_setId: { userId: user.id, setId: id } },
      select: { known: true },
    }),
    getReviewFlags(user.id, id),
  ]);
  const row = readable.set;
  const set = toSetDetailDTO({ ...row, cards }, { isOwner, ownerName: row.user.name });
  const knownIds = progress?.known ?? [];
  const empty = set.cardCount === 0;

  return (
    <Container className="py-6 sm:py-8">
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
              <span className="text-sm text-ink-500">{set.cardCount} thẻ</span>
              {isOwner && set.visibility === "LINK" && <Badge tone="blue">Ai có link</Badge>}
              {isOwner && set.visibility === "PUBLIC" && (
                <Badge tone={row.approved ? "green" : "gray"}>
                  {row.approved ? "Công khai · Đã duyệt" : "Công khai · Chờ duyệt"}
                </Badge>
              )}
              {!isOwner && <Badge tone="gray">Chỉ đọc</Badge>}
            </div>
            <h1 className="break-words text-2xl font-bold text-ink-900">{set.title}</h1>
            {!isOwner && (
              <p className="mt-1 text-sm text-ink-500">Của {row.user.name ?? "một người dùng khác"}</p>
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
                title="Thêm thẻ để bắt đầu học"
                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white opacity-50"
              >
                <Play className="size-4" aria-hidden />
                Học ngay
              </span>
            ) : (
              <ButtonLink href={`/sets/${set.id}/study`}>
                <Play className="size-4" aria-hidden />
                Học ngay
              </ButtonLink>
            )}
            {set.cardCount >= 2 && (
              <ButtonLink href={`/sets/${set.id}/quiz`} variant="secondary">
                <ListChecks className="size-4" aria-hidden />
                Kiểm tra
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
                  Import
                </ButtonLink>
                <ButtonLink href={`/sets/${set.id}/edit`} variant="secondary">
                  <Pencil className="size-4" aria-hidden />
                  Sửa
                </ButtonLink>
              </>
            )}
          </>
        }
      />
    </Container>
  );
}
