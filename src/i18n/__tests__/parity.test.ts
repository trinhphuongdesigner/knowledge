import { describe, expect, it } from "vitest";
import { LOCALES } from "../config";
import { loadMessages } from "../messages";
import en from "../messages/en";

type Json = Record<string, unknown>;

/** Namespace chỉ bắt buộc đủ ở en + vi; locale khác fallback về en (xem docs/i18n-plan.md). */
const PARTIAL_NAMESPACES = ["admin"];
const placeholders = (s: string) =>
  [...s.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(",");

/** Phẳng hoá thành { "a.b": "chuỗi" }. Giá trị số nhiều ({ other, … }) tính là một lá, so theo `other` (mỗi locale có bộ dạng riêng). */
function flatten(obj: Json, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else if (v && typeof (v as Json).other === "string") out[key] = (v as Json).other as string;
    else if (v && typeof v === "object") Object.assign(out, flatten(v as Json, key));
  }
  return out;
}

const modules = import.meta.glob("../messages/*/index.ts", { eager: true }) as Record<string, { default: Json }>;
const byLocale: Record<string, Json> = {};
for (const [path, mod] of Object.entries(modules)) byLocale[path.split("/")[2]] = mod.default;

describe("messages parity", () => {
  it("có đủ thư mục cho mọi locale", () => {
    expect(Object.keys(byLocale).sort()).toEqual([...LOCALES].sort());
  });

  for (const locale of LOCALES) {
    if (locale === "en") continue;
    describe(locale, () => {
      for (const ns of Object.keys(en)) {
        if (PARTIAL_NAMESPACES.includes(ns) && locale !== "vi") continue;
        it(`namespace ${ns}`, () => {
          const base = flatten((en as Json)[ns] as Json);
          const loc = flatten((byLocale[locale][ns] ?? {}) as Json);
          expect(Object.keys(loc).sort()).toEqual(Object.keys(base).sort());
          for (const [k, v] of Object.entries(loc)) {
            expect(v.trim(), `${locale}.${ns}.${k} rỗng`).not.toBe("");
            expect(placeholders(v), `${locale}.${ns}.${k} placeholder`).toBe(placeholders(base[k]));
          }
        });
      }
    });
  }
});

describe("loadMessages", () => {
  it("fallback en cho namespace thiếu", async () => {
    const m = await loadMessages("th");
    expect(m.common.save).toBeTruthy();
    expect(Object.keys(m)).toEqual(Object.keys(en));
  });
});
