"use client";

import { Download, Eraser, Pencil, Presentation, Trash2, Undo2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import {
  BOARD_BG,
  BOARD_THEMES,
  CHALK_COLORS,
  CHALK_SIZE_KEYS,
  CHALK_SIZES,
  ERASER_DEFAULT,
  ERASER_MAX,
  ERASER_MIN,
  canSoften,
  clearAll,
  deviceRect,
  drawStroke,
  hasContent,
  inkColor,
  paintStroke,
  pressureFactor,
  smoothFactor,
  softEraseRegion,
  softness,
  speedFactor,
  strokeBounds,
  textureTile,
  textureUrl,
  undo,
  visibleStrokes,
  type Action,
  type BoardTheme,
  type InkColor,
  type Stroke,
} from "./board";
import { pushRecent } from "./color";
import { ColorPicker } from "./ColorPicker";

type Tool = "chalk" | "eraser";
/**
 * Cách vẽ nét đang kéo: "live" = nét phấn trên lớp mềm; "softErase" = tẩy mềm theo vùng;
 * "direct" = vẽ thẳng lên canvas chính (trình duyệt không hỗ trợ ctx.filter).
 */
type Mode = "live" | "softErase" | "direct";

const newCanvas = () => document.createElement("canvas");

/** Trang có thanh điều khiển dính đáy trên mobile → nâng nút lên để không che. */
const RAISED = /^\/(review(\/|$)|sets\/[^/]+\/study)/;

const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";

/**
 * Bảng viết tay nổi (chỉ cho user đã đăng nhập). Nội dung chỉ nằm trong bộ nhớ: component sống
 * trong root layout nên chuyển trang vẫn giữ, reload thì mất (có cảnh báo nếu bảng đang có nội dung).
 */
export function Whiteboard() {
  const t = useT("layout");
  const tc = useT("common");
  const pathname = usePathname();
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Action[]>([]);
  const [tool, setTool] = useState<Tool>("chalk");
  const [color, setColor] = useState<InkColor>("white");
  const [custom, setCustom] = useState<`#${string}`>("#5ec8f2");
  const [recent, setRecent] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerShift, setPickerShift] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [sizeIdx, setSizeIdx] = useState(2);
  const [eraserSize, setEraserSize] = useState(ERASER_DEFAULT);
  const [theme, setTheme] = useState<BoardTheme>("green");

  const panelRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Lớp trên chỉ chứa nét phấn đang vẽ, làm mềm viền bằng CSS blur (GPU, không tốn thêm công vẽ);
  // nhấc bút thì in nét đã làm mềm xuống canvas chính.
  const liveRef = useRef<HTMLCanvasElement>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  // Tẩy mềm: ảnh canvas lúc bắt đầu tẩy + mặt nạ (hình cả nét tẩy, nét sắc) để tính lại từng vùng.
  const snapRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cssWidth = useRef(0);
  // last: điểm thô cuối cùng (px CSS + thời gian) để lọc điểm quá gần và tính tốc độ.
  const current = useRef<{
    id: number;
    stroke: Stroke;
    mode: Mode;
    last?: { x: number; y: number; t: number };
  } | null>(null);
  const lastPenAt = useRef(0);

  const dirty = hasContent(history);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scratchRef.current ??= newCanvas();
    for (const s of visibleStrokes(history)) paintStroke(ctx, scratchRef.current, s, theme, cssWidth.current, dpr);
    const cur = current.current;
    const live = liveRef.current?.getContext("2d");
    live?.clearRect(0, 0, cssWidth.current, live.canvas.height);
    if (!cur) return;
    if (cur.mode === "live" && live) drawStroke(live, cur.stroke, theme, cssWidth.current);
    else if (cur.mode === "softErase") {
      // Đang tẩy dở mà phải vẽ lại (đổi cỡ / hoàn tác) → chụp lại ảnh nền và dựng lại mặt nạ.
      const { snap, mask } = beginSoftErase(ctx, snapRef, maskRef, dpr);
      drawStroke(mask, cur.stroke, theme, cssWidth.current, 0, false, true);
      const sigma = softness(cur.stroke.size * cssWidth.current);
      const r = deviceRect(strokeBounds(cur.stroke, cssWidth.current, sigma * 3 + 2), dpr, canvas.width, canvas.height);
      softEraseRegion(ctx, snap, mask.canvas, sigma * dpr, r);
    } else drawStroke(ctx, cur.stroke, theme, cssWidth.current);
  }, [history, theme]);
  const redrawRef = useRef(redraw);
  useEffect(() => {
    redrawRef.current = redraw;
    if (open) redraw();
  }, [open, redraw]);

  // Khớp kích thước canvas với khung (nhân devicePixelRatio cho nét sắc) và vẽ lại khi đổi cỡ.
  useEffect(() => {
    if (!open) return;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const live = liveRef.current;
    if (!box || !canvas || !live) return;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      // Kích thước layout, không dùng getBoundingClientRect: lúc mở, panel đang chạy hiệu ứng scale
      // → số đo bị thu nhỏ và ResizeObserver không báo lại khi hiệu ứng kết thúc → nét lệch con trỏ.
      const width = box.clientWidth;
      const height = box.clientHeight;
      cssWidth.current = width;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      live.width = canvas.width;
      live.height = canvas.height;
      live.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawRef.current();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [open]);

  // Reload / đóng tab khi bảng có nội dung → trình duyệt hỏi xác nhận (hộp thoại mặc định, không tuỳ biến được).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Hộp thoại: focus vào trong, Esc đóng, Tab vòng trong panel, Ctrl/Cmd+Z hoàn tác, khoá cuộn trang.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        // Đang mở bảng chọn màu thì Esc chỉ đóng bảng chọn màu.
        if (pickerRef.current?.querySelector("[role=dialog]")) setPickerOpen(false);
        else setOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setHistory(undo);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  // Bảng chọn màu: bấm ra ngoài thì đóng.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [pickerOpen]);

  const moveRing = (e: React.PointerEvent, visible: boolean) => {
    const ring = ringRef.current;
    const box = boxRef.current;
    if (!ring || !box) return;
    const erasing = tool === "eraser" || current.current?.stroke.kind === "erase";
    if (!visible || !erasing) {
      ring.style.opacity = "0";
      return;
    }

    const size =
      current.current?.stroke.kind === "erase" ? current.current.stroke.size * cssWidth.current : eraserSize;
    ring.style.width = ring.style.height = `${size}px`;
    const { x, y } = toLocal(box, e.clientX, e.clientY);
    ring.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    ring.style.opacity = "1";
  };

  /** Thu điểm và vẽ ngay phần mới (mỗi điểm một đoạn cong) → độ trễ thấp, nét dài không chậm đi. */
  const addPoints = (events: readonly PointerEvent[]) => {
    const cur = current.current;
    const layer = cur?.mode === "live" ? liveRef : cur?.mode === "softErase" ? maskRef : canvasRef;
    const ctx = layer.current?.getContext("2d");
    const box = boxRef.current;
    if (!cur || !ctx || !box) return;
    const w = cssWidth.current;
    const pts = cur.stroke.points;
    const from = pts.length;
    for (const ev of events) {
      const { x, y } = toLocal(box, ev.clientX, ev.clientY);
      const last = cur.last;
      // Bỏ điểm cách điểm trước < 1px: rung nhỏ của tay/cảm biến làm nét gợn mà không thêm chi tiết.
      if (last && Math.hypot(x - last.x, y - last.y) < 1) continue;
      let p = 1;
      if (cur.stroke.kind === "draw") {
        const target = ev.pointerType === "pen"
          ? pressureFactor("pen", ev.pressure)
          : last
            ? speedFactor(Math.hypot(x - last.x, y - last.y) / Math.max(1, ev.timeStamp - last.t))
            : 1;
        p = pts.length ? smoothFactor(pts[pts.length - 1].p, target) : target;
      }
      cur.last = { x, y, t: ev.timeStamp };
      pts.push({ x: x / w, y: y / w, p });
    }
    if (pts.length <= from) return;
    if (cur.mode === "softErase") {
      drawStroke(ctx, cur.stroke, theme, w, from, false, true);
      updateSoftErase(cur.stroke, from);
    } else drawStroke(ctx, cur.stroke, theme, w, from, false);
  };

  /** Tính lại vùng quanh các đoạn tẩy mới (từ điểm `from`) trên canvas chính. */
  const updateSoftErase = (stroke: Stroke, from: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    const snap = snapRef.current;
    const mask = maskRef.current;
    if (!ctx || !snap || !mask) return;
    const w = cssWidth.current;
    const dpr = window.devicePixelRatio || 1;
    const sigma = softness(stroke.size * w);
    // Đoạn i dùng điểm i-2..i → vùng ảnh hưởng là khung của các điểm đó, nới thêm 3σ.
    const part = { ...stroke, points: stroke.points.slice(Math.max(0, from - 2)) };
    const r = deviceRect(strokeBounds(part, w, sigma * 3 + 2), dpr, ctx.canvas.width, ctx.canvas.height);
    softEraseRegion(ctx, snap, mask, sigma * dpr, r);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (current.current) return; // chỉ một ngón / một bút tại một thời điểm
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Chống tì tay: ngay sau khi dùng bút, bỏ qua chạm bằng tay.
    if (e.pointerType === "touch" && Date.now() - lastPenAt.current < 800) return;
    if (e.pointerType === "pen") lastPenAt.current = Date.now();
    const w = cssWidth.current;
    if (w <= 0) return;
    // Đầu tẩy của bút (nút 5) luôn là tẩy.
    const penEraser = e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) !== 0);
    const stroke: Stroke =
      tool === "eraser" || penEraser
        ? { kind: "erase", size: eraserSize / w, points: [] }
        : { kind: "draw", color, size: CHALK_SIZES[sizeIdx] / w, points: [] };
    e.currentTarget.setPointerCapture(e.pointerId);
    const base = canvasRef.current?.getContext("2d");
    const live = liveRef.current;
    let mode: Mode = "direct";
    if (base && canSoften(base)) {
      if (stroke.kind === "draw" && live) {
        mode = "live";
        live.style.filter = `blur(${softness(stroke.size * w)}px)`;
      } else if (stroke.kind === "erase") {
        mode = "softErase";
        beginSoftErase(base, snapRef, maskRef, window.devicePixelRatio || 1);
      }
    }
    if (stroke.kind === "draw" && stroke.color.startsWith("#")) setRecent((r) => pushRecent(r, stroke.color));
    current.current = { id: e.pointerId, stroke, mode };
    addPoints([e.nativeEvent]);
    moveRing(e, true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = current.current;
    if (cur && cur.id === e.pointerId) {
      if (e.pointerType === "pen") lastPenAt.current = Date.now();
      const native = e.nativeEvent;
      addPoints(native.getCoalescedEvents?.().length ? native.getCoalescedEvents() : [native]);
    }
    moveRing(e, e.pointerType !== "touch" || !!cur);
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = current.current;
    if (!cur || cur.id !== e.pointerId) return;
    if (e.pointerType === "pen") lastPenAt.current = Date.now();
    current.current = null;
    const ctx = canvasRef.current?.getContext("2d");
    const live = liveRef.current;
    const n = cur.stroke.points.length;
    if (cur.mode === "softErase") {
      // Vẽ nốt nửa đoạn cuối vào mặt nạ rồi tính lại vùng đó.
      const mask = maskRef.current?.getContext("2d");
      if (mask) drawStroke(mask, cur.stroke, theme, cssWidth.current, n, true, true);
      updateSoftErase(cur.stroke, Math.max(0, n - 1));
    } else if (ctx && cur.mode === "live" && live) {
      // In cả nét (đã làm mềm) xuống canvas chính rồi xoá lớp trên — cùng một khung hình nên không nháy.
      scratchRef.current ??= newCanvas();
      paintStroke(ctx, scratchRef.current, cur.stroke, theme, cssWidth.current, window.devicePixelRatio || 1);
      live.getContext("2d")?.clearRect(0, 0, live.width, live.height);
    } else if (ctx) {
      // Vẽ nốt nửa đoạn cuối (tới đúng điểm nhấc bút).
      drawStroke(ctx, cur.stroke, theme, cssWidth.current, n, true);
    }
    setHistory((h) => [...h, cur.stroke]);
    if (e.pointerType === "touch") moveRing(e, false);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BOARD_BG[theme];
    ctx.fillRect(0, 0, out.width, out.height);
    const pattern = ctx.createPattern(textureTile(theme), "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, out.width, out.height);
    }
    ctx.drawImage(canvas, 0, 0);
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      a.href = url;
      a.download = `knowledge-board-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };

  const raised = RAISED.test(pathname);
  const texture = open ? textureUrl(theme) : null; // chỉ chạy ở client: SSR luôn render khi bảng đóng
  const boardStyle: CSSProperties = {
    backgroundColor: BOARD_BG[theme],
    backgroundImage: [
      texture ? `url(${texture})` : null,
      theme === "white"
        ? "linear-gradient(115deg, transparent 30%, rgb(255 255 255 / 0.7) 45%, transparent 60%)"
        : "radial-gradient(ellipse at 25% 20%, rgb(255 255 255 / 0.07), transparent 55%), radial-gradient(ellipse at 80% 85%, rgb(255 255 255 / 0.05), transparent 50%)",
    ]
      .filter(Boolean)
      .join(", "),
    boxShadow: theme === "white" ? "inset 0 1px 6px rgb(0 0 0 / 0.12)" : "inset 0 0 40px rgb(0 0 0 / 0.45)",
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("board.open")}
          title={t("board.open")}
          className={cn(
            "fixed right-4 z-30 flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/25 transition-transform hover:scale-105 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-6",
            raised ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6" : "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
          )}
        >
          <Presentation className="size-6" aria-hidden />
          {dirty && (
            <span className="absolute right-0.5 top-0.5 size-3 rounded-full bg-amber-400 ring-2 ring-surface">
              <span className="sr-only">{t("board.hasContent")}</span>
            </span>
          )}
        </button>
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex animate-fade items-stretch justify-center bg-scrim backdrop-blur-[2px] motion-reduce:animate-none sm:items-center sm:p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="flex h-dvh w-full animate-pop flex-col gap-3 bg-surface p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none motion-reduce:animate-none sm:h-[min(92dvh,860px)] sm:max-w-6xl sm:rounded-3xl sm:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold text-ink-900">
                  <Presentation className="size-5 text-accent" aria-hidden />
                  {t("board.title")}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={tc("close")}
                  className="flex size-11 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Group label={t("board.tool")}>
                  <ToolButton active={tool === "chalk"} label={t("board.chalk")} onClick={() => setTool("chalk")}>
                    <Pencil className="size-4" aria-hidden />
                  </ToolButton>
                  <ToolButton active={tool === "eraser"} label={t("board.eraser")} onClick={() => setTool("eraser")}>
                    <Eraser className="size-4" aria-hidden />
                  </ToolButton>
                </Group>

                {tool === "chalk" ? (
                  <>
                    <Group label={t("board.colors")}>
                      {CHALK_COLORS.map((c) => (
                        <ToolButton
                          key={c}
                          active={color === c}
                          label={theme === "white" && c === "white" ? t("board.color.dark") : t(`board.color.${c}`)}
                          onClick={() => {
                            setColor(c);
                            setPickerOpen(false);
                          }}
                        >
                          <span
                            aria-hidden
                            className="size-5 rounded-full ring-1 ring-ink-300"
                            style={{ backgroundColor: inkColor(theme, c) }}
                          />
                        </ToolButton>
                      ))}
                      <div ref={pickerRef} className="relative">
                        <ToolButton
                          active={color === custom}
                          expanded={pickerOpen}
                          label={t("board.picker.open")}
                          onClick={(e) => {
                            setColor(custom);
                            if (!pickerOpen) {
                              // Khung chọn màu rộng ~264px: dịch sang trái nếu sẽ tràn mép phải màn hình.
                              const left = e.currentTarget.getBoundingClientRect().left;
                              setPickerShift(Math.min(0, window.innerWidth - 8 - (left + 264)));
                            }
                            setPickerOpen(!pickerOpen);
                          }}
                        >
                          <span
                            aria-hidden
                            className="flex size-5 items-center justify-center rounded-full"
                            style={{ backgroundImage: "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
                          >
                            <span className="size-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: custom }} />
                          </span>
                        </ToolButton>
                        {pickerOpen && (
                          <div
                            role="dialog"
                            aria-label={t("board.picker.title")}
                            className="absolute top-full z-10 mt-2 rounded-2xl bg-surface p-3 shadow-xl ring-1 ring-ink-200"
                            style={{ left: pickerShift }}
                          >
                            <ColorPicker
                              value={custom}
                              recent={recent}
                              onChange={(hex) => {
                                setCustom(hex);
                                setColor(hex);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </Group>
                    <Group label={t("board.size")}>
                      {CHALK_SIZES.map((px, i) => (
                        <ToolButton
                          key={px}
                          active={sizeIdx === i}
                          label={t(`board.sizes.${CHALK_SIZE_KEYS[i]}`)}
                          onClick={() => setSizeIdx(i)}
                        >
                          <span aria-hidden className="rounded-full bg-ink-800" style={{ width: px + 3, height: px + 3 }} />
                        </ToolButton>
                      ))}
                    </Group>
                  </>
                ) : (
                  <label className="flex items-center gap-2 rounded-xl bg-ink-100 px-3 py-2 text-sm text-ink-700">
                    <span>{t("board.eraserSize")}</span>
                    <input
                      type="range"
                      min={ERASER_MIN}
                      max={ERASER_MAX}
                      step={4}
                      value={eraserSize}
                      onChange={(e) => setEraserSize(Number(e.target.value))}
                      className="w-28 accent-brand-600 sm:w-36"
                    />
                    <span className="w-9 tabular-nums text-ink-500">{eraserSize}</span>
                  </label>
                )}

                <Group label={t("board.background")}>
                  {BOARD_THEMES.map((b) => (
                    <ToolButton key={b} active={theme === b} label={t(`board.bg.${b}`)} onClick={() => setTheme(b)}>
                      <span
                        aria-hidden
                        className="size-5 rounded-md ring-1 ring-ink-300"
                        style={{ backgroundColor: BOARD_BG[b] }}
                      />
                    </ToolButton>
                  ))}
                </Group>

                <div className="ml-auto flex items-center gap-1">
                  <ToolButton
                    label={t("board.undo")}
                    disabled={history.length === 0}
                    onClick={() => setHistory(undo)}
                  >
                    <Undo2 className="size-4" aria-hidden />
                  </ToolButton>
                  <ToolButton
                    label={t("board.clear")}
                    disabled={visibleStrokes(history).length === 0}
                    onClick={() => setHistory(clearAll)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </ToolButton>
                  <ToolButton label={t("board.download")} onClick={download}>
                    <Download className="size-4" aria-hidden />
                  </ToolButton>
                </div>
              </div>

              <div
                className={cn(
                  "min-h-0 flex-1 rounded-2xl p-2 shadow-inner sm:p-3",
                  theme === "white"
                    ? "bg-[linear-gradient(180deg,#eef0f2,#b9bec5_55%,#d9dde1)]"
                    : "bg-[repeating-linear-gradient(92deg,rgb(0_0_0/0.06)_0_2px,transparent_2px_9px),linear-gradient(135deg,#9a6638,#6e4424_40%,#93623a_70%,#5f3a1f)]",
                )}
              >
                <div ref={boxRef} className="relative h-full w-full overflow-hidden rounded-lg" style={boardStyle}>
                  <canvas
                    ref={canvasRef}
                    aria-label={t("board.canvasAria")}
                    role="img"
                    className={cn("absolute inset-0 size-full touch-none select-none", tool === "eraser" ? "cursor-none" : "cursor-crosshair")}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endStroke}
                    onPointerCancel={endStroke}
                    onPointerLeave={(e) => {
                      if (!current.current) moveRing(e, false);
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <canvas ref={liveRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
                  <div
                    ref={ringRef}
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute left-0 top-0 rounded-full border-2 opacity-0",
                      theme === "white" ? "border-ink-500/70 bg-ink-500/10" : "border-white/70 bg-white/10",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** Chuẩn bị tẩy mềm: chụp canvas chính hiện tại và xoá mặt nạ (cùng kích thước, scale theo dpr). */
function beginSoftErase(
  base: CanvasRenderingContext2D,
  snapRef: React.RefObject<HTMLCanvasElement | null>,
  maskRef: React.RefObject<HTMLCanvasElement | null>,
  dpr: number,
): { snap: HTMLCanvasElement; mask: CanvasRenderingContext2D } {
  const { width, height } = base.canvas;
  const snap = (snapRef.current ??= newCanvas());
  const mask = (maskRef.current ??= newCanvas());
  for (const c of [snap, mask]) {
    if (c.width !== width || c.height !== height) {
      c.width = width;
      c.height = height;
    }
  }
  const sctx = snap.getContext("2d")!;
  sctx.clearRect(0, 0, width, height);
  sctx.drawImage(base.canvas, 0, 0);
  const mctx = mask.getContext("2d")!;
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.clearRect(0, 0, width, height);
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { snap, mask: mctx };
}

/** Toạ độ màn hình → toạ độ layout bên trong `el` (đúng cả khi tổ tiên đang bị transform/scale). */
function toLocal(el: HTMLElement, clientX: number, clientY: number): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  const sx = r.width > 0 ? el.clientWidth / r.width : 1;
  const sy = r.height > 0 ? el.clientHeight / r.height : 1;
  return { x: (clientX - r.left) * sx, y: (clientY - r.top) * sy };
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 rounded-xl bg-ink-100 p-1">
      {children}
    </div>
  );
}

function ToolButton({
  active,
  expanded,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  expanded?: boolean;
  label: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      aria-expanded={expanded}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-lg text-ink-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 disabled:opacity-40",
        active ? "bg-surface text-accent shadow-sm ring-1 ring-ink-200" : "hover:bg-ink-200/70",
      )}
    >
      {children}
    </button>
  );
}
