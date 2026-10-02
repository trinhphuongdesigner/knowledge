import { BookOpen, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { InstallButton } from "@/components/pwa/InstallButton";
import { Container } from "./Container";
import { HideOnAuthRoutes } from "./HideOnAuthRoutes";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <HideOnAuthRoutes>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 text-lg font-bold text-blue-600"
          >
            <BookOpen className="size-6" aria-hidden />
            Knowledge
          </Link>
          <div className="flex items-center gap-1">
            <InstallButton />
            {user ? (
              <UserMenu name={user.name} email={user.email} />
            ) : (
              <Link
                href="/login"
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <CircleUserRound className="size-5" aria-hidden />
                Đăng nhập
              </Link>
            )}
          </div>
        </Container>
      </header>
    </HideOnAuthRoutes>
  );
}
