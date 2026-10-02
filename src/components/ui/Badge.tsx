import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "blue" | "green" | "gray";

const tones: Record<BadgeTone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  gray: "bg-ink-100 text-ink-600 ring-ink-500/20",
};

export function Badge({
  tone = "blue",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}
      {...props}
    />
  );
}
