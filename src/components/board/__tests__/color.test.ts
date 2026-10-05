import { describe, expect, it } from "vitest";
import { hexToHsv, hsvToHex, normalizeHex, pushRecent } from "../color";

describe("normalizeHex", () => {
  it("chấp nhận #rgb, rgb, #rrggbb và đưa về chữ thường", () => {
    expect(normalizeHex("#FA0")).toBe("#ffaa00");
    expect(normalizeHex("fa0")).toBe("#ffaa00");
    expect(normalizeHex(" #12AbCd ")).toBe("#12abcd");
  });

  it("trả null khi sai định dạng", () => {
    for (const bad of ["", "#", "#12", "#1234", "#12345g", "red", "##123456"]) expect(normalizeHex(bad)).toBeNull();
  });
});

describe("hsvToHex / hexToHsv", () => {
  it("đổi đúng các màu cơ bản", () => {
    expect(hsvToHex({ h: 0, s: 1, v: 1 })).toBe("#ff0000");
    expect(hsvToHex({ h: 120, s: 1, v: 1 })).toBe("#00ff00");
    expect(hsvToHex({ h: 240, s: 1, v: 1 })).toBe("#0000ff");
    expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe("#ff0000");
    expect(hsvToHex({ h: 200, s: 0, v: 1 })).toBe("#ffffff");
    expect(hsvToHex({ h: 200, s: 1, v: 0 })).toBe("#000000");
  });

  it("đổi qua lại không lệch màu", () => {
    for (const hex of ["#5ec8f2", "#ff8800", "#123456", "#abcdef", "#7f7f7f", "#f9e79f"]) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it("màu không có sắc giữ nguyên sắc đang chọn", () => {
    expect(hexToHsv("#808080", 210).h).toBe(210);
    expect(hexToHsv("#000000", 45)).toEqual({ h: 45, s: 0, v: 0 });
    expect(hexToHsv("#ff0000", 210).h).toBe(0);
  });
});

describe("pushRecent", () => {
  it("đưa màu mới lên đầu, bỏ trùng, giới hạn số lượng", () => {
    expect(pushRecent(["#111111", "#222222"], "#222222")).toEqual(["#222222", "#111111"]);
    const many = Array.from({ length: 8 }, (_, i) => `#00000${i}`);
    const next = pushRecent(many, "#ffffff");
    expect(next).toHaveLength(8);
    expect(next[0]).toBe("#ffffff");
    expect(next).not.toContain("#000007");
  });
});
