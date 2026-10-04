"use client";

import {
  Bell,
  BrainCircuit,
  FolderCog,
  LayoutDashboard,
  Library,
  ScrollText,
  Server,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

type NavKey = "overview" | "users" | "categories" | "library" | "notifications" | "ai" | "audit" | "system";
type Item = { href: string; key: NavKey; icon: LucideIcon; exact?: boolean };

export const ADMIN_NAV_ITEMS: Item[] = [
  { href: "/admin", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/categories", key: "categories", icon: FolderCog },
  { href: "/admin/sets", key: "library", icon: Library },
  { href: "/admin/notifications", key: "notifications", icon: Bell },
  { href: "/admin/ai", key: "ai", icon: BrainCircuit },
  { href: "/admin/audit", key: "audit", icon: ScrollText },
  { href: "/admin/system", key: "system", icon: Server },
];

export function AdminNav() {
  const pathname = usePathname();
  const t = useT("admin");
  return (
    <nav aria-label={t("nav.aria")} className="lg:w-56 lg:shrink-0">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {ADMIN_NAV_ITEMS.map(({ href, key, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                  active
                    ? "bg-brand-50 text-accent"
                    : "text-ink-600 hover:bg-ink-100 hover:text-accent",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(`nav.${key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
