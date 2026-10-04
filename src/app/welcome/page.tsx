import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { safeNext } from "@/lib/auth/redirect";
import { db } from "@/lib/db";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT("auth"))("onboarding.metaTitle") };
}

export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const user = await requireUser({ allowIncomplete: true });
  const t = await getT("auth");
  if (user.onboarded) redirect("/");
  const { next } = await searchParams;
  const dest = typeof next === "string" ? safeNext(next) : "/";
  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { name: true, fullName: true, avatarUrl: true },
  });
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-ink-900">
        <span className="flex size-11 -rotate-6 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_3px_0_var(--color-brand-800)]">
          <BookOpen className="size-6" aria-hidden />
        </span>
        Knowledge
      </div>
      <div className="w-full max-w-sm animate-rise rounded-3xl border border-ink-200 bg-surface p-6 shadow-[0_2px_4px_rgb(70_63_53/0.06),0_24px_48px_-24px_rgb(70_63_53/0.35)] motion-reduce:animate-none sm:p-8">
        <h1 className="mb-1 text-xl font-bold">{t("onboarding.title")}</h1>
        <p className="mb-6 text-sm text-ink-600">
          {t("onboarding.subtitle", { email: user.email })}
        </p>
        <OnboardingForm
          defaultName={record?.name ?? user.name ?? ""}
          defaultFullName={record?.fullName ?? record?.name ?? user.name ?? ""}
          googleAvatarUrl={record?.avatarUrl}
          next={dest === "/" ? undefined : dest}
        />
      </div>
      <form action={logout} className="mt-4">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-ink-600 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {t("onboarding.signOut")}
        </button>
      </form>
    </main>
  );
}
