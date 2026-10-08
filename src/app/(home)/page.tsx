import { Library } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { HomeSets } from "@/components/home/HomeSets";
import { FiltersSkeleton, SetListSkeleton, StatCardSkeleton } from "@/components/home/HomeSkeleton";
import { DueTodayCard } from "@/components/review/DueTodayCard";
import { StreakCard } from "@/components/stats/StreakCard";
import { CreateSetButton } from "@/components/sets/CreateSetButton";
import { SetFilters } from "@/components/sets/SetFilters";
import { ButtonLink, RichText } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, t] = await Promise.all([requireUser(), getT("layout")]);
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const category = one(sp.category);
  const level = one(sp.level);
  const q = one(sp.q)?.trim();
  const categories = await listCategories();
  const isAdmin = user.role === "ADMIN";

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-rise motion-reduce:animate-none">
          <p className="mb-1 text-sm font-medium text-accent-strong">
            {user.name ? t("home.greetingNamed", { name: user.name }) : t("home.greeting")}
          </p>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            <RichText text={t("home.heading")} boldClassName="highlight" />
          </h1>
          <p className="mt-2 text-sm text-ink-600">{t("home.subtitle")}</p>
        </div>
        <CreateSetButton categories={categories} canManageCategories={isAdmin} className="shrink-0" />
      </div>
      <div className="mb-6 grid gap-4 empty:hidden md:grid-cols-2">
        <Suspense fallback={<StatCardSkeleton />}>
          <DueTodayCard userId={user.id} />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <StreakCard userId={user.id} />
        </Suspense>
      </div>
      <div className="mb-6">
        <Suspense fallback={<FiltersSkeleton />}>
          <SetFilters
            categories={categories}
            canManageCategories={isAdmin}
            trailing={
              <ButtonLink href="/library" variant="secondary" className="w-full whitespace-nowrap md:w-auto">
                <Library className="size-4" aria-hidden />
                {t("home.explore")}
              </ButtonLink>
            }
          />
        </Suspense>
      </div>
      <Suspense key={`${category}|${level}|${q}`} fallback={<SetListSkeleton />}>
        <HomeSets userId={user.id} isAdmin={isAdmin} categories={categories} category={category} level={level} q={q} />
      </Suspense>
    </Container>
  );
}
