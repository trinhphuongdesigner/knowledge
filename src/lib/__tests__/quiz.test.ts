import { describe, expect, it } from "vitest";
import {
  answerVariants,
  buildRounds,
  buildTiles,
  hintText,
  isCorrectAnswer,
  isMatch,
  normalizeAnswer,
  stripMarkdown,
} from "../quiz";

describe("normalizeAnswer", () => {
  it("trims, lowercases, collapses spaces and drops trailing punctuation", () => {
    expect(normalizeAnswer("  Hello   World. ")).toBe("hello world");
    expect(normalizeAnswer("Really?!")).toBe("really");
  });
});

describe("isCorrectAnswer", () => {
  it("accepts any variant", () => {
    expect(isCorrectAnswer("colour", "color / colour")).toBe(true);
    expect(isCorrectAnswer("B", "a, b")).toBe(true);
    expect(isCorrectAnswer("a, b", "a, b")).toBe(true);
  });
  it("rejects wrong or empty input", () => {
    expect(isCorrectAnswer("", "cat")).toBe(false);
    expect(isCorrectAnswer("cats", "cat")).toBe(false);
  });
  it("ignores markdown in expected", () => {
    expect(isCorrectAnswer("cat", "**cat**")).toBe(true);
  });
});

describe("answerVariants", () => {
  it("includes whole and parts", () => {
    expect(answerVariants("a / b")).toEqual(["a / b", "a", "b"]);
  });
});

describe("stripMarkdown", () => {
  it("removes simple syntax", () => {
    expect(stripMarkdown("**bold** and `code`\n- item [link](http://x)")).toBe("bold and code item link");
  });
});

describe("hintText", () => {
  it("reveals leading letters", () => {
    expect(hintText("big cat", 1)).toBe("b•• •••");
  });
});

describe("buildRounds", () => {
  it("chunks and folds a trailing single", () => {
    expect(buildRounds([1, 2, 3, 4, 5, 6, 7], 6).map((r) => r.length)).toEqual([7]);
    expect(buildRounds([1, 2, 3, 4, 5, 6, 7, 8], 6).map((r) => r.length)).toEqual([6, 2]);
    expect(buildRounds([1, 2], 6)).toEqual([[1, 2]]);
  });
});

describe("tiles", () => {
  const cards = [
    { id: "a", question: "cat", answer: "mèo" },
    { id: "b", question: "dog", answer: "chó" },
  ];
  it("builds two tiles per card and pairs correctly", () => {
    const tiles = buildTiles(cards, (x) => [...x].reverse());
    expect(tiles).toHaveLength(4);
    const get = (k: string) => tiles.find((t) => t.key === k)!;
    expect(isMatch(get("a:term"), get("a:meaning"))).toBe(true);
    expect(isMatch(get("a:term"), get("b:meaning"))).toBe(false);
    expect(isMatch(get("a:term"), get("a:term"))).toBe(false);
  });
});
