import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { EmptyState, ButtonLink, Breadcrumbs } from "@/components/ui";
import { ReviewSession } from "@/components/review/ReviewSession";
import { getReviewQueue, reviewRoundKey } from "@/components/review/queries";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("review");
  return { title: t("meta.title") };
}

/**
 * Chỉ thẻ đến hạn hôm nay. Không có thẻ nào → không có phiên ôn; muốn tự học thì vào từng nhóm thẻ.
 * Đến hạn nhiều hơn một lượt → ReviewSession cho "Ôn tiếp", gọi router.refresh() để lấy lượt kế.
 */
export default async function ReviewPage() {
  const t = await getT("review");
  const user = await requireUser();
  const { items, totalDue } = await getReviewQueue(user.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: t("page.home"), href: "/" }, { label: t("page.title") }]} />
      <h1 className="mb-4 text-xl font-bold text-ink-900">{t("page.title")}</h1>
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={t("page.doneTitle")}
          description={t("page.doneDescription")}
          action={<ButtonLink href="/">{t("page.backHome")}</ButtonLink>}
        />
      ) : (
        <ReviewSession key={reviewRoundKey(items)} items={items} totalDue={totalDue} />
      )}
    </div>
  );
}
