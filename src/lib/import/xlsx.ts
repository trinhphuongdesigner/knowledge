import { read, utils } from "xlsx";
import { rowsToCards } from "./table";
import type { ParseResult } from "./types";

export function parseXlsx(buf: ArrayBuffer): ParseResult {
  const wb = read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { cards: [], errors: [{ row: 0, message: "File Excel không có sheet nào" }] };
  const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: true, defval: "", raw: false });
  const offset = sheet["!ref"] ? utils.decode_range(sheet["!ref"]).s.r : 0;
  return rowsToCards(
    rows.map((r) => r.map((c) => String(c ?? ""))),
    rows.map((_, i) => i + offset + 1),
  );
}
