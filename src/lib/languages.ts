/** Mã ngôn ngữ ISO 639-1 (2 chữ cái). Dùng được ở cả server lẫn client. */
export const LANGUAGE_CODES = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
  "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs",
  "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy",
  "da", "de", "dv", "dz",
  "ee", "el", "en", "eo", "es", "et", "eu",
  "fa", "ff", "fi", "fj", "fo", "fr", "fy",
  "ga", "gd", "gl", "gn", "gu", "gv",
  "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz",
  "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu",
  "ja", "jv",
  "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky",
  "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv",
  "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my",
  "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny",
  "oc", "oj", "om", "or", "os",
  "pa", "pi", "pl", "ps", "pt",
  "qu",
  "rm", "rn", "ro", "ru", "rw",
  "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw",
  "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty",
  "ug", "uk", "ur", "uz",
  "ve", "vi", "vo",
  "wa", "wo",
  "xh",
  "yi", "yo",
  "za", "zh", "zu",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const DEFAULT_NATIVE_LANGUAGE: LanguageCode = "vi";

const CODE_SET: ReadonlySet<string> = new Set(LANGUAGE_CODES);

export function isLanguageCode(code: unknown): code is LanguageCode {
  return typeof code === "string" && CODE_SET.has(code);
}

export type LanguageOption = { code: LanguageCode; label: string };

/** Danh sách ngôn ngữ kèm tên hiển thị theo `locale`, sắp xếp theo tên. */
export function languageOptions(locale = "vi"): LanguageOption[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([locale], { type: "language" });
  } catch {
    names = null;
  }
  const label = (code: string) => {
    try {
      return names?.of(code) || code;
    } catch {
      return code;
    }
  };
  const all = LANGUAGE_CODES.map((code) => ({ code, label: label(code) }));
  // Intl trả lại chính mã ("aa", "ab"...) khi không có tên tiếng Việt cho ngôn ngữ hiếm; bỏ các mục đó.
  const named = all.filter((o) => o.label.toLowerCase() !== o.code);
  return (named.length > 0 ? named : all).sort((a, b) => a.label.localeCompare(b.label, "vi"));
}

/** Tên ngôn ngữ theo mã (fallback: chính mã đó). */
export function languageLabel(code: string, locale = "vi"): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}
