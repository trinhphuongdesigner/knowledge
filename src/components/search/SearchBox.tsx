"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useT } from "@/i18n/client";

/** Ô tìm kiếm (GET /search?q=). Phím "/" đưa con trỏ vào ô khi không đang gõ ở ô khác. */
export function SearchBox({ defaultValue }: { defaultValue: string }) {
  const t = useT("search");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      ref.current?.focus();
      ref.current?.select();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form action="/search" role="search" className="relative">
      <label htmlFor="global-search" className="sr-only">
        {t("box.label")}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        ref={ref}
        id="global-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={t("box.placeholder")}
        autoComplete="off"
        autoFocus
        maxLength={100}
        enterKeyHint="search"
        className="min-h-12 w-full rounded-xl border border-ink-200 bg-surface pr-4 pl-11 text-base text-ink-900 shadow-sm placeholder:text-ink-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600"
      />
    </form>
  );
}
