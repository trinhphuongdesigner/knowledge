"use client";

import { useId } from "react";
import { useT } from "@/i18n/client";
import { playSfx, setSfxEnabled, useSfxEnabled } from "@/lib/sfx";

/** Bật/tắt âm thanh đúng/sai khi làm bài kiểm tra. Lưu theo thiết bị; bật lên thì phát thử một tiếng. */
export function SoundEffectsToggle() {
  const t = useT("account");
  const enabled = useSfxEnabled();
  const hintId = useId();

  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        role="switch"
        checked={enabled}
        onChange={(e) => {
          setSfxEnabled(e.target.checked);
          if (e.target.checked) playSfx("correct");
        }}
        aria-describedby={hintId}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-600 peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600"
      />
      <span className="text-sm">
        <span className="block font-medium text-ink-900">{t("sound.label")}</span>
        <span id={hintId} className="block text-xs text-ink-500">
          {t("sound.hint")}
        </span>
      </span>
    </label>
  );
}
