import { BookOpen, CircleUserRound, Search } from "lucide-react";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { InstallButton } from "@/components/pwa/InstallButton";
import { Container } from "./Container";
import { HideOnAuthRoutes } from "./HideOnAuthRoutes";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const [user, t] = await Promise.all([getCurrentUser(), getT("layout")]);
  return (
    <HideOnAuthRoutes>
      <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-paper/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="group flex min-h-11 items-center gap-2.5 rounded-xl font-display text-lg font-bold text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <span className="flex size-9 -rotate-6 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_3px_0_var(--color-brand-800)] transition-transform duration-300 group-hover:rotate-3">
              <BookOpen className="size-5" aria-hidden />
            </span>
            Knowledge
          </Link>
          <div className="flex items-center gap-1">
            <InstallButton />
            {user && (
              <Link
                href="/search"
                aria-label={t("header.search")}
                title={t("header.searchTitle")}
                className="flex size-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <Search className="size-5" aria-hidden />
              </Link>
            )}
            {!user && (
              <Link
                href="/about"
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                {t("header.about")}
              </Link>
            )}
            {user && <NotificationBell />}
            {user ? (
              <UserMenu
                name={user.name}
                email={user.email}
                role={user.role}
                avatarUrl={user.avatarUrl}
                gender={user.gender}
              />
            ) : (
              <Link
                href="/login"
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <CircleUserRound className="size-5" aria-hidden />
                {t("header.login")}
              </Link>
            )}
          </div>
        </Container>
      </header>
    </HideOnAuthRoutes>
  );
}
