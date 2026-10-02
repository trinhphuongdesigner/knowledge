import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { EmptyState, ButtonLink } from "@/components/ui";
import { ReviewSession } from "@/components/review/ReviewSession";
import { getReviewQueue } from "@/components/review/queries";
import { parseOnly } from "@/components/review/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ôn hôm nay — Knowledge" };

const FILTERS = [
  { key: undefined, label: "Hôm nay", href: "/review" },
  { key: "starred", label: "Chỉ thẻ đánh sao", href: "/review?only=starred" },
  { key: "hard", label: "Chỉ từ khó", href: "/review?only=hard" },
] as const;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const only = parseOnly((await searchParams).only);
  const queue = await getReviewQueue(user.id, only);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-ink-900">Ôn tập</h1>
        <nav aria-label="Lọc thẻ ôn" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
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
      </div>
      {queue.items.length === 0 ? (
        <EmptyState
          icon={Star}
          title={
            only === "starred"
              ? "Chưa có thẻ nào được đánh sao"
              : only === "hard"
                ? "Chưa có từ khó nào"
                : "Hôm nay bạn đã ôn xong 🎉"
          }
          description={
            only
              ? "Đánh sao thẻ trong lúc học, hoặc ôn thêm để hệ thống nhận ra từ khó."
              : `Đã ôn ${queue.doneToday}/${queue.goal} thẻ hôm nay. Hẹn bạn ngày mai!`
          }
          action={<ButtonLink href="/">Về trang chủ</ButtonLink>}
        />
      ) : (
        <ReviewSession key={only ?? "daily"} items={queue.items} only={only} />
      )}
    </div>
  );
}
