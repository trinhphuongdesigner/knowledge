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
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <Card className="flex h-full flex-col gap-3 transition-shadow hover:border-blue-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {!hideCategory && <CategoryBadge category={set.category} />}
            {!hideLevel && <LevelBadge level={set.level} />}
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm text-slate-500">
            <Layers className="size-4" aria-hidden />
            {set.cardCount} thẻ
          </span>
        </div>
        <h2 className="line-clamp-2 break-words text-base font-semibold text-slate-900">{set.title}</h2>
        {set.description && <p className="line-clamp-3 break-words text-sm text-slate-600">{set.description}</p>}
      </Card>
    </Link>
  );
}
