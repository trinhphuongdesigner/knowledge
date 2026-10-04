import { z } from "zod";
import { LOCALES, type Locale } from "../i18n/config";

/** Ngôn ngữ giao diện hợp lệ: một trong LOCALES (định nghĩa ở đây, không đụng validators.ts). */
export const uiLanguageSchema = z.enum(LOCALES);

/** Trả về Locale nếu hợp lệ, ngược lại null. */
export function parseUiLanguage(value: unknown): Locale | null {
  const parsed = uiLanguageSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
