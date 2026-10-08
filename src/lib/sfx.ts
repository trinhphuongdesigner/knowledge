import { useSyncExternalStore } from "react";

/**
 * Hiệu ứng âm thanh khi làm bài kiểm tra (đúng: "ting" hai nốt đi lên, sai: tiếng trầm ngắn).
 * Tổng hợp bằng Web Audio nên không cần file âm thanh và phát ngay không trễ.
 * Bật/tắt lưu trong localStorage (theo thiết bị), mặc định bật.
 */
export type Sfx = "correct" | "wrong";

const STORAGE_KEY = "knowledge:sfx";

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function isSfxEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSfxEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // storage blocked
  }
  listeners.forEach((cb) => cb());
}

export function useSfxEnabled() {
  return useSyncExternalStore(subscribe, isSfxEnabled, () => true);
}

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    ctx ??= new AC();
  } catch {
    return null;
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

function tone(ac: AudioContext, freq: number, start: number, duration: number, type: OscillatorType, peak: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  // Attack nhanh, tắt dần theo hàm mũ → tiếng gõ chuông, không bị "bụp" ở đầu/cuối.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const SOUNDS: Record<Sfx, (ac: AudioContext, t: number) => void> = {
  correct: (ac, t) => {
    // C6 → G6, thêm bồi âm quãng tám cho tiếng sáng như chuông.
    tone(ac, 1046.5, t, 0.14, "sine", 0.22);
    tone(ac, 2093, t, 0.1, "sine", 0.05);
    tone(ac, 1568, t + 0.09, 0.32, "sine", 0.24);
    tone(ac, 3136, t + 0.09, 0.2, "sine", 0.05);
  },
  wrong: (ac, t) => {
    tone(ac, 233, t, 0.14, "triangle", 0.28);
    tone(ac, 175, t + 0.11, 0.26, "triangle", 0.28);
  },
};

/**
 * Gọi trong sự kiện người dùng (bấm / Enter) khi định phát hiệu ứng muộn hơn (sau await):
 * iOS chỉ cho khởi động AudioContext trong thao tác người dùng.
 */
export function unlockSfx() {
  if (isSfxEnabled()) audioContext();
}

/** Phát hiệu ứng nếu người dùng chưa tắt. Không bao giờ throw. */
export function playSfx(name: Sfx) {
  if (!isSfxEnabled()) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    SOUNDS[name](ac, ac.currentTime + 0.01);
  } catch {
    // audio unavailable
  }
}
