export type StoredStudyState = {
  known: string[];
  unknown: string[];
  order: string[];
  index: number;
  shuffle: boolean;
  swap: boolean;
};

export const storageKey = (setId: string) => `knowledge:study:${setId}`;

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

export function readRaw(setId: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(setId));
  } catch {
    return null;
  }
}

/** Parse saved state, dropping card ids that no longer exist. Returns null if nothing usable. */
export function parseStudyState(raw: string | null, validIds: readonly string[]): StoredStudyState | null {
  try {
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredStudyState>;
    const valid = new Set(validIds);
    const keep = (v: unknown) => (isStringArray(v) ? v.filter((id) => valid.has(id)) : []);
    const order = keep(data.order);
    if (order.length === 0) return null;
    const known = keep(data.known);
    const knownSet = new Set(known);
    return {
      order,
      known,
      unknown: keep(data.unknown).filter((id) => !knownSet.has(id)),
      index: Math.min(Math.max(0, Number.isInteger(data.index) ? (data.index as number) : 0), order.length),
      shuffle: data.shuffle === true,
      swap: data.swap === true,
    };
  } catch {
    return null;
  }
}

export function saveStudyState(setId: string, state: StoredStudyState) {
  try {
    window.localStorage.setItem(storageKey(setId), JSON.stringify(state));
  } catch {
    // storage unavailable — ignore
  }
}
