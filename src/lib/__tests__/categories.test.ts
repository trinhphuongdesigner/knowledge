import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLORS,
  categoryInputSchema,
  categoryNameKey,
  categoryUpdateSchema,
  normalizeCategoryName,
  setInputSchema,
} from "../validators";

describe("normalizeCategoryName", () => {
  it("trims and collapses inner whitespace", () => {
    expect(normalizeCategoryName("  Tiếng   Anh \t")).toBe("Tiếng Anh");
  });
});

describe("categoryNameKey", () => {
  it("is case- and spacing-insensitive", () => {
    expect(categoryNameKey("IT")).toBe(categoryNameKey(" it "));
    expect(categoryNameKey("Tiếng Anh")).toBe(categoryNameKey("TIẾNG  ANH"));
    expect(categoryNameKey("IT")).not.toBe(categoryNameKey("ITs"));
  });
});

describe("categoryInputSchema", () => {
  it("applies defaults and normalizes the name", () => {
    const r = categoryInputSchema.parse({ name: "  Toán  học " });
    expect(r).toEqual({ name: "Toán học", color: "BLUE", isEnglish: false });
  });
  it("accepts every color and isEnglish", () => {
    for (const color of CATEGORY_COLORS) {
      expect(categoryInputSchema.safeParse({ name: "x", color, isEnglish: true }).success).toBe(true);
    }
  });
  it("rejects empty / whitespace-only / too long names", () => {
    expect(categoryInputSchema.safeParse({ name: "" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "a".repeat(41) }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "a".repeat(40) }).success).toBe(true);
  });
  it("rejects unknown colors and non-boolean flags", () => {
    expect(categoryInputSchema.safeParse({ name: "x", color: "PINK" }).success).toBe(false);
    expect(categoryInputSchema.safeParse({ name: "x", isEnglish: "yes" }).success).toBe(false);
  });
});

describe("categoryUpdateSchema", () => {
  it("does not re-apply defaults to missing keys", () => {
    expect(categoryUpdateSchema.parse({ name: " A " })).toEqual({ name: "A" });
    expect(categoryUpdateSchema.parse({})).toEqual({});
  });
});

describe("setInputSchema.categoryId", () => {
  it("requires a uuid", () => {
    expect(setInputSchema.safeParse({ title: "t", categoryId: "IT" }).success).toBe(false);
    expect(
      setInputSchema.safeParse({ title: "t", categoryId: "01a0fb2f-e723-7097-b2d6-9862d6ae0b5c" }).success,
    ).toBe(true);
  });
});
