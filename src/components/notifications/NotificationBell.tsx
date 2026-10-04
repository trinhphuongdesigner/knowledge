"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { api } from "@/lib/api";
import { badgeLabel } from "@/lib/notifications-core";
import type { NotificationDTO } from "@/lib/validators";
import { NotificationItem } from "./NotificationItem";

const POLL_MS = 60_000;

export function NotificationBell() {
  const t = useT("notifications");
  const tc = useT("common");
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDTO[] | null>(null);
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);
  const panelId = useId();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const refreshCount = useCallback(() => {
    api
      .unreadNotificationCount()
      .then((r) => setUnread(r.unreadCount))
      .catch(() => {});
  }, []);

  const loadList = useCallback(() => {
    api
      .listNotifications()
      .then((r) => {
        setItems(r.items);
        setUnread(r.unreadCount);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  // Đếm chưa đọc: lúc mount, mỗi 60s khi tab đang hiện, khi quay lại tab/cửa sổ, và khi push tới (postMessage từ SW).
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refreshCount();
    };
    const onPush = (e: MessageEvent) => {
      if (e.data?.type !== "PUSH_RECEIVED") return;
      refreshCount();
      if (openRef.current) loadList();
    };
    const first = setTimeout(refreshCount, 0);
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    navigator.serviceWorker?.addEventListener("message", onPush);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      navigator.serviceWorker?.removeEventListener("message", onPush);
    };
  }, [refreshCount, loadList]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (!open) loadList();
    setOpen((o) => !o);
  }

  function onItemOpen(n: NotificationDTO) {
    setOpen(false);
    if (n.read) return;
    setItems((cur) => cur?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? cur);
    setUnread((c) => Math.max(0, c - 1));
    api.markNotificationRead(n.id).catch(refreshCount);
  }

  function markAll() {
    setItems((cur) => cur?.map((x) => ({ ...x, read: true })) ?? cur);
    setUnread(0);
    api.markAllNotificationsRead().catch(refreshCount);
  }

  const label = badgeLabel(unread);

  return (
    <div ref={rootRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("title")}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="relative flex size-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Bell className="size-5" aria-hidden />
        {label && (
          <span
            aria-hidden
            className="absolute right-1 top-1 flex min-w-[1.125rem] items-center justify-center rounded-full bg-danger px-1 text-[0.6875rem] font-bold leading-[1.125rem] text-white ring-2 ring-paper"
          >
            {label}
          </span>
        )}
        {unread > 0 && <span className="sr-only">{t("unreadCount", { count: unread })}</span>}
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute inset-x-2 top-full z-50 mt-1 rounded-xl border border-ink-200 bg-surface p-2 shadow-lg sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-1">
            <h2 className="text-sm font-semibold text-ink-900">{t("title")}</h2>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-accent hover:bg-ink-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-40 sm:min-h-8"
            >
              <CheckCheck className="size-4" aria-hidden />
              {t("markAll")}
            </button>
          </div>
          <div className="max-h-[min(24rem,60vh)] overflow-y-auto border-t border-ink-100 pt-1">
            {items === null ? (
              <p className="px-3 py-6 text-center text-sm text-ink-500">{error ? t("loadFailed") : tc("loading")}</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-500">{t("empty")}</p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} n={n} onOpen={onItemOpen} />)
            )}
          </div>
          <div className="border-t border-ink-100 pt-1">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center rounded-lg text-sm font-medium text-accent hover:bg-ink-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
