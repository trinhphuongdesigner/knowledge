let current: HTMLAudioElement | null = null;

function synth(text: string, lang: string, rate: number, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return onEnd();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
}

export const NORMAL_RATE = 0.9;
export const SLOW_RATE = 0.7;

/**
 * Play a term: dictionary audio when present, else browser speech (en-US for English sets, vi-VN otherwise).
 * Resolves when playback ends, fails or is stopped (never rejects).
 */
export function playTerm(text: string, opts: { audioUrl?: string | null; english: boolean; rate?: number }): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const rate = opts.rate ?? NORMAL_RATE;
  const lang = opts.english ? "en-US" : "vi-VN";
  current?.pause();
  current = null;
  return new Promise((resolve) => {
    const done = () => resolve();
    if (!opts.audioUrl) return synth(text, lang, rate, done);
    const audio = new Audio(opts.audioUrl);
    audio.playbackRate = rate < NORMAL_RATE ? rate : 1;
    current = audio;
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      // Already replaced/stopped by another call: don't start speaking over it.
      if (current === audio) synth(text, lang, rate, done);
      else done();
    };
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("pause", done, { once: true });
    audio.addEventListener("error", fallback, { once: true });
    audio.play().catch(fallback);
  });
}

export function stopSpeech() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
