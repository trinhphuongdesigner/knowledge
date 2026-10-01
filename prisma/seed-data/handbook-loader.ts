import { existsSync, readFileSync } from "node:fs";
import { parseMarkdown } from "../../src/lib/import/markdown";

export type HandbookSet = {
  number: number;
  name: string;
  title: string;
  description: string;
  level: "BASIC" | "INTERMEDIATE" | "ADVANCED";
  cards: { question: string; answer: string; explanation?: string }[];
};

function levelFor(name: string): HandbookSet["level"] {
  if (/database/i.test(name)) return "BASIC";
  if (/senior|performance|security/i.test(name)) return "ADVANCED";
  return "INTERMEDIATE"; // JS, TS, React, Next.js, HTML/CSS, IQ
}

/** Parse PART II of the handbook: each `## N. Name` section becomes one set. */
export function loadHandbook(file: string): HandbookSet[] {
  if (!existsSync(file)) {
    console.warn(`! Handbook not found: ${file}`);
    return [];
  }
  const text = readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const idx = text.search(/^#\s+PHẦN II\b/m);
  if (idx < 0) {
    console.warn("! Handbook: PHẦN II not found");
    return [];
  }
  const part = text.slice(idx).split("\n").slice(1).join("\n");
  const sections = part.split(/^##\s+/m).slice(1);
  const sets: HandbookSet[] = [];
  for (const section of sections) {
    const [head, ...rest] = section.split("\n");
    const m = /^(\d+)\.\s*(.+?)\s*$/.exec(head);
    if (!m) continue;
    const number = Number(m[1]);
    const name = m[2];
    const body = rest.join("\n");
    const tip = /^Mẹo:.*$/m.exec(body)?.[0].trim();
    const result = parseMarkdown(body);
    for (const err of result.errors) console.warn(`! Handbook "${name}" line ${err.row}: ${err.message}`);
    if (result.cards.length === 0) continue;
    sets.push({
      number,
      name,
      title: `Phỏng vấn Frontend · ${name}`,
      description: tip ?? `Câu hỏi phỏng vấn Frontend về ${name}, có đáp án song ngữ Anh - Việt.`,
      level: levelFor(name),
      cards: result.cards,
    });
  }
  return sets.sort((a, b) => a.number - b.number);
}
