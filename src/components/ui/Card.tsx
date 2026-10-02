import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-ink-200 bg-white p-4 shadow-[0_1px_2px_rgb(70_63_53/0.06),0_6px_20px_-12px_rgb(70_63_53/0.25)] sm:p-5", className)} {...props} />;
}
