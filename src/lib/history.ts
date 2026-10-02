import type { CategoryColor } from "@/lib/validators";

// Tính toán thuần cho tab "Lịch sử học" (không đụng DB — dễ test).

export type HistoryRow = {
  setId: string;
  title: string;
  category: { name: string; color: CategoryColor; isEnglish: boolean };
  cardIds: string[]; // thẻ hiện có của set
  known: string[]; // có thể chứa id thẻ đã bị xoá
  unknown: string[];
  completedAt: Date | null;
  updatedAt: Date;
};

export type HistoryItem = {
  setId: string;
  title: string;
  category: { name: string; color: CategoryColor; isEnglish: boolean };
  total: number;
  known: number;
  percent: number;
  status: "completed" | "learning";
  lastStudiedAt: Date;
};

export type HistorySummary = {
  sets: number;
  known: number;
  total: number;
  percent: number;
  knownWords: number; // đã thuộc ở bộ ENGLISH
  knownCards: number; // đã thuộc ở bộ khác
};

export function percentOf(known: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((known / total) * 100));
}

/** Đếm id trong `ids` còn tồn tại trong `existing` (mỗi id chỉ tính 1 lần). */
export function countExisting(ids: string[], existing: Set<string>): number {
  let n = 0;
  for (const id of new Set(ids)) if (existing.has(id)) n++;
  return n;
}

export function buildHistory(rows: HistoryRow[]): { items: HistoryItem[]; summary: HistorySummary } {
  const items: HistoryItem[] = rows.map((r) => {
    const total = r.cardIds.length;
    const known = countExisting(r.known, new Set(r.cardIds));
    return {
      setId: r.setId,
      title: r.title,
      category: r.category,
      total,
      known,
      percent: percentOf(known, total),
      status: total > 0 && known === total ? "completed" : "learning",
      lastStudiedAt: r.updatedAt,
    };
  });
  items.sort((a, b) => b.lastStudiedAt.getTime() - a.lastStudiedAt.getTime());

  const summary: HistorySummary = { sets: items.length, known: 0, total: 0, percent: 0, knownWords: 0, knownCards: 0 };
  for (const it of items) {
    summary.known += it.known;
    summary.total += it.total;
    if (it.category.isEnglish) summary.knownWords += it.known;
    else summary.knownCards += it.known;
  }
  summary.percent = percentOf(summary.known, summary.total);
  return { items, summary };
}
