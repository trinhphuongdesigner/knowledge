import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhoneticLine } from "@/components/cards/SpeakButton";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Container } from "@/components/layout/Container";
import { SetSaveButtons } from "@/components/library/SetSaveButtons";
import { LevelBadge } from "@/components/sets/LevelBadge";
import { ButtonLink, Card, Markdown } from "@/components/ui";
import { getSetByShareToken } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const set = await getSetByShareToken(token);
  if (!set) return { title: "Không tìm thấy — Knowledge" };
  return {
    title: `${set.title} — Knowledge`,
    description: set.description ?? `Nhóm thẻ ${set.title} (${set.cards.length} thẻ)`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedSetPage({ params }: Props) {
  const { token } = await params;
  const set = await getSetByShareToken(token);
  if (!set) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === set.userId;
  const sub =
    user && !isOwner
      ? await db.setSubscription.findUnique({ where: { userId_setId: { userId: user.id, setId: set.id } } })
      : null;
  const next = encodeURIComponent(`/s/${token}`);
  const english = set.category.isEnglish;

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <CategoryBadge category={set.category} />
            <LevelBadge level={set.level} />
            <span className="text-sm text-ink-500">{set.cards.length} thẻ</span>
          </div>
          <h1 className="break-words text-2xl font-bold text-ink-900">{set.title}</h1>
          <p className="mt-1 text-sm text-ink-500">Chia sẻ bởi {set.user.name ?? "một người dùng"}</p>
          {set.description && <p className="mt-2 whitespace-pre-wrap break-words text-ink-600">{set.description}</p>}
        </div>
        <div className="shrink-0">
          {isOwner ? (
            <ButtonLink href={`/sets/${set.id}`}>Mở nhóm thẻ của bạn</ButtonLink>
          ) : user ? (
            <SetSaveButtons
              setId={set.id}
              subscribed={!!sub}
              canSubscribe={set.visibility === "LINK" || set.approved}
              size="md"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/login?next=${next}`}>Đăng nhập bằng Google để lưu</ButtonLink>
            </div>
          )}
        </div>
      </div>

      {set.cards.length === 0 ? (
        <p className="text-sm text-ink-500">Nhóm thẻ này chưa có thẻ nào.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {set.cards.map((card, i) => (
            <li key={card.id}>
              <Card>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-accent-strong">
                    {i + 1}
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Câu hỏi</p>
                      <Markdown className="text-ink-900">{card.question}</Markdown>
                      {english && (
                        <PhoneticLine phonetic={card.phonetic || null} partOfSpeech={card.partOfSpeech || null} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Đáp án</p>
                      <Markdown className="text-ink-900">{card.answer}</Markdown>
                      {card.explanation && (
                        <Markdown className="mt-2 text-sm text-ink-500">{card.explanation}</Markdown>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
