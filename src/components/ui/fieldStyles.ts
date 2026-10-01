import { cn } from "@/lib/utils";

export const fieldBase =
  "w-full rounded-xl border bg-white px-3.5 text-base text-slate-900 shadow-sm transition-colors " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100";

export const fieldClass = (error?: string, className?: string) =>
  cn(fieldBase, error ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-600", className);
