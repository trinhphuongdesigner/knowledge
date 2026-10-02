import Link from "next/link";
import { cn } from "@/lib/utils";

export type AccountTab = "history" | "profile" | "password";

const TABS: { id: AccountTab; label: string }[] = [
  { id: "history", label: "Lịch sử học" },
  { id: "profile", label: "Thông tin" },
  { id: "password", label: "Mật khẩu" },
];

export function AccountTabs({ active }: { active: AccountTab }) {
  return (
    <nav aria-label="Quản lý tài khoản" className="mb-6 flex gap-1 border-b border-ink-200">
      {TABS.map((t) => {
        const current = t.id === active;
        return (
          <Link
            key={t.id}
            href={`/account?tab=${t.id}`}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px flex min-h-11 items-center border-b-2 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
              current
                ? "border-brand-600 text-brand-600"
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
