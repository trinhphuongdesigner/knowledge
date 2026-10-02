/** Pure logic for the "Kiểm tra" (quiz) modes: answer comparison, round building, tile pairing. */

export const MATCH_ROUND_SIZE = 6;

/** Strip the simple markdown we may find in card text so tiles/prompts read as plain text. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, ""))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|\*|_|`|~~)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trim, lowercase, collapse spaces and drop trailing punctuation. */
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\s.,;:!?…]+$/u, "")
    .trim();
}

/** Accepted variants of an expected answer: the whole text plus each part of "a / b", "a, b", "a; b". */
export function answerVariants(expected: string): string[] {
  const whole = normalizeAnswer(stripMarkdown(expected));
  const parts = whole
    .split(/\s*[/;,|]\s*/)
    .map(normalizeAnswer)
    .filter(Boolean);
  return [...new Set([whole, ...parts].filter(Boolean))];
}

export function isCorrectAnswer(input: string, expected: string): boolean {
  const value = normalizeAnswer(input);
  if (!value) return false;
  return answerVariants(expected).includes(value);
}

/** First `count` letters of the answer followed by masked remainder, e.g. "ab••••". */
export function hintText(expected: string, count: number): string {
  const text = stripMarkdown(expected);
  const chars = [...text];
  return chars.map((c, i) => (i < count || c === " " ? c : "•")).join("");
}

/** Split ids into rounds of `size`; a trailing single card is folded into the previous round. */
export function buildRounds<T>(items: readonly T[], size = MATCH_ROUND_SIZE): T[][] {
  const rounds: T[][] = [];
  for (let i = 0; i < items.length; i += size) rounds.push(items.slice(i, i + size));
  if (rounds.length > 1 && rounds[rounds.length - 1].length === 1) {
    const last = rounds.pop()!;
    rounds[rounds.length - 1].push(...last);
  }
  return rounds;
}

export type QuizTile = { key: string; cardId: string; side: "term" | "meaning"; text: string };

type TileCard = { id: string; question: string; answer: string };

/** Build term + meaning tiles for a round and order them with `shuffle`. */
export function buildTiles(cards: readonly TileCard[], shuffle: <T>(items: readonly T[]) => T[]): QuizTile[] {
  const tiles: QuizTile[] = cards.flatMap((c) => [
    { key: `${c.id}:term`, cardId: c.id, side: "term" as const, text: stripMarkdown(c.question) },
    { key: `${c.id}:meaning`, cardId: c.id, side: "meaning" as const, text: stripMarkdown(c.answer) },
  ]);
  return shuffle(tiles);
}

/** Two tiles pair up when they belong to the same card but are opposite sides. */
export function isMatch(a: QuizTile, b: QuizTile): boolean {
  return a.cardId === b.cardId && a.side !== b.side;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
