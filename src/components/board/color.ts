/** Chuyển đổi màu cho bảng chọn màu kiểu Photoshop (HSV: h 0–360, s/v 0–1). */

export type Hsv = { h: number; s: number; v: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function hsvToHex({ h, s, v }: Hsv): `#${string}` {
  const f = (n: number) => {
    const k = (n + (((h % 360) + 360) % 360) / 60) % 6;
    const c = v - v * clamp01(s) * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(clamp01(c) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

/** "#rgb" / "rgb" / "#rrggbb" (không phân biệt hoa thường) → "#rrggbb"; sai định dạng → null. */
export function normalizeHex(input: string): `#${string}` | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return `#${hex.toLowerCase()}`;
}

/** `hue` dùng khi màu không có sắc (xám / đen / trắng) để thanh màu không nhảy về đỏ. */
export function hexToHsv(hex: string, hue = 0): Hsv {
  const n = normalizeHex(hex) ?? "#000000";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = hue;
  if (d > 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** Danh sách màu gần đây: màu mới lên đầu, không trùng, tối đa `max` màu. */
export function pushRecent(list: readonly string[], color: string, max = 8): string[] {
  return [color, ...list.filter((c) => c !== color)].slice(0, max);
}
