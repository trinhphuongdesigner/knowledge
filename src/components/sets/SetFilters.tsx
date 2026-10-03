"use client";

import { Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { LEVELS, LEVEL_LABELS, type CategoryDTO } from "@/lib/validators";

const LEVEL_OPTIONS = [
  { value: "", label: "Mọi cấp độ" },
  ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
];

export function SetFilters({
  categories,
  trailing,
  canManageCategories = false,
}: {
  categories: CategoryDTO[];
  trailing?: ReactNode;
  /** Chỉ admin mới quản lý danh mục (dùng chung toàn hệ thống). */
  canManageCategories?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const level = params.get("level") ?? "";
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tabs = [{ value: "", label: "Tất cả" }, ...categories.map((c) => ({ value: c.id, label: c.name }))];

  useEffect(() => () => clearTimeout(timer.current), []);

  function push(next: { category?: string; level?: string; q?: string }) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q: value.trim() }), 300);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: categories, scrolls horizontally on its own line so no pill is ever clipped */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label="Lọc theo danh mục" className="flex w-max gap-2">
          {tabs.map((t) => {
            const active = category === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => push({ category: t.value })}
                className={cn(
                  "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-surface text-ink-700 hover:bg-ink-50",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Row 2: search + level + manage on the left, library link on the right */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-0 md:max-w-sm md:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm nhóm thẻ..."
            aria-label="Tìm nhóm thẻ"
            className="min-h-11 w-full rounded-xl border border-ink-300 bg-surface pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-2 focus:outline-brand-600/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 md:w-48 md:flex-none">
            <Select
              aria-label="Lọc theo cấp độ"
              value={level}
              onValueChange={(v) => push({ level: v })}
              options={LEVEL_OPTIONS}
            />
          </div>
          {canManageCategories && (
            <Link
              href="/admin/categories"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-ink-600 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <Settings2 className="size-4" aria-hidden />
              Quản lý<span className="sr-only"> danh mục</span>
            </Link>
          )}
        </div>
        {trailing && <div className="md:ml-auto md:shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}
