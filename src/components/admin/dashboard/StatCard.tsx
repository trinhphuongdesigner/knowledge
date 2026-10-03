import Link from "next/link";
import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  tone?: "warn";
}) {
  const body = (
    <Card className={`p-3 sm:p-4 ${href ? "transition hover:border-brand-400" : ""} ${tone === "warn" ? "border-amber-400" : ""}`}>
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</p>
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
