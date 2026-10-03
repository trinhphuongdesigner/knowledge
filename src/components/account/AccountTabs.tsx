import Link from "next/link";
import { cn } from "@/lib/utils";

export type AccountTab = "history" | "stats" | "settings" | "profile";

export const ACCOUNT_TABS: AccountTab[] = ["history", "stats", "settings", "profile"];

const TABS: { id: AccountTab; label: string }[] = [
  { id: "history", label: "Lịch sử học" },
  { id: "stats", label: "Thống kê" },
  { id: "settings", label: "Cài đặt học" },
  { id: "profile", label: "Thông tin" },
];

export function AccountTabs({ active }: { active: AccountTab }) {
  return (
    <nav aria-label="Quản lý tài khoản" className="mb-6 flex gap-1 overflow-x-auto border-b border-ink-200">
      {TABS.map((t) => {
        const current = t.id === active;
        return (
          <Link
            key={t.id}
            href={`/account?tab=${t.id}`}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
              current
                ? "border-brand-600 text-accent"
                : "border-transparent text-ink-600 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
