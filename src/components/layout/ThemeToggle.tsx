"use client";

import { Laptop, Moon, Sun, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

export type ThemeChoice = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "knowledge:theme";
export const THEME_COOKIE = "kn_theme";

const OPTIONS: { value: ThemeChoice; Icon: LucideIcon }[] = [
  { value: "system", Icon: Laptop },
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
];

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // storage blocked
  }
  const m = document.cookie.match(/(?:^|; )kn_theme=([^;]*)/);
  const c = m?.[1];
  return c === "light" || c === "dark" ? c : "system";
}

/** Áp theme lên <html> ngay lập tức (cùng logic với script chặn trong layout). */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function persistTheme(choice: ThemeChoice) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // storage blocked
  }
  document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=31536000; SameSite=Lax`;
}

export function ThemeToggle() {
  const t = useT("layout");
  const [choice, setChoice] = useState<ThemeChoice>(() => (typeof document === "undefined" ? "system" : readChoice()));

  function select(next: ThemeChoice) {
    setChoice(next);
    applyTheme(next);
    persistTheme(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let to = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (index + 1) % OPTIONS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (index + OPTIONS.length - 1) % OPTIONS.length;
    if (to < 0) return;
    e.preventDefault();
    select(OPTIONS[to].value);
    (e.currentTarget.parentElement?.children[to] as HTMLElement | undefined)?.focus();
  }

  return (
    <div className="px-3 py-2">
      <p id="theme-label" className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {t("theme.label")}
      </p>
      <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-3 gap-1 rounded-xl bg-ink-100 p-1">
        {OPTIONS.map(({ value, Icon }, i) => {
          const active = choice === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => select(value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
                active ? "bg-surface text-accent-strong shadow-sm" : "text-ink-600 hover:text-ink-900",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(`theme.${value}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
