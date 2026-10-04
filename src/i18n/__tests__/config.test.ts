import { describe, expect, it } from "vitest";
import { isLocale, resolveLocale, uiLanguageFromNative } from "../config";

describe("resolveLocale", () => {
  it("ưu tiên user.uiLanguage", () => {
    expect(resolveLocale({ user: { uiLanguage: "ja" }, cookie: "th" })).toBe("ja");
  });
  it("user chưa đặt hoặc giá trị lạ → cookie", () => {
    expect(resolveLocale({ user: { uiLanguage: null }, cookie: "th" })).toBe("th");
    expect(resolveLocale({ user: { uiLanguage: "xx" }, cookie: "ru" })).toBe("ru");
  });
  it("chưa đăng nhập: cookie hợp lệ, ngược lại en", () => {
    expect(resolveLocale({ cookie: "fr" })).toBe("fr");
    expect(resolveLocale({ cookie: "de" })).toBe("en");
    expect(resolveLocale({})).toBe("en");
    expect(resolveLocale({ user: null, cookie: null })).toBe("en");
  });
});

describe("uiLanguageFromNative", () => {
  it("giữ nguyên nếu được hỗ trợ, ngược lại en", () => {
    expect(uiLanguageFromNative("vi")).toBe("vi");
    expect(uiLanguageFromNative("ko")).toBe("ko");
    expect(uiLanguageFromNative("de")).toBe("en");
    expect(uiLanguageFromNative(null)).toBe("en");
  });
});

describe("isLocale", () => {
  it("kiểm tra mã", () => {
    expect(isLocale("th")).toBe(true);
    expect(isLocale("TH")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
