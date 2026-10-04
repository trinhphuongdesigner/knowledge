import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { EmptyState, ButtonLink, Breadcrumbs } from "@/components/ui";
import { ReviewSession } from "@/components/review/ReviewSession";
import { getReviewQueue } from "@/components/review/queries";
import { parseOnly } from "@/components/review/session";
import { cn } from "@/lib/utils";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("review");
  return { title: t("meta.title") };
}

const FILTERS = [
  { key: undefined, labelKey: "page.filterToday", href: "/review" },
  { key: "starred", labelKey: "page.filterStarred", href: "/review?only=starred" },
  { key: "hard", labelKey: "page.filterHard", href: "/review?only=hard" },
] as const;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getT("review");
  const user = await requireUser();
  const only = parseOnly((await searchParams).only);
  const queue = await getReviewQueue(user.id, only);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-6">
      <Breadcrumbs items={[{ label: t("page.home"), href: "/" }, { label: t("page.title") }]} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-ink-900">{t("page.title")}</h1>
        <nav aria-label={t("page.filterAria")} className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.labelKey}
              href={f.href}
              aria-current={f.key === only ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
                f.key === only
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50",
              )}
            >
              {t(f.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
      {queue.items.length === 0 ? (
        <EmptyState
          icon={Star}
          title={
            only === "starred"
              ? t("page.emptyStarredTitle")
              : only === "hard"
                ? t("page.emptyHardTitle")
                : t("page.doneTitle")
          }
          description={
            only
              ? t("page.emptyOnlyDescription")
              : t("page.doneDescription", { done: queue.doneToday, goal: queue.goal })
          }
          action={<ButtonLink href="/">{t("page.backHome")}</ButtonLink>}
        />
      ) : (
        <ReviewSession key={only ?? "daily"} items={queue.items} only={only} />
      )}
    </div>
  );
}
