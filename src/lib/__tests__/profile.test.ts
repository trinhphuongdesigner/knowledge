import { describe, expect, it } from "vitest";
import { LANGUAGE_CODES, isLanguageCode, languageOptions } from "../languages";
import { ageFromBirthYear, isValidBirthYear } from "../profile";
import { onboardingSchema, updateProfileSchema } from "../validators";

const NOW = new Date("2026-06-15T00:00:00Z");

describe("ageFromBirthYear", () => {
  it("is the difference of years", () => {
    expect(ageFromBirthYear(2000, NOW)).toBe(26);
    expect(ageFromBirthYear(2026, NOW)).toBe(0);
  });
  it("validates the 5-120 age window and the 1900..now range", () => {
    expect(isValidBirthYear(2021, NOW)).toBe(true); // 5
    expect(isValidBirthYear(2022, NOW)).toBe(false); // 4
    expect(isValidBirthYear(1906, NOW)).toBe(true); // 120
    expect(isValidBirthYear(1905, NOW)).toBe(false); // 121
    expect(isValidBirthYear(1899, NOW)).toBe(false);
    expect(isValidBirthYear(2027, NOW)).toBe(false);
    expect(isValidBirthYear(2000.5, NOW)).toBe(false);
  });
});

describe("onboardingSchema", () => {
  const ok = { name: "An", fullName: "Nguyễn Văn An", birthYear: 2000, nativeLanguage: "vi" };

  it("accepts valid input and trims", () => {
    const r = onboardingSchema.parse({ ...ok, name: "  An  ", fullName: "  Nguyễn Văn An " });
    expect(r.name).toBe("An");
    expect(r.fullName).toBe("Nguyễn Văn An");
  });
  it("coerces a numeric string birth year (form data)", () => {
    expect(onboardingSchema.parse({ ...ok, birthYear: "1999" }).birthYear).toBe(1999);
  });
  it("rejects empty or too-long names", () => {
    expect(onboardingSchema.safeParse({ ...ok, name: "  " }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...ok, name: "x".repeat(41) }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...ok, name: "x".repeat(40) }).success).toBe(true);
    expect(onboardingSchema.safeParse({ ...ok, fullName: "" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...ok, fullName: "x".repeat(81) }).success).toBe(false);
  });
  it("rejects bad birth years", () => {
    for (const y of ["", "abc", 1899, 3000, 1.5, new Date().getFullYear()]) {
      expect(onboardingSchema.safeParse({ ...ok, birthYear: y }).success).toBe(false);
    }
  });
  it("rejects unknown language codes", () => {
    expect(onboardingSchema.safeParse({ ...ok, nativeLanguage: "xx" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...ok, nativeLanguage: "" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...ok, nativeLanguage: "ja" }).success).toBe(true);
  });
  it("is reused for profile updates", () => {
    expect(updateProfileSchema.safeParse(ok).success).toBe(true);
  });
});

describe("languages", () => {
  it("has unique two-letter lowercase codes including vi/en/ja", () => {
    expect(new Set(LANGUAGE_CODES).size).toBe(LANGUAGE_CODES.length);
    expect(LANGUAGE_CODES.length).toBe(184);
    for (const c of LANGUAGE_CODES) expect(c).toMatch(/^[a-z]{2}$/);
    for (const c of ["vi", "en", "ja"]) expect(isLanguageCode(c)).toBe(true);
  });
  it("rejects non-codes", () => {
    for (const c of ["", "xx", "VI", "vie", null, undefined, 5]) expect(isLanguageCode(c)).toBe(false);
  });
  it("resolves Vietnamese labels, sorted", () => {
    const opts = languageOptions("vi");
    expect(opts).toHaveLength(LANGUAGE_CODES.length);
    expect(opts.find((o) => o.code === "vi")?.label).toBe("Tiếng Việt");
    expect(opts.find((o) => o.code === "en")?.label).toBe("Tiếng Anh");
    const labels = opts.map((o) => o.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, "vi")));
  });
});
