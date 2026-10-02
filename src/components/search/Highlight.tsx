/** Tô sáng mọi chỗ khớp `term` (không phân biệt hoa thường) bằng <mark>. */
export function Highlight({ text, term }: { text: string; term: string }) {
  const t = term.trim();
  if (!t) return <>{text}</>;
  const parts = text.split(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  const lower = t.toLowerCase();
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === lower ? (
          <mark key={i} className="rounded bg-sun-200 px-0.5 text-ink-900">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}
