import type { Locale } from "./config";
import type { MessageKey, Messages, Namespace, PluralForms } from "./messages/types";

export type TParams = Record<string, string | number>;
export type TFunction<N extends Namespace> = (key: MessageKey<Messages[N]>, params?: TParams) => string;

function interpolate(text: string, params?: TParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

const rulesCache = new Map<string, Intl.PluralRules>();
function pluralCategory(locale: Locale, count: number): Intl.LDMLPluralRule {
  let r = rulesCache.get(locale);
  if (!r) rulesCache.set(locale, (r = new Intl.PluralRules(locale)));
  return r.select(count);
}

/** Dịch một key (dạng "a.b") trong namespace; thiếu key thì trả lại chính key. */
export function translate(locale: Locale, ns: unknown, key: string, params?: TParams): string {
  let node: unknown = ns;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return key;
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node === "string") return interpolate(node, params);
  if (typeof node === "object" && node !== null && typeof (node as PluralForms).other === "string") {
    const forms = node as PluralForms;
    const count = Number(params?.count);
    if (params?.count === undefined || Number.isNaN(count)) return interpolate(forms.other, params);
    const text = (count === 0 ? forms.zero : undefined) ?? forms[pluralCategory(locale, count)] ?? forms.other;
    return interpolate(text, params);
  }
  return key;
}

export function createT<N extends Namespace>(locale: Locale, messages: Messages, namespace: N): TFunction<N> {
  const ns = messages[namespace];
  return (key, params) => translate(locale, ns, key, params);
}
