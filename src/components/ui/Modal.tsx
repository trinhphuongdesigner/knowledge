"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Luôn căn giữa màn hình (kể cả mobile) thay vì bottom sheet — dùng cho hộp thoại xác nhận. */
  centered?: boolean;
};

const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";

/** Accessible dialog: Esc / overlay click closes, focus moves in on open and is restored on close. */
export function Modal({ open, onClose, title, children, centered = false }: ModalProps) {
  const t = useT("common");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Do not steal focus from a child that already grabbed it (autoFocus).
    if (panel && !panel.contains(document.activeElement)) panel.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
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

  if (!open || typeof document === "undefined") return null;

  // Portal ra <body>: tổ tiên có transform/animation (thẻ, danh sách) làm `fixed` định vị theo chính nó
  // thay vì viewport → popup hiện ngay tại vị trí trigger thay vì giữa màn hình.
  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex animate-fade justify-center bg-scrim backdrop-blur-[2px] motion-reduce:animate-none",
        centered ? "items-center p-4" : "items-end p-0 sm:items-center sm:p-4",
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "w-full animate-pop overflow-y-auto overscroll-contain bg-surface p-5 shadow-2xl focus:outline-none motion-reduce:animate-none sm:max-h-[90dvh] sm:max-w-lg sm:rounded-3xl",
          centered ? "max-h-[90dvh] max-w-md rounded-3xl" : "max-h-[92dvh] rounded-t-3xl",
        )}
      >
        <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-4 bg-surface px-5 pb-2 pt-5">
          <h2 id={titleId} className="text-lg font-semibold text-ink-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="-m-2 flex size-11 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
