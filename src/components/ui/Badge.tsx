import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "blue" | "green" | "gray";

const tones: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
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
