import { describe, expect, it } from "vitest";
import { parseCsv, parseXlsx } from "../import";
import { buildCsv, buildXlsx, slugify, type ExportCard } from "../export";

const cards: ExportCard[] = [
  { question: "Xin chào", answer: "Hello, \"friend\"", explanation: "Line1\nLine2", phonetic: "/həˈləʊ/", partOfSpeech: "noun" },
  { question: "What is JS?", answer: "A language; typed? no", explanation: null },
  { question: "Tiếng Việt đ", answer: "ok" },
];

const expected = [
  { question: "Xin chào", answer: 'Hello, "friend"', explanation: "Line1\nLine2", phonetic: "/həˈləʊ/", partOfSpeech: "noun" },
  { question: "What is JS?", answer: "A language; typed? no" },
  { question: "Tiếng Việt đ", answer: "ok" },
];

describe("export round-trip", () => {
  it("csv starts with BOM and round-trips through parseCsv", () => {
    const csv = buildCsv(cards);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const r = parseCsv(csv);
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual(expected);
  });

  it("xlsx round-trips through parseXlsx", () => {
    const bytes = buildXlsx(cards, "Bộ: thẻ/1");
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const r = parseXlsx(ab);
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual(expected);
  });

  it("handles an empty set", () => {
    expect(parseCsv(buildCsv([])).cards).toEqual([]);
  });
});

describe("slugify", () => {
  it("strips diacritics and punctuation", () => {
    expect(slugify("Từ vựng IELTS — Đề 1!")).toBe("tu-vung-ielts-de-1");
  });
  it("falls back when empty", () => {
    expect(slugify("???")).toBe("bo-the");
  });
});
