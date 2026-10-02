import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Highlight } from "@/components/search/Highlight";
import { SearchBox } from "@/components/search/SearchBox";
import { Card, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { SEARCH_LIMIT, SEARCH_MIN_CHARS, searchCards } from "@/lib/search";
import type { SearchResultDTO } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tìm kiếm — Knowledge" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
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
      <h1 className="text-2xl font-bold text-ink-900">Tìm kiếm</h1>
      <SearchBox defaultValue={q} />

      {q === "" && <p className="text-sm text-ink-600">Tìm trong câu hỏi, đáp án và giải thích của mọi thẻ bạn có.</p>}
      {tooShort && <p className="text-sm text-ink-600">Nhập ít nhất {SEARCH_MIN_CHARS} ký tự.</p>}
      {q.length >= SEARCH_MIN_CHARS && results.length === 0 && (
        <EmptyState icon={SearchX} title="Không tìm thấy kết quả" description={`Không có thẻ nào khớp với “${q}”.`} />
      )}

      {results.length > 0 && (
        <>
          <p aria-live="polite" className="text-sm text-ink-600">
            {results.length >= SEARCH_LIMIT ? `Hiển thị ${SEARCH_LIMIT} kết quả đầu tiên` : `${results.length} kết quả`} ·{" "}
            {groups.size} bộ thẻ
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
