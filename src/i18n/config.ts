/** Cấu hình i18n thuần (không phụ thuộc server/client) — import được ở mọi nơi. */
export const LOCALES = ["en", "vi", "zh", "ja", "ko", "ru", "fr", "th"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "kn_locale";

/** Tên ngôn ngữ viết bằng chính ngôn ngữ đó (dùng cho dropdown chọn ngôn ngữ). */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  fr: "Français",
  th: "ไทย",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Ngôn ngữ giao diện ban đầu từ tiếng mẹ đẻ: được hỗ trợ thì dùng, ngược lại en. */
export function uiLanguageFromNative(native: string | null | undefined): Locale {
  return isLocale(native) ? native : DEFAULT_LOCALE;
}

/** user.uiLanguage → cookie → en. */
export function resolveLocale({
  user,
  cookie,
}: {
  user?: { uiLanguage?: string | null } | null;
  cookie?: string | null;
}): Locale {
  if (isLocale(user?.uiLanguage)) return user.uiLanguage;
  if (isLocale(cookie)) return cookie;
  return DEFAULT_LOCALE;
}
