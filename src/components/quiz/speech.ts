let current: HTMLAudioElement | null = null;

function synth(text: string, lang: string, rate: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export const NORMAL_RATE = 0.9;
export const SLOW_RATE = 0.7;

/** Play a term: dictionary audio when present, else browser speech (en-US for English sets, vi-VN otherwise). */
export function playTerm(text: string, opts: { audioUrl?: string | null; english: boolean; rate?: number }) {
  if (typeof window === "undefined") return;
  const rate = opts.rate ?? NORMAL_RATE;
  const lang = opts.english ? "en-US" : "vi-VN";
  current?.pause();
  current = null;
  if (!opts.audioUrl) return synth(text, lang, rate);
  const audio = new Audio(opts.audioUrl);
  audio.playbackRate = rate < NORMAL_RATE ? rate : 1;
  current = audio;
  const fallback = () => synth(text, lang, rate);
  audio.addEventListener("error", fallback, { once: true });
  audio.play().catch(fallback);
}

export function stopSpeech() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
