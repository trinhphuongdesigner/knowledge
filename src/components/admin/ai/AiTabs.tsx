import Link from "next/link";
import type { TFunction } from "@/i18n/translate";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/ai", key: "tabUsage" },
  { href: "/admin/ai/providers", key: "tabProviders" },
] as const;

/** Tab con của mục "Dùng AI": thống kê lượt dùng ↔ cấu hình nhà cung cấp. */
export function AiTabs({ active, t }: { active: (typeof TABS)[number]["href"]; t: TFunction<"admin"> }) {
  return (
    <nav aria-label={t("ai.tabsAria")} className="flex gap-1 border-b border-ink-200">
      {TABS.map(({ href, key }) => (
        <Link
          key={href}
          href={href}
          aria-current={active === href ? "page" : undefined}
          className={cn(
            "-mb-px flex min-h-11 items-center border-b-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
            active === href ? "border-brand-600 text-accent" : "border-transparent text-ink-600 hover:text-accent",
          )}
        >
          {t(`ai.${key}`)}
        </Link>
      ))}
    </nav>
  );
}
