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
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

export const ADMIN_NAV_ITEMS: Item[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Tài khoản", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: FolderCog },
  { href: "/admin/sets", label: "Thư viện", icon: Library },
  { href: "/admin/notifications", label: "Thông báo", icon: Bell },
  { href: "/admin/ai", label: "AI", icon: BrainCircuit },
  { href: "/admin/audit", label: "Nhật ký", icon: ScrollText },
  { href: "/admin/system", label: "Hệ thống", icon: Server },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Quản trị" className="lg:w-56 lg:shrink-0">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
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
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
