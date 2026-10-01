"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LEVELS, LEVEL_LABELS } from "@/lib/validators";

const TABS = [
  { value: "", label: "Tất cả" },
  { value: "IT", label: "Công nghệ (IT)" },
  { value: "ENGLISH", label: "Tiếng Anh" },
];

export function SetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const level = params.get("level") ?? "";
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          role="tablist"
          aria-label="Lọc theo lĩnh vực"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          {TABS.map((t) => {
            const active = category === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => push({ category: t.value })}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <select
          value={level}
          onChange={(e) => push({ level: e.target.value })}
          aria-label="Lọc theo cấp độ"
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-2 focus:outline-blue-600/30 sm:w-44"
        >
          <option value="">Mọi cấp độ</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
      </div>
      <div className="relative lg:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm bộ học..."
          aria-label="Tìm bộ học"
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-2 focus:outline-blue-600/30"
        />
      </div>
    </div>
  );
}
