/**
 * Tìm chuỗi tiếng Việt hard-code trong src (ngoài src/i18n/messages, __tests__, src/generated).
 * Báo các dòng có ký tự có dấu tiếng Việt (sau khi bỏ comment); exit 1 nếu còn.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(process.cwd(), "src");
const VI_CHARS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

function skip(rel: string): boolean {
  const p = rel.split(sep).join("/");
  return p === "i18n/config.ts" || p.startsWith("i18n/messages/") || p.startsWith("generated/") || p.includes("__tests__/");
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(name)) yield full;
  }
}

/** Bỏ comment (giữ nguyên số dòng); nhận biết chuỗi để không cắt nhầm "//" trong URL. */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  let quote: string | null = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") out += src[++i] ?? "";
      else if (c === quote) quote = null;
      i++;
    } else if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && n === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i++;
      }
      i += 2;
    } else {
      if (c === '"' || c === "'" || c === "`") quote = c;
      out += c;
      i++;
    }
  }
  return out;
}

let count = 0;
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (skip(rel)) continue;
  const lines = stripComments(readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, idx) => {
    if (VI_CHARS.test(line)) {
      count++;
      console.log(`src/${rel.split(sep).join("/")}:${idx + 1}: ${line.trim().slice(0, 120)}`);
    }
  });
}

if (count > 0) {
  console.error(`\n${count} dòng còn chuỗi tiếng Việt hard-code.`);
  process.exit(1);
}
console.log("OK: không còn chuỗi tiếng Việt hard-code.");
