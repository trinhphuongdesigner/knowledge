import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSfxEnabled, playSfx, setSfxEnabled } from "../sfx";

describe("sfx preference", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is on by default and can be turned off and on again", () => {
    expect(isSfxEnabled()).toBe(true);
    setSfxEnabled(false);
    expect(isSfxEnabled()).toBe(false);
    setSfxEnabled(true);
    expect(isSfxEnabled()).toBe(true);
  });

  it("stays on when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(isSfxEnabled()).toBe(true);
    expect(() => setSfxEnabled(false)).not.toThrow();
  });

  it("playing without Web Audio (server / old browser) is a no-op", () => {
    expect(() => playSfx("correct")).not.toThrow();
    expect(() => playSfx("wrong")).not.toThrow();
  });
});
