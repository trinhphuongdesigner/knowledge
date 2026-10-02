export type StoredStudyState = {
  known: string[];
  unknown: string[];
  order: string[];
  index: number;
  shuffle: boolean;
  swap: boolean;
};

/** Fisher–Yates shuffle (returns a new array). */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

/** Normalise saved progress (DB row), dropping card ids that no longer exist. Returns null if nothing usable. */
export function parseStudyState(data: unknown, validIds: readonly string[]): StoredStudyState | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<StoredStudyState>;
  const valid = new Set(validIds);
  const keep = (v: unknown) => (isStringArray(v) ? v.filter((id) => valid.has(id)) : []);
  const savedOrder = keep(d.order);
  const known = keep(d.known);
  const knownSet = new Set(known);
  const unknown = keep(d.unknown).filter((id) => !knownSet.has(id));
  // A quiz can save known/unknown before any flashcard session exists: keep them and start the session fresh.
  if (savedOrder.length === 0 && known.length === 0 && unknown.length === 0) return null;
  let order = savedOrder.length > 0 ? savedOrder : [...validIds];
  if (savedOrder.length > 0) {
    // Cards added (e.g. imported) after this session started: queue them at the end. A finished session
    // (index === old length) then resumes right at the first new card instead of the "Hoàn thành" screen.
    const seen = new Set([...savedOrder, ...known, ...unknown]);
    const added = validIds.filter((id) => !seen.has(id));
    if (added.length > 0) order = [...savedOrder, ...added];
  }
  return {
    order,
    known,
    unknown,
    index:
      savedOrder.length > 0
        ? Math.min(Math.max(0, Number.isInteger(d.index) ? (d.index as number) : 0), savedOrder.length)
        : 0,
    shuffle: d.shuffle === true,
    swap: d.swap === true,
  };
}
