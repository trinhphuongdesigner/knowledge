import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { SearchBox } from "@/components/search/SearchBox";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchResultsSkeleton } from "@/components/search/SearchSkeleton";
import { Breadcrumbs } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { getT } from "@/i18n/server";
import { SEARCH_MIN_CHARS } from "@/lib/search";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("search");
  return { title: t("metaTitle") };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const t = await getT("search");
  const { q: rawQ } = await searchParams;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim().slice(0, 100) ?? "";
  const tooShort = q.length > 0 && q.length < SEARCH_MIN_CHARS;

  return (
    <Container className="max-w-3xl space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("title")}</h1>
      <SearchBox defaultValue={q} />

      {q === "" && <p className="text-sm text-ink-600">{t("hint")}</p>}
      {tooShort && <p className="text-sm text-ink-600">{t("minChars", { count: SEARCH_MIN_CHARS })}</p>}
      {q.length >= SEARCH_MIN_CHARS && (
        <Suspense key={q} fallback={<SearchResultsSkeleton />}>
          <SearchResults userId={user.id} q={q} />
        </Suspense>
      )}
    </Container>
  );
}
