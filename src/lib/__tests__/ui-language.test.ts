import { describe, expect, it } from "vitest";
import { LOCALES, uiLanguageFromNative } from "../../i18n/config";
import { parseUiLanguage, uiLanguageSchema } from "../ui-language";

describe("parseUiLanguage", () => {
  it("accepts every supported locale", () => {
    for (const l of LOCALES) expect(parseUiLanguage(l)).toBe(l);
  });
  it("rejects unsupported or malformed values", () => {
    for (const v of ["de", "EN", "en-US", "", " vi", null, undefined, 1, {}]) expect(parseUiLanguage(v)).toBeNull();
  });
  it("exposes a zod enum over LOCALES", () => {
    expect(uiLanguageSchema.options).toEqual([...LOCALES]);
  });
});

describe("onboarding ui language", () => {
  it("follows the native language when supported, otherwise falls back to en", () => {
    expect(uiLanguageFromNative("vi")).toBe("vi");
    expect(uiLanguageFromNative("ja")).toBe("ja");
    expect(uiLanguageFromNative("de")).toBe("en");
    expect(uiLanguageFromNative(null)).toBe("en");
  });
});
