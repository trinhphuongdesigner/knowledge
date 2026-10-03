"use client";

import { Info, FolderCog, Library, LogOut, RotateCw, Search, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { UserAvatar } from "@/components/avatar";
import type { Gender } from "@/lib/profile";
import { ThemeToggle } from "./ThemeToggle";

/** Xoá cache trang/API riêng của người dùng trong service worker trước khi đăng xuất. */
function clearUserCache() {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_USER_CACHE" });
  } catch {
    // không có service worker
  }
}

const ITEM =
  "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600";

export function UserMenu({
  name,
  email,
  role,
  avatarUrl,
  gender,
}: {
  name: string | null;
  email: string;
  role?: "USER" | "ADMIN";
  avatarUrl?: string | null;
  gender?: Gender | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

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

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Tài khoản"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <UserAvatar src={avatarUrl} gender={gender} name={name} size={32} />
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-200 bg-surface p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink-900">{name || email}</p>
            {name && <p className="truncate text-sm text-ink-500">{email}</p>}
          </div>
          <div className="border-t border-ink-100 pt-1">
            <Link href="/review" onClick={() => setOpen(false)} className={ITEM}>
              <RotateCw className="size-4" aria-hidden />
              Ôn hôm nay
            </Link>
            <Link href="/library" onClick={() => setOpen(false)} className={ITEM}>
              <Library className="size-4" aria-hidden />
              Thư viện
            </Link>
            <Link href="/search" onClick={() => setOpen(false)} className={ITEM}>
              <Search className="size-4" aria-hidden />
              Tìm kiếm
            </Link>
            <Link href="/about" onClick={() => setOpen(false)} className={ITEM}>
              <Info className="size-4" aria-hidden />
              Giới thiệu
            </Link>
          </div>
          <div className="border-t border-ink-100 pt-1">
            {role === "ADMIN" && (
              <Link href="/admin/categories" onClick={() => setOpen(false)} className={ITEM}>
                <FolderCog className="size-4" aria-hidden />
                Quản lý danh mục
              </Link>
            )}
            <Link href="/account" onClick={() => setOpen(false)} className={ITEM}>
              <Settings className="size-4" aria-hidden />
              Quản lý tài khoản
            </Link>
            {role === "ADMIN" && (
              <Link href="/admin" onClick={() => setOpen(false)} className={ITEM}>
                <ShieldCheck className="size-4" aria-hidden />
                Quản trị
              </Link>
            )}
          </div>
          <div className="border-t border-ink-100 pt-1">
            <ThemeToggle />
          </div>
          <form action={logout} onSubmit={clearUserCache}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-red-600 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
            >
              <LogOut className="size-4" aria-hidden />
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
