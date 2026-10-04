import { BadgeCheck, Layers, Trophy, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Card } from "@/components/ui";
import { getT } from "@/i18n/server";
import { LevelBadge } from "./LevelBadge";
import type { SetStatus } from "@/lib/set-status";
import type { StudySetDTO } from "@/lib/validators";

const RIBBON_CLIP = "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)";

/** Thẻ đánh dấu (bookmark) treo ở mép trên của card. */
function Ribbon({ icon: Icon, label, className }: { icon: LucideIcon; label: string; className: string }) {
  return (
    <span
      title={label}
      style={{ clipPath: RIBBON_CLIP }}
      className={`flex h-9 w-6 items-start justify-center pt-2.5 ${className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export async function SetCard({
  set,
  hideCategory,
  hideLevel,
  status,
}: {
  set: StudySetDTO;
  hideCategory?: boolean;
  hideLevel?: boolean;
  status?: SetStatus;
}) {
  const t = await getT("sets");
  const ribbons = (status?.mastered ? 1 : 0) + (status?.quizPassed ? 1 : 0);
  return (
    <Link
      href={`/sets/${set.id}`}
      className="group/card relative block h-full rounded-2xl transition-transform duration-200 active:scale-[0.985] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      {/* Xấp thẻ phía sau: lộ ra khi hover */}
      <span
        aria-hidden
        className="absolute inset-x-2 inset-y-0 rounded-2xl border border-ink-200 bg-ink-100 transition-transform duration-300 group-hover/card:translate-y-2 group-hover/card:rotate-2 motion-reduce:transition-none"
      />
      <Card className="relative flex h-full flex-col gap-3 transition-[transform,border-color] duration-300 group-hover/card:-translate-y-1 group-hover/card:border-brand-300 motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0">
        {ribbons > 0 && status && (
          <div className="absolute -top-1 right-4 flex items-start gap-1">
            {status.mastered && <Ribbon icon={BadgeCheck} label={t("detail.mastered")} className="bg-green-600 text-white" />}
            {status.quizPassed && (
              <Ribbon icon={Trophy} label={t("detail.quizPassed", { pct: status.quizBestPct ?? 0 })} className="bg-sun-400 text-ink-900" />
            )}
          </div>
        )}
        <div className={`flex items-start justify-between gap-2 ${ribbons === 2 ? "pr-[3.25rem]" : ribbons === 1 ? "pr-7" : ""}`}>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {!hideCategory && <CategoryBadge category={set.category} />}
            {!hideLevel && <LevelBadge level={set.level} />}
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
            <Layers className="size-3.5" aria-hidden />
            {t("cardCount", { count: set.cardCount })}
          </span>
        </div>
        <h2 className="line-clamp-2 break-words text-base font-semibold text-ink-900 group-hover/card:text-accent-strong">{set.title}</h2>
        {set.description && <p className="line-clamp-3 break-words text-sm text-ink-600">{set.description}</p>}
        {!set.isOwner && (
          <p className="mt-auto flex items-center gap-1.5 text-xs text-ink-500">
            <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">{t("detail.readOnly")}</span>
            {t("detail.by", { name: set.ownerName ?? t("detail.anotherUser") })}
          </p>
        )}
      </Card>
    </Link>
  );
}
