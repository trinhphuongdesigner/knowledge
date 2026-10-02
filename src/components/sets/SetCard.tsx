import { Layers } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Card } from "@/components/ui";
import { LevelBadge } from "./LevelBadge";
import type { StudySetDTO } from "@/lib/validators";

export function SetCard({
  set,
  hideCategory,
  hideLevel,
}: {
  set: StudySetDTO;
  hideCategory?: boolean;
  hideLevel?: boolean;
}) {
  return (
    <Link
      href={`/sets/${set.id}`}
      className="group relative block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      {/* Xấp thẻ phía sau: lộ ra khi hover */}
      <span
        aria-hidden
        className="absolute inset-x-2 inset-y-0 rounded-2xl border border-ink-200 bg-ink-100 transition-transform duration-300 group-hover:translate-y-2 group-hover:rotate-2 motion-reduce:transition-none"
      />
      <Card className="relative flex h-full flex-col gap-3 transition-[transform,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-brand-300 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {!hideCategory && <CategoryBadge category={set.category} />}
            {!hideLevel && <LevelBadge level={set.level} />}
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
            <Layers className="size-3.5" aria-hidden />
            {set.cardCount} thẻ
          </span>
        </div>
        <h2 className="line-clamp-2 break-words text-base font-semibold text-ink-900 group-hover:text-brand-700">{set.title}</h2>
        {set.description && <p className="line-clamp-3 break-words text-sm text-ink-600">{set.description}</p>}
      </Card>
    </Link>
  );
}
