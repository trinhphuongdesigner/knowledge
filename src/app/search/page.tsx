import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Highlight } from "@/components/search/Highlight";
import { SearchBox } from "@/components/search/SearchBox";
import { Card, EmptyState, Breadcrumbs } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { getT } from "@/i18n/server";
import { SEARCH_LIMIT, SEARCH_MIN_CHARS, searchCards } from "@/lib/search";
import type { SearchResultDTO } from "@/lib/validators";

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
  const results = q.length >= SEARCH_MIN_CHARS ? await searchCards(user.id, q) : [];

  const groups = new Map<string, { title: string; items: SearchResultDTO[] }>();
  for (const r of results) {
    const g = groups.get(r.setId) ?? { title: r.setTitle, items: [] };
    g.items.push(r);
    groups.set(r.setId, g);
  }

  return (
    <Container className="max-w-3xl space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} className="mb-0" />
      <h1 className="text-2xl font-bold text-ink-900">{t("title")}</h1>
      <SearchBox defaultValue={q} />

      {q === "" && <p className="text-sm text-ink-600">{t("hint")}</p>}
      {tooShort && <p className="text-sm text-ink-600">{t("minChars", { count: SEARCH_MIN_CHARS })}</p>}
      {q.length >= SEARCH_MIN_CHARS && results.length === 0 && (
        <EmptyState icon={SearchX} title={t("noResultsTitle")} description={t("noResultsDescription", { q })} />
      )}

      {results.length > 0 && (
        <>
          <p aria-live="polite" className="text-sm text-ink-600">
            {results.length >= SEARCH_LIMIT
              ? t("showingFirst", { count: SEARCH_LIMIT })
              : t("resultCount", { count: results.length })}{" "}
            · {t("setCount", { count: groups.size })}
          </p>
          <div className="space-y-4">
            {[...groups.entries()].map(([setId, g]) => (
              <Card key={setId} className="space-y-3">
                <Link
                  href={`/sets/${setId}`}
                  className="font-semibold text-ink-900 hover:text-accent focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  {g.title}
                </Link>
                <ul className="divide-y divide-ink-100">
                  {g.items.map((r) => (
                    <li key={r.cardId} className="py-2 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-ink-900">
                        <Highlight text={r.question} term={q} />
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-ink-600">
                        <Highlight text={r.answer} term={q} />
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
