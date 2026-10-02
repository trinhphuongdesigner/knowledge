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

// ── Cloze (điền chỗ trống) ────────────────────────────────────────────────

export const CLOZE_BLANK = "____";
export const CLOZE_MIN_CARDS = 2;
/** SRS batch size accepted by POST /api/reviews. */
export const REVIEW_BATCH_SIZE = 500;
const CLOZE_LONG_TEXT = 160;

export type Cloze = {
  before: string;
  after: string;
  /** The text as written in the sentence (may be an inflected form of the term). */
  answer: string;
  /** The base term of the card. */
  term: string;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Regex source matching `term` plus simple inflections of its last word, bounded by non-letters. */
function termPattern(term: string): string {
  const words = term.trim().split(/\s+/);
  const head = words
    .slice(0, -1)
    .map((w) => `${escapeRegex(w)}\\s+`)
    .join("");
  const w = words[words.length - 1];
  const lower = w.toLowerCase();
  const forms = new Set<string>([w]);
  for (const t of ["s", "es", "d", "ed", "ing"]) forms.add(w + t);
  if (/[^aeiou]y$/.test(lower)) {
    forms.add(`${w.slice(0, -1)}ies`);
    forms.add(`${w.slice(0, -1)}ied`);
  }
  if (/e$/.test(lower)) forms.add(`${w.slice(0, -1)}ing`);
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(lower)) {
    const l = w.slice(-1);
    for (const t of ["ed", "ing", "er"]) forms.add(w + l + t);
  }
  const alts = [...forms].sort((x, y) => y.length - x.length).map(escapeRegex);
  return `(?<![\\p{L}\\p{N}_])${head}(?:${alts.join("|")})(?![\\p{L}\\p{N}_])`;
}

/** Pick the sentence containing index `at` when the text is long. */
function focusSentence(text: string, at: number): { text: string; offset: number } {
  if (text.length <= CLOZE_LONG_TEXT) return { text, offset: 0 };
  const re = /[.!?…]+["')\]]*\s+/g;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (end > at) return { text: text.slice(start, m.index + m[0].trimEnd().length), offset: start };
    start = end;
  }
  return { text: text.slice(start), offset: start };
}

/**
 * Blank the first occurrence of `question` (the term) in `explanation` (example sentence).
 * Case-insensitive, whole-word, tolerates simple inflections, ignores markdown.
 * Returns null when the term is not usable in the sentence.
 */
export function buildCloze(question: string, explanation: string | null | undefined): Cloze | null {
  if (!explanation) return null;
  const text = stripMarkdown(explanation);
  const term = stripMarkdown(question);
  if (!text || [...term].length < 2) return null;
  const candidates = [term, ...answerVariants(question).filter((v) => v !== normalizeAnswer(term))];
  let best: { index: number; length: number; term: string } | null = null;
  for (const cand of candidates) {
    if ([...cand].length < 2) continue;
    const re = new RegExp(termPattern(cand), "iu");
    const m = re.exec(text);
    if (m && (!best || m.index < best.index)) best = { index: m.index, length: m[0].length, term: cand === term ? term : cand };
  }
  if (!best) return null;
  const focus = focusSentence(text, best.index);
  const idx = best.index - focus.offset;
  const before = focus.text.slice(0, idx);
  const after = focus.text.slice(idx + best.length);
  if (!before.trim() && !after.trim()) return null;
  return { before, after, answer: text.slice(best.index, best.index + best.length), term: best.term };
}

/** Accept the inflected form as written, or the base term. */
export function isClozeCorrect(input: string, cloze: Pick<Cloze, "answer" | "term">): boolean {
  return isCorrectAnswer(input, cloze.answer) || isCorrectAnswer(input, cloze.term);
}

type ClozeCard = { id: string; question: string; explanation: string | null };

/** Cards that have a usable sentence, paired with their cloze. */
export function buildClozeItems<T extends ClozeCard>(cards: readonly T[]): { card: T; cloze: Cloze }[] {
  return cards.flatMap((card) => {
    const cloze = buildCloze(card.question, card.explanation);
    return cloze ? [{ card, cloze }] : [];
  });
}

// ── Listen (nghe) ─────────────────────────────────────────────────────────

/** Multiple-choice options for `target`: the target plus up to `count-1` distinct distractors, shuffled. */
export function buildListenOptions<T extends { id: string; question: string }>(
  cards: readonly T[],
  target: T,
  shuffle: <U>(items: readonly U[]) => U[],
  count = 4,
): T[] {
  const seen = new Set([normalizeAnswer(stripMarkdown(target.question))]);
  const pool = shuffle(cards.filter((c) => c.id !== target.id)).filter((c) => {
    const key = normalizeAnswer(stripMarkdown(c.question));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return shuffle([target, ...pool.slice(0, count - 1)]);
}

// ── SRS reporting ─────────────────────────────────────────────────────────

/** Split into batches of at most `size` (default: API limit). */
export function chunk<T>(items: readonly T[], size = REVIEW_BATCH_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
