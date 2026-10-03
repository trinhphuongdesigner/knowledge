import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string }; // last crumb = current page, no href

const linkCls =
  "inline-flex min-h-11 items-center text-accent hover:underline sm:min-h-9";

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const parent = items.length > 2 ? items[items.length - 2] : undefined;
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-3 text-sm", className)}>
      {parent?.href && (
        <Link href={parent.href} className={cn(linkCls, "max-w-full font-medium sm:hidden")}>
          <span aria-hidden className="mr-1">←</span>
          <span className="truncate">{parent.label}</span>
        </Link>
      )}
      <ol className={cn("min-w-0 flex-wrap items-center", parent?.href ? "hidden sm:flex" : "flex")}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={cn("flex min-w-0 items-center", last && "text-ink-600")}>
              {i > 0 && <ChevronRight className="mx-1 size-4 shrink-0 text-ink-400" aria-hidden />}
              {item.href && !last ? (
                <Link href={item.href} className={cn(linkCls, "max-w-[12rem] sm:max-w-[16rem]")}>
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="max-w-[14rem] truncate sm:max-w-xs">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
