import { describe, expect, it } from "vitest";
import {
  clearAll,
  drawStroke,
  hasContent,
  pressureFactor,
  smoothFactor,
  speedFactor,
  undo,
  visibleStrokes,
  type Action,
  type Stroke,
} from "../board";

const draw: Stroke = { kind: "draw", color: "white", size: 0.01, points: [{ x: 0.1, y: 0.1, p: 1 }] };
const erase: Stroke = { kind: "erase", size: 0.05, points: [{ x: 0.1, y: 0.1, p: 1 }] };

describe("board history", () => {
  it("is empty at first", () => {
    expect(hasContent([])).toBe(false);
    expect(visibleStrokes([])).toEqual([]);
  });

  it("has content once a chalk stroke is drawn", () => {
    expect(hasContent([draw])).toBe(true);
    expect(hasContent([erase])).toBe(false);
  });

  it("clear all hides earlier strokes and can be undone", () => {
    const cleared = clearAll([draw, erase]);
    expect(visibleStrokes(cleared)).toEqual([]);
    expect(hasContent(cleared)).toBe(false);
    const restored = undo(cleared);
    expect(visibleStrokes(restored)).toEqual([draw, erase]);
    expect(hasContent(restored)).toBe(true);
  });

  it("only shows strokes after the latest clear", () => {
    const h: Action[] = [draw, { kind: "clear" }, erase, draw];
    expect(visibleStrokes(h)).toEqual([erase, draw]);
  });

  it("does not add a clear step to an empty board", () => {
    expect(clearAll([])).toEqual([]);
    expect(clearAll([draw, { kind: "clear" }])).toEqual([draw, { kind: "clear" }]);
  });

  it("undo removes the last step", () => {
    expect(undo([draw, erase])).toEqual([draw]);
    expect(undo([])).toEqual([]);
  });
});

describe("pressureFactor", () => {
  it("ignores pressure for mouse and touch", () => {
    expect(pressureFactor("mouse", 0.5)).toBe(1);
    expect(pressureFactor("touch", 0)).toBe(1);
  });

  it("scales pen width with pressure", () => {
    expect(pressureFactor("pen", 0)).toBeCloseTo(0.35);
    expect(pressureFactor("pen", 1)).toBeCloseTo(1.65);
    expect(pressureFactor("pen", 2)).toBeCloseTo(1.65);
  });
});

describe("width smoothing", () => {
  it("thins fast mouse/touch strokes within bounds", () => {
    expect(speedFactor(0)).toBeCloseTo(1.15);
    expect(speedFactor(2)).toBeLessThan(speedFactor(0.5));
    expect(speedFactor(100)).toBe(0.6);
  });

  it("moves gradually toward the target width", () => {
    const next = smoothFactor(1, 0.5);
    expect(next).toBeLessThan(1);
    expect(next).toBeGreaterThan(0.5);
  });
});

/** Ghi lại các lệnh vẽ (bỏ save/restore) để so sánh cách vẽ tăng dần với vẽ lại cả nét. */
function recorder() {
  const calls: string[] = [];
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (_, key: string) => (...args: number[]) => {
      if (key !== "save" && key !== "restore") calls.push(`${key}(${args.map((a) => a.toFixed(3)).join(",")})`);
    },
    set: (_, key: string, value) => {
      calls.push(`${key}=${typeof value === "number" ? value.toFixed(3) : value}`);
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

describe("drawStroke", () => {
  const stroke: Stroke = {
    kind: "draw",
    color: "white",
    size: 0.01,
    points: Array.from({ length: 7 }, (_, i) => ({ x: 0.1 + i * 0.03, y: 0.2 + (i % 2) * 0.02, p: 1 - i * 0.05 })),
  };

  it("draws one curve per point plus the tail", () => {
    const { ctx, calls } = recorder();
    drawStroke(ctx, stroke, "green", 800);
    expect(calls.filter((c) => c.startsWith("quadraticCurveTo"))).toHaveLength(6);
    expect(calls.filter((c) => c.startsWith("lineTo"))).toHaveLength(1);
  });

  it("incremental drawing matches a full redraw", () => {
    const full = recorder();
    drawStroke(full.ctx, stroke, "green", 800);

    const live = recorder();
    const partial: Stroke = { ...stroke, points: [] };
    for (const chunk of [[0, 1], [2], [3], [4, 5, 6]]) {
      const from = partial.points.length;
      for (const i of chunk) partial.points.push(stroke.points[i]);
      drawStroke(live.ctx, partial, "green", 800, from, false);
    }
    drawStroke(live.ctx, partial, "green", 800, partial.points.length, true);

    const geometry = (calls: string[]) => calls.filter((c) => !/^(lineCap|lineJoin|globalComposite|strokeStyle|fillStyle)/.test(c));
    expect(geometry(live.calls)).toEqual(geometry(full.calls));
  });

  it("a single tap is a dot", () => {
    const { ctx, calls } = recorder();
    drawStroke(ctx, { ...stroke, points: [stroke.points[0]] }, "green", 800);
    expect(calls.some((c) => c.startsWith("arc"))).toBe(true);
  });
});
