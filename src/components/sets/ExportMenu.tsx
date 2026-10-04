import { Download } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { getT } from "@/i18n/server";

/** Dropdown "Xuất" (CSV / Excel) — thuần HTML details, không cần JS. */
export async function ExportMenu({ setId }: { setId: string }) {
  const t = await getT("sets");
  const item =
    "flex min-h-11 items-center rounded-lg px-3 text-sm text-ink-900 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-brand-600";
  return (
    <details className="group relative">
      <summary className={buttonStyles("secondary", "md", "w-full cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
        <Download className="size-4" aria-hidden />
        {t("export.button")}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-ink-200 bg-surface p-1 shadow-lg">
        <a href={`/api/sets/${setId}/export?format=csv`} download className={item}>
          CSV (.csv)
        </a>
        <a href={`/api/sets/${setId}/export?format=xlsx`} download className={item}>
          Excel (.xlsx)
        </a>
      </div>
    </details>
  );
}
