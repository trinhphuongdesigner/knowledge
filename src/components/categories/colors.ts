import type { CategoryColor } from "@/lib/validators";

/** Static Tailwind class names per category color (v4 needs full literal class strings). */
export type CategoryColorClasses = { label: string; badge: string; dot: string; swatch: string; ring: string };

export const CATEGORY_COLOR_CLASSES: Record<CategoryColor, CategoryColorClasses> = {
  BLUE: {
    label: "Xanh dương",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
    swatch: "bg-blue-500",
    ring: "ring-blue-500",
  },
  GREEN: {
    label: "Xanh lá",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
    dot: "bg-green-500",
    swatch: "bg-green-500",
    ring: "ring-green-500",
  },
  AMBER: {
    label: "Hổ phách",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    swatch: "bg-amber-500",
    ring: "ring-amber-500",
  },
  PURPLE: {
    label: "Tím",
    badge: "bg-purple-50 text-purple-700 ring-purple-600/20",
    dot: "bg-purple-500",
    swatch: "bg-purple-500",
    ring: "ring-purple-500",
  },
  ROSE: {
    label: "Hồng",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    swatch: "bg-rose-500",
    ring: "ring-rose-500",
  },
  SLATE: {
    label: "Xám",
    badge: "bg-slate-100 text-slate-700 ring-slate-500/20",
    dot: "bg-slate-500",
    swatch: "bg-slate-500",
    ring: "ring-slate-500",
  },
};

export const colorClasses = (c: CategoryColor) => CATEGORY_COLOR_CLASSES[c] ?? CATEGORY_COLOR_CLASSES.BLUE;
