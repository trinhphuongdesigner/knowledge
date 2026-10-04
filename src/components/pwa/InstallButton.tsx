"use client";

import { Download, PlusSquare, Share, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { RichText } from "@/components/ui/RichText";
import { useT } from "@/i18n/client";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const noopSubscribe = () => () => {};

// iOS không có `beforeinstallprompt` (mọi trình duyệt iOS đều dùng WebKit),
// nên phải tự phát hiện và hướng dẫn người dùng "Thêm vào MH chính".
function useIosInstallable() {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const ua = navigator.userAgent;
      const isIos =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const standalone =
        (navigator as Navigator & { standalone?: boolean }).standalone ===
          true || window.matchMedia("(display-mode: standalone)").matches;
      return isIos && !standalone;
    },
    () => false,
  );
}

const buttonClass =
  "flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export function InstallButton() {
  const t = useT("layout");
  const tc = useT("common");
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(
    null,
  );
  const [showIosHelp, setShowIosHelp] = useState(false);
  const iosInstallable = useIosInstallable();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!promptEvent && !iosInstallable) return null;

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (promptEvent) {
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
          } else {
            setShowIosHelp(true);
          }
        }}
        className={buttonClass}
      >
        <Download className="size-5" aria-hidden />
        <span className="hidden sm:inline">{t("install.button")}</span>
        <span className="sr-only sm:hidden">{t("install.button")}</span>
      </button>

      {showIosHelp &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("install.iosAria")}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
            onClick={() => setShowIosHelp(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-ink-200 bg-surface p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-ink-900">
                  {t("install.iosTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIosHelp(false)}
                  className="-m-2 flex size-11 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
                  aria-label={tc("close")}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <ol className="mt-3 space-y-3 text-sm text-ink-700">
                <li className="flex items-center gap-2">
                  <Share className="size-5 shrink-0" aria-hidden />
                  <span>
                    <RichText text={t("install.step1")} />
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <PlusSquare className="size-5 shrink-0" aria-hidden />
                  <span>
                    <RichText text={t("install.step2")} />
                  </span>
                </li>
              </ol>
              <p className="mt-3 text-xs text-ink-500">
                {t("install.iosNote")}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
