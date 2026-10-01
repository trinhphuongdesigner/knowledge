import { parseCsv } from "./csv";
import { parseMarkdown } from "./markdown";
import type { ParseResult } from "./types";
import { parseXlsx } from "./xlsx";

export { parseCsv, parseMarkdown, parseXlsx };
export type { ParsedCard, ParseResult, ParseError } from "./types";

export const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".md", ".markdown", ".txt"];

export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  switch (ext) {
    case ".csv":
    case ".tsv":
      return parseCsv(await file.text());
    case ".xlsx":
    case ".xls":
      return parseXlsx(await file.arrayBuffer());
    case ".md":
    case ".markdown":
      return parseMarkdown(await file.text());
    case ".txt": {
      const text = await file.text();
      const md = parseMarkdown(text);
      return md.cards.length > 0 ? md : parseCsv(text);
    }
    default:
      throw new Error(
        `Định dạng file "${ext || file.name}" chưa được hỗ trợ. Hãy dùng .csv, .xlsx, .xls, .md, .markdown hoặc .txt.`,
      );
  }
}
