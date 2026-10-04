import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import { colorClasses } from "@/components/categories/colors";
import { getT } from "@/i18n/server";
import { LEVELS, type CategoryDTO, type Level, type StudySetDTO } from "@/lib/validators";
import type { SetStatus } from "@/lib/set-status";
import { SetCard } from "./SetCard";

const GRID = "stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

function Chevron() {
  return (
    <ChevronDown
      className="size-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180"
      aria-hidden
    />
  );
}

/** Nhóm thẻ hiển thị theo danh mục (thu gọn được), trong mỗi danh mục chia theo cấp độ. */
export async function SetGroups({
  categories,
  sets,
  showEmpty,
  statuses,
}: {
  categories: CategoryDTO[];
  sets: StudySetDTO[];
  showEmpty: boolean;
  statuses?: Record<string, SetStatus>;
}) {
  const t = await getT("sets");
  const groups = categories
    .map((category) => ({ category, items: sets.filter((s) => s.category.id === category.id) }))
    .filter((g) => g.items.length > 0 || showEmpty);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ category, items }) => {
        const levelGroups: { key: string; label: string | null; items: StudySetDTO[] }[] = [
          ...LEVELS.map((l: Level) => ({
            key: l,
            label: t(`levels.${l}`) as string | null,
            items: items.filter((s) => s.level === l),
          })),
          { key: "NONE", label: null, items: items.filter((s) => !s.level) },
        ].filter((g) => g.items.length > 0);
        // Chỉ có nhóm "chưa phân cấp" thì không cần tiêu đề cấp độ.
        const plain = levelGroups.length === 1 && levelGroups[0].label === null;

        return (
          <details
            key={category.id}
            open
            className="group rounded-3xl border border-ink-200 bg-surface/80 shadow-[0_1px_2px_rgb(70_63_53/0.05)] backdrop-blur-sm"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden">
              <span className={`size-3.5 shrink-0 rounded-md rotate-12 ${colorClasses(category.color).dot}`} aria-hidden />
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-ink-900">{category.name}</h2>
              <span className="shrink-0 text-sm text-ink-500">{t("groups.setCount", { count: items.length })}</span>
              <Chevron />
            </summary>
            <div className="flex flex-col gap-6 border-t border-dashed border-ink-200 px-4 pt-4 pb-6">
              {items.length === 0 && <p className="text-sm text-ink-500">{t("groups.emptyCategory")}</p>}
              {levelGroups.map((g) =>
                plain ? (
                  <div key={g.key} className={GRID}>
                    {g.items.map((s, i) => (
                      <div key={s.id} className="h-full" style={{ "--i": i } as CSSProperties}>
                        <SetCard set={s} hideCategory status={statuses?.[s.id]} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <section key={g.key} aria-label={g.label ?? t("groups.noLevel")}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
                      {g.label ?? t("groups.noLevel")} <span className="font-normal normal-case">· {g.items.length}</span>
                    </h3>
                    <div className={GRID}>
                      {g.items.map((s, i) => (
                        <div key={s.id} className="h-full" style={{ "--i": i } as CSSProperties}>
                          <SetCard set={s} hideCategory hideLevel status={statuses?.[s.id]} />
                        </div>
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
