import { BookOpen, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-lg font-bold text-blue-600">
          <BookOpen className="size-6" aria-hidden />
          Knowledge
        </Link>
        <button
          type="button"
          aria-label="Tài khoản"
          title="Tài khoản — sắp ra mắt"
          className="flex size-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <CircleUserRound className="size-7" aria-hidden />
        </button>
      </Container>
    </header>
  );
}
