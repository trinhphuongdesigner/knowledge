import type { ParseResult, ParsedCard } from "./types";

/** Lowercase, strip diacritics (incl. đ), collapse whitespace. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0111/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES = {
  question: ["question", "cau hoi", "term", "thuat ngu", "front"],
  answer: ["answer", "tra loi", "dap an", "definition", "dinh nghia", "back"],
  explanation: ["explanation", "giai thich", "note", "example", "vi du"],
  phonetic: ["phonetic", "phien am", "ipa", "pronunciation"],
  partOfSpeech: ["part of speech", "pos", "tu loai", "type", "word type"],
} as const;

type Field = keyof typeof ALIASES;

function fieldOf(cell: string): Field | null {
  const n = normalize(cell);
  for (const f of Object.keys(ALIASES) as Field[]) {
    if ((ALIASES[f] as readonly string[]).includes(n)) return f;
  }
  return null;
}

/** Build a ParsedCard, omitting empty optional fields. */
export function buildCard(f: {
  question: string;
  answer: string;
  explanation?: string;
  phonetic?: string;
  partOfSpeech?: string;
}): ParsedCard {
  const card: ParsedCard = { question: f.question, answer: f.answer };
  if (f.explanation) card.explanation = f.explanation;
  if (f.phonetic) card.phonetic = f.phonetic;
  if (f.partOfSpeech) card.partOfSpeech = f.partOfSpeech;
  return card;
}

/**
 * Convert table rows to cards. `rowNumbers[i]` is the 1-based source row of rows[i].
 * First non-blank row is treated as header when any cell matches an alias.
 */
export function rowsToCards(rows: string[][], rowNumbers: number[]): ParseResult {
  const result: ParseResult = { cards: [], errors: [] };
  const entries = rows
    .map((r, i) => ({ cells: r.map((c) => (c ?? "").toString().trim()), row: rowNumbers[i] }))
    .filter((e) => e.cells.some((c) => c !== ""));
  if (entries.length === 0) return result;

  let q = 0;
  let a = 1;
  let e = 2;
  let ph = -1;
  let ps = -1;
  let start = 0;

  const header = entries[0].cells;
  const found = header.map(fieldOf);
  if (found.some((f) => f !== null)) {
    start = 1;
    const used = new Set<number>();
    const pos: Partial<Record<Field, number>> = {};
    for (const f of ["question", "answer", "explanation", "phonetic", "partOfSpeech"] as Field[]) {
      const i = found.indexOf(f);
      if (i >= 0) {
        pos[f] = i;
        used.add(i);
      }
    }
    // Fill missing question/answer with the first unused columns, in order.
    const free = header.map((_, i) => i).filter((i) => !used.has(i));
    for (const f of ["question", "answer"] as Field[]) {
      if (pos[f] === undefined && free.length) pos[f] = free.shift();
    }
    q = pos.question ?? -1;
    a = pos.answer ?? -1;
    e = pos.explanation ?? -1;
    ph = pos.phonetic ?? -1;
    ps = pos.partOfSpeech ?? -1;
  }

  for (const entry of entries.slice(start)) {
    const question = q >= 0 ? (entry.cells[q] ?? "") : "";
    const answer = a >= 0 ? (entry.cells[a] ?? "") : "";
    const explanation = e >= 0 ? (entry.cells[e] ?? "") : "";
    const phonetic = ph >= 0 ? (entry.cells[ph] ?? "") : "";
    const partOfSpeech = ps >= 0 ? (entry.cells[ps] ?? "") : "";
    if (!question && !answer) {
      result.errors.push({ row: entry.row, code: "missingBoth" });
    } else if (!question) {
      result.errors.push({ row: entry.row, code: "missingQuestion" });
    } else if (!answer) {
      result.errors.push({ row: entry.row, code: "missingAnswer" });
    } else {
      result.cards.push(buildCard({ question, answer, explanation, phonetic, partOfSpeech }));
    }
  }
  return result;
}
