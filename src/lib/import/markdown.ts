import { buildCard, normalize, rowsToCards } from "./table";
import type { ParseResult, ParsedCard } from "./types";

type Key = "q" | "a" | "e" | "p";

const QA_KEYS: Record<string, Key> = {
  q: "q",
  hoi: "q",
  "cau hoi": "q",
  question: "q",
  a: "a",
  dap: "a",
  "dap an": "a",
  "tra loi": "a",
  answer: "a",
  e: "e",
  "giai thich": "e",
  "vi du": "e",
  explanation: "e",
  p: "p",
  "phien am": "p",
  ipa: "p",
  phonetic: "p",
};

function qaKey(line: string): { key: Key; value: string } | null {
  const m = /^\s*([^:：]{1,15})[:：]\s?(.*)$/.exec(line);
  if (!m) return null;
  const key = QA_KEYS[normalize(m[1])];
  return key ? { key, value: m[2] } : null;
}

const isSeparator = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const isTableLine = (l: string) => l.trim().startsWith("|") && l.indexOf("|", l.indexOf("|") + 1) > 0;

function splitTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").replace(/<br\s*\/?>/gi, "\n").trim());
}

function parseTable(lines: string[]): ParseResult {
  const rows: string[][] = [];
  const nums: number[] = [];
  lines.forEach((l, i) => {
    if (!isTableLine(l) || isSeparator(l)) return;
    rows.push(splitTableRow(l));
    nums.push(i + 1);
  });
  return rowsToCards(rows, nums);
}

function parseQA(lines: string[]): ParseResult {
  const result: ParseResult = { cards: [], errors: [] };
  type Draft = { start: number; q?: string; a?: string; e?: string; p?: string };
  let cur: Draft | null = null;
  let field: Key | null = null;
  let blanks = 0;

  const flush = () => {
    if (!cur) return;
    const question = cur.q?.trim() ?? "";
    const answer = cur.a?.trim() ?? "";
    const explanation = cur.e?.trim() ?? "";
    const phonetic = cur.p?.trim() ?? "";
    if (!question) result.errors.push({ row: cur.start, code: "missingQuestion" });
    else if (!answer) result.errors.push({ row: cur.start, code: "missingAnswer" });
    else result.cards.push(buildCard({ question, answer, explanation, phonetic }));
    cur = null;
    field = null;
  };

  lines.forEach((line, i) => {
    if (line.trim() === "") {
      blanks++;
      return;
    }
    const kv = qaKey(line);
    if (kv) {
      if (kv.key === "q") {
        flush();
        cur = { start: i + 1, q: kv.value };
      } else {
        // An answer after a blank line when one already exists starts a new (question-less) card.
        if (cur && kv.key === "a" && cur.a !== undefined && blanks > 0) flush();
        if (!cur) cur = { start: i + 1 };
        cur[kv.key] = kv.value;
      }
      field = kv.key;
    } else if (cur && field) {
      cur[field] = (cur[field] ?? "") + "\n".repeat(blanks + 1) + line;
    } else {
      result.errors.push({ row: i + 1, code: "orphanLine" });
    }
    blanks = 0;
  });
  flush();
  return result;
}

function parseHeadings(lines: string[]): ParseResult {
  const result: ParseResult = { cards: [], errors: [] };
  const heads: { idx: number; level: number; text: string }[] = [];
  let fence = false;
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence;
    if (fence) return;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l);
    if (m) heads.push({ idx: i, level: m[1].length, text: m[2] });
  });
  // Card level = most frequent heading level (ties: deeper level).
  const count = new Map<number, number>();
  heads.forEach((h) => count.set(h.level, (count.get(h.level) ?? 0) + 1));
  let level = 2;
  let best = -1;
  for (const [lv, c] of count) {
    if (c > best || (c === best && lv > level)) {
      best = c;
      level = lv;
    }
  }
  const cardHeads = heads.filter((h) => h.level === level);
  cardHeads.forEach((h, n) => {
    const end = n + 1 < cardHeads.length ? cardHeads[n + 1].idx : lines.length;
    const body = lines.slice(h.idx + 1, end);
    const ans: string[] = [];
    const exp: string[] = [];
    let afterRule = false;
    for (const l of body) {
      if (/^\s*---+\s*$/.test(l) && !afterRule) {
        afterRule = true;
        continue;
      }
      if (afterRule) exp.push(l);
      else if (/^\s*>\s?/.test(l)) exp.push(l.replace(/^\s*>\s?/, ""));
      else ans.push(l);
    }
    const answer = ans.join("\n").trim();
    const explanation = exp.join("\n").trim();
    if (!answer) {
      result.errors.push({ row: h.idx + 1, code: "missingAnswerFor", text: h.text });
    } else {
      const card: ParsedCard = { question: h.text, answer };
      if (explanation) card.explanation = explanation;
      result.cards.push(card);
    }
  });
  return result;
}

const BOLD_LINE = /^\s*\*\*(.+?)\*\*\s*$/;
const FENCE = /^\s*(```|~~~)/;
const HEADING = /^#{1,6}\s+\S/;
const LABEL = /^\s*(EN|VI)\s*[:：]\s?(.*)$/i;

/** Per-line flag: true when the line is outside a fenced code block (fence lines count as inside). */
function outsideFence(lines: string[]): boolean[] {
  let fence = false;
  return lines.map((l) => {
    if (FENCE.test(l)) {
      fence = !fence;
      return false;
    }
    return !fence;
  });
}

function hasBoldQuestion(lines: string[]): boolean {
  const out = outsideFence(lines);
  return lines.some((l, i) => out[i] && BOLD_LINE.test(l));
}

/** Style 4: `**1. Question**` followed by optional `EN:` / `VI:` sections. */
function parseBoldQuestions(lines: string[]): ParseResult {
  const result: ParseResult = { cards: [], errors: [] };
  const out = outsideFence(lines);
  const starts: number[] = [];
  lines.forEach((l, i) => {
    if (out[i] && BOLD_LINE.test(l)) starts.push(i);
  });

  starts.forEach((start, n) => {
    let end = n + 1 < starts.length ? starts[n + 1] : lines.length;
    // A heading ends the card: text up to the next question is not part of it.
    for (let i = start + 1; i < end; i++) {
      if (out[i] && HEADING.test(lines[i])) {
        end = i;
        break;
      }
    }
    const heading = BOLD_LINE.exec(lines[start])![1].replace(/^\s*\d+\s*[.)]\s*/, "").trim();

    const pre: string[] = [];
    const sections: { label: "EN" | "VI"; lines: string[] }[] = [];
    for (let i = start + 1; i < end; i++) {
      const m = out[i] ? LABEL.exec(lines[i]) : null;
      if (m) sections.push({ label: m[1].toUpperCase() as "EN" | "VI", lines: [m[2]] });
      else if (sections.length) sections[sections.length - 1].lines.push(lines[i]);
      else pre.push(lines[i]);
    }
    const join = (ls: string[]) => ls.join("\n").trim();
    const section = (label: "EN" | "VI") =>
      sections
        .filter((s) => s.label === label)
        .map((s) => join(s.lines))
        .filter(Boolean)
        .join("\n\n");

    let question = heading;
    let answer: string;
    let explanation = "";
    if (sections.length === 0) {
      answer = join(pre);
    } else {
      const extra = join(pre);
      if (extra) question += "\n\n" + extra;
      const en = section("EN");
      const vi = section("VI");
      answer = vi || en;
      explanation = vi ? en : "";
    }
    if (!heading) result.errors.push({ row: start + 1, code: "missingQuestion" });
    else if (!answer) result.errors.push({ row: start + 1, code: "missingAnswerFor", text: heading });
    else result.cards.push(buildCard({ question, answer, explanation }));
  });
  return result;
}

export function parseMarkdown(text: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  if (lines.every((l) => l.trim() === "")) return { cards: [], errors: [] };

  if (hasBoldQuestion(lines)) return parseBoldQuestions(lines);

  const hasTable = lines.some((l, i) => isTableLine(l) && i + 1 < lines.length && isSeparator(lines[i + 1]));
  if (hasTable) return parseTable(lines);
  if (lines.some((l) => qaKey(l)?.key === "q")) return parseQA(lines);
  if (lines.some((l) => /^#{1,6}\s+\S/.test(l))) return parseHeadings(lines);
  return {
    cards: [],
    errors: [{ row: 1, code: "unknownMarkdown" }],
  };
}
