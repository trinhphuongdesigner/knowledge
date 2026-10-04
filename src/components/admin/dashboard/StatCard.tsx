import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/i18n/format";
import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone,
  locale,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  tone?: "warn";
  locale: Locale;
}) {
  const body = (
    <Card className={`p-3 sm:p-4 ${href ? "transition hover:border-brand-400" : ""} ${tone === "warn" ? "border-amber-400" : ""}`}>
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900">{typeof value === "number" ? formatNumber(locale, value) : value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
