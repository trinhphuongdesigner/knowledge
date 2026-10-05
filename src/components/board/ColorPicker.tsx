"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { hexToHsv, hsvToHex, normalizeHex, type Hsv } from "./color";

type Props = {
  value: string;
  recent: readonly string[];
  onChange: (hex: `#${string}`) => void;
};

/**
 * Bảng chọn màu kiểu Photoshop: ô vuông độ bão hoà (ngang) × độ sáng (dọc), thanh sắc màu,
 * ô nhập mã HEX và các màu dùng gần đây. Kéo bằng chuột / tay / bút, hoặc dùng phím mũi tên.
 */
export function ColorPicker({ value, recent, onChange }: Props) {
  const t = useT("layout");
  // Giữ HSV riêng: màu xám/đen không có sắc, suy ngược từ HEX sẽ làm thanh sắc màu nhảy về đỏ.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [seen, setSeen] = useState(value);
  const [hexText, setHexText] = useState(value);
  if (value !== seen) {
    // Màu đổi từ bên ngoài (chọn màu gần đây…) → đồng bộ lại, giữ sắc hiện tại nếu màu không có sắc.
    setSeen(value);
    setHexText(value);
    if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value, hsv.h));
  }

  const update = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setSeen(hex);
    setHexText(hex);
    onChange(hex);
  };

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const ratio = (el: HTMLElement | null, e: PointerEvent) => {
    const r = el?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return null;
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };
  const onSv = (e: PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointerdown") e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const p = ratio(svRef.current, e);
    if (p) update({ h: hsv.h, s: p.x, v: 1 - p.y });
  };
  const onHue = (e: PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointerdown") e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const p = ratio(hueRef.current, e);
    if (p) update({ ...hsv, h: p.x * 360 });
  };

  const step = (e: KeyboardEvent) => (e.shiftKey ? 0.1 : 0.01);
  const onSvKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = step(e);
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: hsv.s - d },
      ArrowRight: { s: hsv.s + d },
      ArrowUp: { v: hsv.v + d },
      ArrowDown: { v: hsv.v - d },
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    update({ h: hsv.h, s: clamp(m.s ?? hsv.s), v: clamp(m.v ?? hsv.v) });
  };
  const onHueKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowRight" || e.key === "ArrowUp" ? d : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -d : 0;
    if (!delta) return;
    e.preventDefault();
    update({ ...hsv, h: Math.min(360, Math.max(0, hsv.h + delta)) });
  };

  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="flex w-60 flex-col gap-3">
      <div
        ref={svRef}
        role="slider"
        tabIndex={0}
        aria-label={t("board.picker.sv")}
        aria-valuetext={`${pct(hsv.s)}, ${pct(hsv.v)}`}
        aria-valuenow={Math.round(hsv.s * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-36 w-full cursor-crosshair touch-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        style={{
          backgroundColor: hueColor,
          backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
        onPointerDown={onSv}
        onPointerMove={onSv}
        onKeyDown={onSvKey}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]"
          style={{ left: pct(hsv.s), top: pct(1 - hsv.v), backgroundColor: value }}
        />
      </div>

      <div
        ref={hueRef}
        role="slider"
        tabIndex={0}
        aria-label={t("board.picker.hue")}
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        className="relative h-3.5 w-full cursor-pointer touch-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        style={{
          backgroundImage: "linear-gradient(to right, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00)",
        }}
        onPointerDown={onHue}
        onPointerMove={onHue}
        onKeyDown={onHueKey}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]"
          style={{ left: pct(hsv.h / 360), backgroundColor: hueColor }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <span aria-hidden className="size-8 shrink-0 rounded-lg ring-1 ring-ink-300" style={{ backgroundColor: value }} />
        <span className="shrink-0">{t("board.picker.hex")}</span>
        <input
          value={hexText}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setHexText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex && e.target.value.replace("#", "").length === 6) {
              setHsv(hexToHsv(hex, hsv.h));
              setSeen(hex);
              onChange(hex);
            }
          }}
          onBlur={() => {
            const hex = normalizeHex(hexText);
            if (hex && hex !== value) {
              setHsv(hexToHsv(hex, hsv.h));
              onChange(hex);
            }
            setHexText(hex ?? value);
          }}
          className="h-8 w-full min-w-0 rounded-lg border border-ink-200 bg-surface px-2 font-mono text-sm uppercase text-ink-900 focus:border-brand-500 focus:outline-none"
        />
      </label>

      {recent.length > 0 && (
        <div role="group" aria-label={t("board.picker.recent")} className="flex flex-wrap gap-1.5">
          {recent.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              title={c}
              aria-pressed={c === value}
              onClick={() => onChange(c as `#${string}`)}
              className={cn(
                "size-6 rounded-md ring-1 ring-ink-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
                c === value && "ring-2 ring-brand-600",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
