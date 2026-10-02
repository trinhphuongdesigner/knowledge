import Papa from "papaparse";
import { utils, write } from "xlsx";

export type ExportCard = {
  question: string;
  answer: string;
  explanation?: string | null;
  phonetic?: string | null;
  partOfSpeech?: string | null;
};

/** Header names are aliases recognised by the importer (src/lib/import/table.ts) so export → import round-trips. */
export const EXPORT_HEADERS = ["question", "answer", "explanation", "phonetic", "part of speech"] as const;

export const EXPORT_FORMATS = ["csv", "xlsx"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

function toRows(cards: ExportCard[]): string[][] {
  return cards.map((c) => [
    c.question,
    c.answer,
    c.explanation ?? "",
    c.phonetic ?? "",
    c.partOfSpeech ?? "",
  ]);
}

/** CSV with a UTF-8 BOM so Excel opens Vietnamese text correctly (the importer strips the BOM). */
export function buildCsv(cards: ExportCard[]): string {
  return "﻿" + Papa.unparse({ fields: [...EXPORT_HEADERS], data: toRows(cards) }, { newline: "\r\n" });
}

export function buildXlsx(cards: ExportCard[], sheetName = "Cards"): Uint8Array {
  const sheet = utils.aoa_to_sheet([[...EXPORT_HEADERS], ...toRows(cards)]);
  sheet["!cols"] = [{ wch: 30 }, { wch: 40 }, { wch: 40 }, { wch: 16 }, { wch: 16 }];
  const wb = utils.book_new();
  // Sheet names: max 31 chars, none of : \ / ? * [ ]
  const name = sheetName.replace(/[:\/?*[\]]/g, " ").trim().slice(0, 31) || "Cards";
  utils.book_append_sheet(wb, sheet, name);
  return write(wb, { type: "buffer", bookType: "xlsx" }) as Uint8Array;
}

/** ASCII slug for filenames: strips Vietnamese diacritics, falls back to "bo-the". */
export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "bo-the";
}
