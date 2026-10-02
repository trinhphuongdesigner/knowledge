import { cn } from "@/lib/utils";
import type { CategoryColor } from "@/lib/validators";
import { colorClasses } from "./colors";

export function CategoryBadge({
  category,
  className,
}: {
  category: { name: string; color: CategoryColor };
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorClasses(category.color).badge,
        className,
      )}
    >
      <span className="truncate">{category.name}</span>
    </span>
  );
}
