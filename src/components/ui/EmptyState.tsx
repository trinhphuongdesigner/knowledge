import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-ink-300 bg-surface/70 px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex size-14 -rotate-6 items-center justify-center rounded-2xl bg-sun-200 text-accent-strong shadow-[0_3px_0_var(--color-sun-400)]">
          <Icon className="size-6" aria-hidden />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
