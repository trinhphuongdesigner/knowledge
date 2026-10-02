import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Vài tấm thẻ trang trí nằm nghiêng phía sau */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="index-card absolute top-[12%] left-[8%] h-44 w-64 -rotate-12 rounded-2xl border border-ink-200 shadow-lg" />
        <div className="absolute right-[9%] bottom-[14%] h-40 w-60 rotate-6 rounded-2xl bg-brand-600 shadow-[0_6px_0_var(--color-brand-800)]" />
        <div className="absolute top-[18%] right-[14%] h-24 w-36 rotate-12 rounded-2xl bg-sun-300 shadow-[0_5px_0_var(--color-sun-400)]" />
      </div>
      <Link
        href="/"
        className="relative z-10 mb-6 flex min-h-11 items-center gap-3 rounded-lg font-display text-2xl font-bold text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <span className="flex size-11 -rotate-6 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_3px_0_var(--color-brand-800)]">
          <BookOpen className="size-6" aria-hidden />
        </span>
        Knowledge
      </Link>
      <div className="relative z-10 w-full max-w-sm animate-rise rounded-3xl border border-ink-200 bg-white p-6 shadow-[0_2px_4px_rgb(70_63_53/0.06),0_24px_48px_-24px_rgb(70_63_53/0.35)] motion-reduce:animate-none sm:p-8">
        {children}
      </div>
    </main>
  );
}
