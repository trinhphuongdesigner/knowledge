import Link from "next/link";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/utils";

export type AccountTab = "history" | "stats" | "settings" | "profile";

export const ACCOUNT_TABS: AccountTab[] = ["history", "stats", "settings", "profile"];

export async function AccountTabs({ active }: { active: AccountTab }) {
  const t = await getT("account");
  return (
    <nav aria-label={t("tabsLabel")} className="mb-6 flex gap-1 overflow-x-auto border-b border-ink-200">
      {ACCOUNT_TABS.map((id) => {
        const current = id === active;
        return (
          <Link
            key={id}
            href={`/account?tab=${id}`}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
              current
                ? "border-brand-600 text-accent"
                : "border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            {t(`tabs.${id}`)}
          </Link>
        );
      })}
    </nav>
  );
}
