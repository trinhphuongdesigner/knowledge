import { describe, expect, it } from "vitest";
import { buildCloze, buildClozeItems, buildListenOptions, chunk, isClozeCorrect } from "../quiz";

const ident = <T,>(items: readonly T[]) => [...items];

describe("buildCloze", () => {
  it("blanks the term case-insensitively and keeps the original casing as answer", () => {
    const c = buildCloze("apple", "Apple pie is tasty.");
    expect(c).toEqual({ before: "", after: " pie is tasty.", answer: "Apple", term: "apple" });
  });
  it("returns null without sentence or match", () => {
    expect(buildCloze("apple", null)).toBeNull();
    expect(buildCloze("apple", "")).toBeNull();
    expect(buildCloze("apple", "I like pears.")).toBeNull();
  });
  it("respects word boundaries", () => {
    expect(buildCloze("cat", "The category is large.")).toBeNull();
    expect(buildCloze("art", "She is smart.")).toBeNull();
    expect(buildCloze("cat", "A cat, sleeping.")?.answer).toBe("cat");
  });
  it("handles simple inflections", () => {
    expect(buildCloze("walk", "He walks home.")?.answer).toBe("walks");
    expect(buildCloze("walk", "They walked home.")?.answer).toBe("walked");
    expect(buildCloze("walk", "I am walking.")?.answer).toBe("walking");
    expect(buildCloze("watch", "She watches TV.")?.answer).toBe("watches");
    expect(buildCloze("make", "We are making tea.")?.answer).toBe("making");
    expect(buildCloze("study", "He studies hard and studied more.")?.answer).toBe("studies");
    expect(buildCloze("study", "She studied hard.")?.answer).toBe("studied");
    expect(buildCloze("stop", "The bus stopped here.")?.answer).toBe("stopped");
    expect(buildCloze("love", "He loved her.")?.answer).toBe("loved");
  });
  it("blanks only the first of multiple occurrences", () => {
    const c = buildCloze("go", "I go and you go.");
    expect(c?.before).toBe("I ");
    expect(c?.after).toBe(" and you go.");
  });
  it("supports multi-word terms", () => {
    const c = buildCloze("give up", "Never give up on your dreams.");
    expect(c).toMatchObject({ before: "Never ", after: " on your dreams.", answer: "give up" });
    expect(buildCloze("give up", "Never give in.")).toBeNull();
  });
  it("strips markdown from sentence and term", () => {
    const c = buildCloze("**run**", "She likes to **run** in the *park*.");
    expect(c).toMatchObject({ before: "She likes to ", after: " in the park.", answer: "run" });
  });
  it("works with Vietnamese text and punctuation", () => {
    const c = buildCloze("học", "Tôi đang học tiếng Anh, mỗi ngày!");
    expect(c).toMatchObject({ before: "Tôi đang ", after: " tiếng Anh, mỗi ngày!", answer: "học" });
    expect(buildCloze("hoc", "Tôi học bài.")).toBeNull();
    expect(buildCloze("đi", "Anh ấy đi làm.")?.answer).toBe("đi");
  });
  it("escapes regex characters in the term", () => {
    expect(buildCloze("c++", "I write c++ code.")?.answer).toBe("c++");
    expect(buildCloze("a.b", "see a.b here")?.answer).toBe("a.b");
    expect(buildCloze("(x)", "value (x) here")?.answer).toBe("(x)");
  });
  it("skips when the sentence is only the term", () => {
    expect(buildCloze("apple", "apple")).toBeNull();
    expect(buildCloze("apple", "**Apple**.")).not.toBeNull();
  });
  it("uses variants of 'a / b' terms", () => {
    expect(buildCloze("color / colour", "The colour is red.")?.answer).toBe("colour");
  });
  it("focuses on the matching sentence in long text", () => {
    const filler = "This is a long introductory sentence that goes on and on without any mention. ".repeat(3);
    const c = buildCloze("river", `${filler}The river flows south. Another sentence follows after it.`);
    expect(c).toMatchObject({ before: "The ", after: " flows south.", answer: "river" });
  });
});

describe("isClozeCorrect", () => {
  const cloze = { answer: "walked", term: "walk" };
  it("accepts inflected form or base term, any case", () => {
    expect(isClozeCorrect("Walked", cloze)).toBe(true);
    expect(isClozeCorrect(" walk ", cloze)).toBe(true);
    expect(isClozeCorrect("walks", cloze)).toBe(false);
    expect(isClozeCorrect("", cloze)).toBe(false);
  });
});

describe("buildClozeItems", () => {
  it("keeps only cards with usable sentences", () => {
    const cards = [
      { id: "1", question: "cat", explanation: "A cat sat." },
      { id: "2", question: "dog", explanation: null },
      { id: "3", question: "bird", explanation: "Fish swim." },
    ];
    expect(buildClozeItems(cards).map((i) => i.card.id)).toEqual(["1"]);
  });
});

describe("buildListenOptions", () => {
  const cards = ["a", "b", "c", "d", "e"].map((q) => ({ id: q, question: q }));
  it("returns target plus distinct distractors", () => {
    const opts = buildListenOptions(cards, cards[0], ident);
    expect(opts).toHaveLength(4);
    expect(opts.map((o) => o.id)).toContain("a");
    expect(new Set(opts.map((o) => o.id)).size).toBe(4);
  });
  it("dedupes equal terms and handles small pools", () => {
    const small = [
      { id: "1", question: "Cat" },
      { id: "2", question: "cat" },
      { id: "3", question: "dog" },
    ];
    expect(buildListenOptions(small, small[0], ident).map((o) => o.id)).toEqual(["1", "3"]);
  });
});

describe("chunk", () => {
  it("splits into batches", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 2)).toEqual([]);
    expect(chunk(Array.from({ length: 1001 }, (_, i) => i)).map((c) => c.length)).toEqual([500, 500, 1]);
  });
});
