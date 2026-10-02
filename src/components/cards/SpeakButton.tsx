"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

let current: HTMLAudioElement | null = null;

function speakWithVoice(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/** Plays the dictionary audio when available, otherwise falls back to browser speech synthesis (en-US). */
export function speak(text: string, audioUrl?: string | null) {
  if (typeof window === "undefined") return;
  current?.pause();
  current = null;
  if (!audioUrl) {
    speakWithVoice(text);
    return;
  }
  const audio = new Audio(audioUrl);
  current = audio;
  const fallback = () => speakWithVoice(text);
  audio.addEventListener("error", fallback, { once: true });
  audio.play().catch(fallback);
}

export function SpeakButton({
  text,
  audioUrl,
  className,
  tabIndex,
}: {
  text: string;
  audioUrl?: string | null;
  className?: string;
  tabIndex?: number;
}) {
  return (
    <button
      type="button"
      aria-label="Phát âm"
      tabIndex={tabIndex}
      title="Phát âm"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, audioUrl);
      }}
      // Study cards flip on pointer/click; keep the press from reaching them (and the swipe handler).
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl text-accent hover:bg-brand-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        className,
      )}
    >
      <Volume2 className="size-5" aria-hidden />
    </button>
  );
}

/** "(adjective) /ˈeɪbl/" — renders nothing when both parts are empty. */
export function PhoneticLine({
  phonetic,
  partOfSpeech,
  className,
}: {
  phonetic?: string | null;
  partOfSpeech?: string | null;
  className?: string;
}) {
  if (!phonetic && !partOfSpeech) return null;
  return (
    <span className={cn("break-words text-sm text-ink-500", className)}>
      {partOfSpeech && <span className="italic">({partOfSpeech})</span>}
      {partOfSpeech && phonetic && " "}
      {phonetic && <span className="font-medium text-accent-strong">{phonetic}</span>}
    </span>
  );
}
