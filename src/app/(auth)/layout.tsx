import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-blue-50 px-4 py-10">
      <Link
        href="/"
        className="mb-6 flex min-h-11 items-center gap-2 rounded-lg text-2xl font-bold text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <BookOpen className="size-7" aria-hidden />
        Knowledge
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  );
}
