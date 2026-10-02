import { ChevronDown } from "lucide-react";
import { colorClasses } from "@/components/categories/colors";
import { LEVELS, LEVEL_LABELS, type CategoryDTO, type Level, type StudySetDTO } from "@/lib/validators";
import { SetCard } from "./SetCard";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

function Chevron() {
  return (
    <ChevronDown
      className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
      aria-hidden
    />
  );
}

/** Nhóm thẻ hiển thị theo danh mục (thu gọn được), trong mỗi danh mục chia theo cấp độ. */
export function SetGroups({
  categories,
  sets,
  showEmpty,
}: {
  categories: CategoryDTO[];
  sets: StudySetDTO[];
  showEmpty: boolean;
}) {
  const groups = categories
    .map((category) => ({ category, items: sets.filter((s) => s.category.id === category.id) }))
    .filter((g) => g.items.length > 0 || showEmpty);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ category, items }) => {
        const levelGroups: { key: string; label: string | null; items: StudySetDTO[] }[] = [
          ...LEVELS.map((l: Level) => ({
            key: l,
            label: LEVEL_LABELS[l] as string | null,
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
            className="group rounded-2xl border border-slate-200 bg-white"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
              <span className={`size-3 shrink-0 rounded-full ${colorClasses(category.color).dot}`} aria-hidden />
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{category.name}</h2>
              <span className="shrink-0 text-sm text-slate-500">{items.length} nhóm thẻ</span>
              <Chevron />
            </summary>
            <div className="flex flex-col gap-5 border-t border-slate-100 px-4 py-4">
              {items.length === 0 && <p className="text-sm text-slate-500">Chưa có nhóm thẻ nào trong danh mục này.</p>}
              {levelGroups.map((g) =>
                plain ? (
                  <div key={g.key} className={GRID}>
                    {g.items.map((s) => (
                      <SetCard key={s.id} set={s} hideCategory />
                    ))}
                  </div>
                ) : (
                  <section key={g.key} aria-label={g.label ?? "Chưa phân cấp"}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {g.label ?? "Chưa phân cấp"} <span className="font-normal normal-case">· {g.items.length}</span>
                    </h3>
                    <div className={GRID}>
                      {g.items.map((s) => (
                        <SetCard key={s.id} set={s} hideCategory hideLevel />
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
