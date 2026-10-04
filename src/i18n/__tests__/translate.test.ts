import { describe, expect, it } from "vitest";
import { deepMerge } from "../messages";
import ruLibrary from "../messages/ru/library";
import { translate } from "../translate";

const ns = {
  hello: "Hi {name}!",
  nested: { deep: "Deep" },
  items: { one: "{count} item", other: "{count} items" },
  cards: { zero: "No cards", one: "{count} card", few: "{count} cards (few)", many: "{count} cards (many)", other: "{count} cards (other)" },
};

describe("translate", () => {
  it("nội suy tham số, giữ nguyên placeholder thiếu", () => {
    expect(translate("en", ns, "hello", { name: "An" })).toBe("Hi An!");
    expect(translate("en", ns, "hello")).toBe("Hi {name}!");
    expect(translate("en", ns, "hello", { other: 1 })).toBe("Hi {name}!");
  });
  it("key lồng nhau", () => {
    expect(translate("en", ns, "nested.deep")).toBe("Deep");
  });
  it("số nhiều en", () => {
    expect(translate("en", ns, "items", { count: 1 })).toBe("1 item");
    expect(translate("en", ns, "items", { count: 5 })).toBe("5 items");
  });
  it("số nhiều ru: one/few/many", () => {
    expect(translate("ru", ns, "cards", { count: 21 })).toBe("21 card");
    expect(translate("ru", ns, "cards", { count: 3 })).toBe("3 cards (few)");
    expect(translate("ru", ns, "cards", { count: 5 })).toBe("5 cards (many)");
  });
  it("zero khi có; ja chỉ dùng other", () => {
    expect(translate("en", ns, "cards", { count: 0 })).toBe("No cards");
    expect(translate("ja", ns, "items", { count: 1 })).toBe("1 items");
  });
  it("thiếu key → trả lại key", () => {
    expect(translate("en", ns, "nope")).toBe("nope");
    expect(translate("en", ns, "hello.x.y")).toBe("hello.x.y");
    expect(translate("en", ns, "nested")).toBe("nested");
  });
});

describe("ru plural với key thật", () => {
  it("library.cardCount: 1/3/5/21", () => {
    expect(translate("ru", ruLibrary, "cardCount", { count: 1 })).toBe("1 карточка");
    expect(translate("ru", ruLibrary, "cardCount", { count: 3 })).toBe("3 карточки");
    expect(translate("ru", ruLibrary, "cardCount", { count: 5 })).toBe("5 карточек");
    expect(translate("ru", ruLibrary, "cardCount", { count: 21 })).toBe("21 карточка");
  });
});

describe("deepMerge fallback", () => {
  it("key thiếu / rỗng lấy từ en", () => {
    const merged = deepMerge({ a: "A", b: { c: "C", d: "D" } }, { b: { c: "X", d: "" } });
    expect(merged).toEqual({ a: "A", b: { c: "X", d: "D" } });
  });
});
