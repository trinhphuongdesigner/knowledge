import Papa from "papaparse";
import { rowsToCards } from "./table";
import type { ParseResult } from "./types";

export function parseCsv(text: string): ParseResult {
  const clean = text.replace(/^﻿/, "");
  const parsed = Papa.parse<string[]>(clean, {
    delimitersToGuess: [",", ";", "\t"],
    skipEmptyLines: false,
  });
  const rows = parsed.data;
  const result = rowsToCards(
    rows,
    rows.map((_, i) => i + 1),
  );
  for (const err of parsed.errors) {
    if (err.type === "Delimiter") continue;
    result.errors.push({ row: (err.row ?? 0) + 1, code: "csvFormat", text: err.message });
  }
  result.errors.sort((x, y) => x.row - y.row);
  return result;
}
