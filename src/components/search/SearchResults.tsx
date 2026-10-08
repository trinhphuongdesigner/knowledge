import { SearchX } from "lucide-react";
import Link from "next/link";
import { Highlight } from "@/components/search/Highlight";
import { Card, EmptyState } from "@/components/ui";
import { getT } from "@/i18n/server";
import { SEARCH_LIMIT, searchCards } from "@/lib/search";
import type { SearchResultDTO } from "@/lib/validators";

/** Kết quả tìm kiếm (tầng 2): truy vấn nằm trong Suspense để ô tìm kiếm hiện ngay. */
export async function SearchResults({ userId, q }: { userId: string; q: string }) {
  const t = await getT("search");
  const results = await searchCards(userId, q);

  const groups = new Map<string, { title: string; items: SearchResultDTO[] }>();
  for (const r of results) {
    const g = groups.get(r.setId) ?? { title: r.setTitle, items: [] };
    g.items.push(r);
    groups.set(r.setId, g);
  }

  if (results.length === 0) {
    return <EmptyState icon={SearchX} title={t("noResultsTitle")} description={t("noResultsDescription", { q })} />;
  }

  return (
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
  );
}
