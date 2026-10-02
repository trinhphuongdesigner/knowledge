"use client";

import { Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { LEVELS, LEVEL_LABELS, type CategoryDTO } from "@/lib/validators";

const LEVEL_OPTIONS = [
  { value: "", label: "Mọi cấp độ" },
  ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
];

export function SetFilters({ categories }: { categories: CategoryDTO[] }) {
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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="-mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label="Lọc theo danh mục" className="flex gap-2">
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
                    "min-h-11 max-w-56 shrink-0 truncate rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
            <Select
              aria-label="Lọc theo cấp độ"
              value={level}
              onValueChange={(v) => push({ level: v })}
              options={LEVEL_OPTIONS}
            />
          </div>
          <Link
            href="/categories"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-ink-600 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Settings2 className="size-4" aria-hidden />
            Quản lý<span className="sr-only"> danh mục</span>
          </Link>
        </div>
      </div>
      <div className="relative lg:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm nhóm thẻ..."
          aria-label="Tìm nhóm thẻ"
          className="min-h-11 w-full rounded-xl border border-ink-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-2 focus:outline-brand-600/30"
        />
      </div>
    </div>
  );
}
