import { FileUp, Pencil, Play } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardList } from "@/components/cards/CardList";
import { Container } from "@/components/layout/Container";
import { LevelBadge } from "@/components/sets/LevelBadge";
import { Badge, ButtonLink } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { toSetDetailDTO } from "@/lib/dto";
import { isUuid } from "@/lib/ids";
import { CATEGORY_LABELS } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chi tiết bộ học — Knowledge" };

export default async function SetDetailPage({ params }: PageProps<"/sets/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const row = await db.studySet.findFirst({
    where: { id, userId: user.id },
    include: { cards: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!row) notFound();
  const set = toSetDetailDTO(row);
  const empty = set.cardCount === 0;

  return (
    <Container className="py-6 sm:py-8">
      <CardList
        setId={set.id}
        initialCards={set.cards}
        english={set.category === "ENGLISH"}
        info={
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone={set.category === "IT" ? "blue" : "green"}>{CATEGORY_LABELS[set.category]}</Badge>
              <LevelBadge level={set.level} />
              <span className="text-sm text-slate-500">{set.cardCount} thẻ</span>
            </div>
            <h1 className="break-words text-2xl font-bold text-slate-900">{set.title}</h1>
            {set.description && (
              <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{set.description}</p>
            )}
          </div>
        }
        actions={
          <>
            {empty ? (
              <span
                aria-disabled="true"
                title="Thêm thẻ để bắt đầu học"
                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white opacity-50"
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
            <ButtonLink href={`/sets/${set.id}/import`} variant="secondary">
              <FileUp className="size-4" aria-hidden />
              Import
            </ButtonLink>
            <ButtonLink href={`/sets/${set.id}/edit`} variant="secondary">
              <Pencil className="size-4" aria-hidden />
              Sửa
            </ButtonLink>
          </>
        }
      />
    </Container>
  );
}
