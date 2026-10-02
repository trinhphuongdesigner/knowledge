"use client";

import Link from "next/link";
import { relativeTimeVi } from "@/lib/notifications-core";
import type { NotificationDTO } from "@/lib/validators";
import { cn } from "@/lib/utils";

/** Một dòng thông báo: bấm để đánh dấu đã đọc và đi tới `href`. */
export function NotificationItem({ n, onOpen }: { n: NotificationDTO; onOpen: (n: NotificationDTO) => void }) {
  return (
    <Link
      href={n.href}
      onClick={() => onOpen(n)}
      className={cn(
        "flex min-h-11 items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-ink-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
        !n.read && "bg-brand-50/60",
      )}
    >
      <span
        aria-hidden
        className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-sm text-ink-900", n.read ? "font-medium" : "font-semibold")}>{n.title}</span>
          <time dateTime={n.createdAt} className="shrink-0 text-xs text-ink-500">
            {relativeTimeVi(n.createdAt)}
          </time>
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm text-ink-600">{n.body}</span>
        {!n.read && <span className="sr-only">Chưa đọc</span>}
      </span>
    </Link>
  );
}
