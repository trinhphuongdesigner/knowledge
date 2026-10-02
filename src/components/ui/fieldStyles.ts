import { cn } from "@/lib/utils";

export const fieldBase =
  "w-full rounded-xl border bg-white px-3.5 text-base text-ink-900 shadow-[inset_0_1px_2px_rgb(70_63_53/0.06)] transition-[border-color,box-shadow] " +
  "placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 " +
  "disabled:cursor-not-allowed disabled:bg-ink-100";

export const fieldClass = (error?: string, className?: string) =>
  cn(fieldBase, error ? "border-red-500 focus:border-red-500" : "border-ink-200 focus:border-brand-600", className);
