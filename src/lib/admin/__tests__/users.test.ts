import { describe, expect, it } from "vitest";
import { escapeLike, parseQuotaField, parseUserListQuery, usagePercent, userListHref } from "../users";

describe("parseUserListQuery", () => {
  it("defaults", () => {
    expect(parseUserListQuery({})).toEqual({ q: "", sort: "createdAt", dir: "desc", filter: null, page: 1 });
  });
  it("whitelists sort/filter and sanitises page", () => {
    const q = parseUserListQuery({ sort: "id; DROP", filter: "nope", page: "-3", dir: "asc", q: "  bob " });
    expect(q).toEqual({ q: "bob", sort: "createdAt", dir: "asc", filter: null, page: 1 });
    expect(parseUserListQuery({ sort: "cards", filter: "disabled", page: ["4", "5"] })).toMatchObject({ sort: "cards", filter: "disabled", page: 4 });
  });
});

describe("userListHref", () => {
  it("omits defaults", () => {
    const q = parseUserListQuery({});
    expect(userListHref(q)).toBe("/admin/users");
    expect(userListHref(q, { page: 2, q: "a b" })).toBe("/admin/users?q=a+b&page=2");
  });
});

describe("helpers", () => {
  it("escapeLike", () => expect(escapeLike("50%_a\\")).toBe("50\\%\\_a\\\\"));
  it("usagePercent", () => {
    expect(usagePercent(80, 100)).toBe(80);
    expect(usagePercent(0, 0)).toBe(0);
    expect(usagePercent(1, 0)).toBe(100);
  });
  it("parseQuotaField", () => {
    expect(parseQuotaField(" ")).toBeNull();
    expect(parseQuotaField("12")).toBe(12);
    expect(parseQuotaField("-1")).toBeUndefined();
    expect(parseQuotaField("1.5")).toBeUndefined();
    expect(parseQuotaField("2000000")).toBeUndefined();
  });
});
