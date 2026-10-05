/** Logic thuần của bảng viết tay: nét, lịch sử (hoàn tác / xoá hết), màu theo nền bảng. */

export type BoardTheme = "green" | "black" | "white";
export type ChalkColor = "white" | "yellow" | "pink";
/** Màu phấn có sẵn (đổi sắc theo nền bảng) hoặc màu tự chọn "#rrggbb" (giữ nguyên trên mọi nền). */
export type InkColor = ChalkColor | `#${string}`;

/** Toạ độ và độ dày chuẩn hoá theo chiều rộng bảng → đổi kích thước / xoay máy vẫn giữ đúng tỉ lệ. */
export type Point = { x: number; y: number; p: number }; // p: hệ số độ dày (lực nhấn bút; 1 với chuột/tay)
export type Stroke =
  | { kind: "draw"; color: InkColor; size: number; points: Point[] }
  | { kind: "erase"; size: number; points: Point[] };
export type Action = Stroke | { kind: "clear" };

export const BOARD_THEMES: readonly BoardTheme[] = ["green", "black", "white"];
export const CHALK_COLORS: readonly ChalkColor[] = ["white", "yellow", "pink"];
/** Độ dày phấn (px CSS tại thời điểm vẽ). */
export const CHALK_SIZES = [1.5, 3, 6, 11] as const;
export const CHALK_SIZE_KEYS = ["xs", "s", "m", "l"] as const;
export const ERASER_MIN = 12;
export const ERASER_MAX = 120;
export const ERASER_DEFAULT = 40;

export const BOARD_BG: Record<BoardTheme, string> = {
  green: "#2e4a3d",
  black: "#1f2423",
  white: "#f6f6f1",
};

/** Bảng trắng không dùng được phấn trắng → "white" hiển thị thành bút dạ đen, các màu khác đậm hơn. */
export const INK: Record<BoardTheme, Record<ChalkColor, string>> = {
  green: { white: "#f3f0e6", yellow: "#f6dc6b", pink: "#f5a8c6" },
  black: { white: "#f1f1ec", yellow: "#f5d65a", pink: "#f39bbd" },
  white: { white: "#1f2933", yellow: "#c98a04", pink: "#d0367a" },
};

export function inkColor(theme: BoardTheme, color: InkColor): string {
  return color.startsWith("#") ? color : INK[theme][color as ChalkColor];
}

/** Hệ số độ dày theo lực nhấn: chỉ bút mới có lực nhấn tin cậy được. */
export function pressureFactor(pointerType: string, pressure: number): number {
  if (pointerType !== "pen") return 1;
  return 0.35 + Math.min(1, Math.max(0, pressure)) * 1.3;
}

/** Chuột/tay không có lực nhấn → mô phỏng nhẹ theo tốc độ (px/ms): nhanh thì mảnh, chậm thì đậm. */
export function speedFactor(speed: number): number {
  return Math.min(1.15, Math.max(0.6, 1.15 - speed * 0.18));
}

/**
 * Làm mượt độ dày (trung bình trượt mũ): độ dày đổi dần qua nhiều điểm thay vì nhảy bậc
 * giữa hai đoạn liền nhau — chính là cái làm nét trông "mượt" như app ghi chú.
 */
export function smoothFactor(prev: number, target: number, alpha = 0.3): number {
  return prev + (target - prev) * alpha;
}

/** Các nét còn hiển thị: mọi thứ sau lần "xoá hết" gần nhất. */
export function visibleStrokes(history: readonly Action[]): Stroke[] {
  let start = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].kind === "clear") {
      start = i + 1;
      break;
    }
  }
  return history.slice(start) as Stroke[];
}

/** Bảng có nội dung (đã có nét phấn sau lần xoá hết gần nhất) → cảnh báo trước khi reload. */
export function hasContent(history: readonly Action[]): boolean {
  return visibleStrokes(history).some((s) => s.kind === "draw");
}

/** "Xoá hết" là một bước trong lịch sử nên hoàn tác được; bảng trống thì không thêm bước thừa. */
export function clearAll(history: readonly Action[]): Action[] {
  return visibleStrokes(history).length === 0 ? [...history] : [...history, { kind: "clear" }];
}

export function undo(history: readonly Action[]): Action[] {
  return history.slice(0, -1);
}

/**
 * Vẽ nét `s` tăng dần từ điểm `from`: mỗi điểm mới chỉ vẽ thêm MỘT đoạn (O(1)/sự kiện) nên kéo
 * bao lâu cũng không chậm đi. Đoạn i là đường cong bậc hai từ trung điểm (i-2,i-1) tới trung điểm
 * (i-1,i), điểm điều khiển là điểm i-1 → các đoạn nối nhau liền tiếp tuyến, không gãy góc.
 * Nửa đoạn cuối (trung điểm cuối → điểm cuối) chỉ vẽ khi `tail` (đã nhấc bút / vẽ lại cả nét).
 * `width` = chiều rộng bảng theo px CSS; ctx đã được scale theo devicePixelRatio.
 * `mask`: vẽ hình nét bằng màu đặc (kể cả nét tẩy) để làm mặt nạ cho viền mềm.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  theme: BoardTheme,
  width: number,
  from = 0,
  tail = true,
  mask = false,
): void {
  const pts = s.points;
  const n = pts.length;
  if (n === 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (mask || s.kind === "erase") {
    ctx.globalCompositeOperation = mask ? "source-over" : "destination-out";
    ctx.strokeStyle = ctx.fillStyle = "#000";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = ctx.fillStyle = inkColor(theme, s.color);
  }
  const X = (i: number) => pts[i].x * width;
  const Y = (i: number) => pts[i].y * width;
  const W = (i: number) => s.size * pts[i].p * width;

  if (n === 1) {
    if (from === 0) {
      ctx.beginPath();
      ctx.arc(X(0), Y(0), W(0) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    for (let i = Math.max(1, from); i < n; i++) {
      ctx.lineWidth = (W(i - 1) + W(i)) / 2;
      ctx.beginPath();
      if (i === 1) ctx.moveTo(X(0), Y(0));
      else ctx.moveTo((X(i - 2) + X(i - 1)) / 2, (Y(i - 2) + Y(i - 1)) / 2);
      ctx.quadraticCurveTo(X(i - 1), Y(i - 1), (X(i - 1) + X(i)) / 2, (Y(i - 1) + Y(i)) / 2);
      ctx.stroke();
    }
    if (tail) {
      ctx.lineWidth = W(n - 1);
      ctx.beginPath();
      ctx.moveTo((X(n - 2) + X(n - 1)) / 2, (Y(n - 2) + Y(n - 1)) / 2);
      ctx.lineTo(X(n - 1), Y(n - 1));
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Độ mềm viền nét / tẩy (độ lệch chuẩn của Gaussian blur, px CSS) theo độ dày: nét đậm mềm rõ,
 * nét mảnh chỉ mềm nhẹ để không bị nhoè mất; tẩy to mềm như khăn lau.
 */
export function softness(sizePx: number): number {
  return Math.max(0.35, sizePx * 0.12);
}

/** Khung bao nét theo px CSS (đã tính nửa độ dày lớn nhất), nới thêm `pad`. */
export function strokeBounds(s: Stroke, width: number, pad = 0): Rect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxP = 0;
  for (const p of s.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
    maxP = Math.max(maxP, p.p);
  }
  if (!s.points.length) return { x: 0, y: 0, w: 0, h: 0 };
  const r = (s.size * maxP * width) / 2 + pad;
  return { x: minX * width - r, y: minY * width - r, w: (maxX - minX) * width + 2 * r, h: (maxY - minY) * width + 2 * r };
}

/** Trình duyệt hỗ trợ ctx.filter (Chrome, Firefox, Safari 18+) → vẽ được nét viền mềm. */
export function canSoften(ctx: CanvasRenderingContext2D): boolean {
  return typeof ctx.filter === "string";
}

/**
 * Vẽ cả nét lên `ctx` (đã scale theo `dpr`) với viền mềm: vẽ hình nét sắc ra canvas nháp rồi in sang
 * với blur MỘT lần cho cả nét — blur từng đoạn sẽ cộng dồn ở chỗ nối, làm viền phình và gợn.
 * Nét tẩy in mặt nạ đã làm mềm bằng destination-out. Chỉ xử lý vùng bao quanh nét nên vẽ lại vẫn nhẹ.
 */
export function paintStroke(
  ctx: CanvasRenderingContext2D,
  scratch: HTMLCanvasElement,
  s: Stroke,
  theme: BoardTheme,
  width: number,
  dpr: number,
): void {
  if (!canSoften(ctx)) {
    drawStroke(ctx, s, theme, width);
    return;
  }
  const { canvas } = ctx;
  if (scratch.width !== canvas.width || scratch.height !== canvas.height) {
    scratch.width = canvas.width;
    scratch.height = canvas.height;
  }
  const sctx = scratch.getContext("2d");
  if (!sctx) return;
  const sigma = softness(s.size * width);
  const { x, y, w, h } = deviceRect(strokeBounds(s, width, sigma * 3 + 1), dpr, canvas.width, canvas.height);
  if (w <= 0 || h <= 0) return;
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.clearRect(x, y, w, h);
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawStroke(sctx, s, theme, width, 0, true, s.kind === "erase");
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = s.kind === "erase" ? "destination-out" : "source-over";
  ctx.filter = `blur(${sigma * dpr}px)`;
  ctx.drawImage(scratch, x, y, w, h, x, y, w, h);
  ctx.restore();
}

export type Rect = { x: number; y: number; w: number; h: number };

/** Khung (px CSS) → khung px thiết bị nguyên, cắt theo kích thước canvas. */
export function deviceRect(r: Rect, dpr: number, maxW: number, maxH: number): Rect {
  const x = Math.max(0, Math.floor(r.x * dpr));
  const y = Math.max(0, Math.floor(r.y * dpr));
  return { x, y, w: Math.min(maxW, Math.ceil((r.x + r.w) * dpr)) - x, h: Math.min(maxH, Math.ceil((r.y + r.h) * dpr)) - y };
}

/**
 * Tẩy mềm khi đang kéo: tính lại vùng `region` (px thiết bị) của canvas chính = ảnh lúc bắt đầu tẩy
 * trừ đi mặt nạ (cả nét tẩy tới giờ) đã làm mềm. Mỗi lần chỉ tính vùng quanh đoạn mới → O(1)/sự kiện,
 * và không cộng dồn như tẩy mềm từng đoạn (viền sẽ cứng lại và gợn).
 */
export function softEraseRegion(
  ctx: CanvasRenderingContext2D,
  snapshot: HTMLCanvasElement,
  mask: HTMLCanvasElement,
  sigmaDevice: number,
  region: Rect,
): void {
  const { x, y, w, h } = region;
  if (w <= 0 || h <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.clearRect(x, y, w, h);
  ctx.drawImage(snapshot, x, y, w, h, x, y, w, h);
  // Lấy mặt nạ rộng hơn vùng cần tính 3σ để blur ở mép vùng vẫn đúng.
  const pad = Math.ceil(sigmaDevice * 3);
  const mx = Math.max(0, x - pad);
  const my = Math.max(0, y - pad);
  const mw = Math.min(mask.width, x + w + pad) - mx;
  const mh = Math.min(mask.height, y + h + pad) - my;
  ctx.globalCompositeOperation = "destination-out";
  ctx.filter = `blur(${sigmaDevice}px)`;
  ctx.drawImage(mask, mx, my, mw, mh, mx, my, mw, mh);
  ctx.restore();
}

/** Ô nhiễu lặp lại tạo vân bảng (bụi phấn / mặt bảng trắng). Tạo một lần, dùng cho cả CSS và ảnh PNG. */
const tiles = new Map<BoardTheme, HTMLCanvasElement>();
export function textureTile(theme: BoardTheme): HTMLCanvasElement {
  const cached = tiles.get(theme);
  if (cached) return cached;
  const size = 160;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const light = theme !== "white";
    for (let i = 0; i < img.data.length; i += 4) {
      const r = Math.random();
      const v = light ? 255 : 90;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = r < 0.5 ? Math.round(r * (light ? 26 : 14)) : 0;
    }
    ctx.putImageData(img, 0, 0);
  }
  tiles.set(theme, c);
  return c;
}

const urls = new Map<BoardTheme, string>();
export function textureUrl(theme: BoardTheme): string {
  let url = urls.get(theme);
  if (!url) {
    url = textureTile(theme).toDataURL();
    urls.set(theme, url);
  }
  return url;
}
