import { DEFAULT_LOCALE, type Locale } from "../config";
import type { Messages } from "./types";

export type { DeepPartial, MessageKey, Messages, Namespace, PluralForms } from "./types";

// Import tường minh để bundler tách chunk theo locale.
const LOADERS: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: () => import("./en"),
  vi: () => import("./vi"),
  zh: () => import("./zh"),
  ja: () => import("./ja"),
  ko: () => import("./ko"),
  ru: () => import("./ru"),
  fr: () => import("./fr"),
  th: () => import("./th"),
};

type Json = Record<string, unknown>;

function isObject(v: unknown): v is Json {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Trộn sâu `over` lên `base`: key thiếu (hoặc chuỗi rỗng) ở `over` giữ giá trị của `base`. */
export function deepMerge(base: Json, over: Json): Json {
  const out: Json = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (isObject(v) && isObject(base[k])) out[k] = deepMerge(base[k], v);
    else if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

const cache = new Map<Locale, Promise<Messages>>();

/** Tải messages của locale, key thiếu fallback sang tiếng Anh. */
export function loadMessages(locale: Locale): Promise<Messages> {
  let p = cache.get(locale);
  if (!p) {
    p = (async () => {
      const en = (await LOADERS[DEFAULT_LOCALE]()).default as Messages;
      if (locale === DEFAULT_LOCALE) return en;
      const loc = (await LOADERS[locale]()).default as Json;
      return deepMerge(en as unknown as Json, loc) as unknown as Messages;
    })();
    cache.set(locale, p);
  }
  return p;
}
