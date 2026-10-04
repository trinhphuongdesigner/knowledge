import type { Locale } from "./config";

/** Locale BCP47 dùng cho Intl. */
export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  vi: "vi-VN",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  fr: "fr-FR",
  th: "th-TH",
};

type DateInput = Date | string | number;

export function formatDate(locale: Locale, date: DateInput, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], options).format(new Date(date));
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale], options).format(value);
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** "3 ngày trước" / "in 2 hours" — `now` chỉ để test. */
export function formatRelative(locale: Locale, date: DateInput, now: DateInput = Date.now()): string {
  const diffSec = Math.round((new Date(date).getTime() - new Date(now).getTime()) / 1000);
  const abs = Math.abs(diffSec);
  const [unit, secs] = UNITS.find(([, s]) => abs >= s) ?? UNITS[UNITS.length - 1];
  return new Intl.RelativeTimeFormat(INTL_LOCALES[locale], { numeric: "auto" }).format(Math.trunc(diffSec / secs), unit);
}

/** Locale cho thẻ OpenGraph (og:locale). */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  vi: "vi_VN",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  ru: "ru_RU",
  fr: "fr_FR",
  th: "th_TH",
};
