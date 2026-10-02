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
  const order = keep(d.order);
  if (order.length === 0) return null;
  const known = keep(d.known);
  const knownSet = new Set(known);
  return {
    order,
    known,
    unknown: keep(d.unknown).filter((id) => !knownSet.has(id)),
    index: Math.min(Math.max(0, Number.isInteger(d.index) ? (d.index as number) : 0), order.length),
    shuffle: d.shuffle === true,
    swap: d.swap === true,
  };
}
