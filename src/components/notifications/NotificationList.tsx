"use client";

import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import type { NotificationDTO } from "@/lib/validators";
import { NotificationItem } from "./NotificationItem";

/** Danh sách đầy đủ ở /notifications: trang đầu do server render, các trang sau tải theo cursor. */
export function NotificationList({
  initialItems,
  initialCursor,
  initialUnread,
}: {
  initialItems: NotificationDTO[];
  initialCursor: string | null;
  initialUnread: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function more() {
    setLoading(true);
    setError(undefined);
    try {
      const page = await api.listNotifications(cursor);
      setItems((cur) => [...cur, ...page.items]);
      setCursor(page.nextCursor);
      setUnread(page.unreadCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được thông báo");
    } finally {
      setLoading(false);
    }
  }

  function onOpen(n: NotificationDTO) {
    if (n.read) return;
    setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((c) => Math.max(0, c - 1));
    api.markNotificationRead(n.id).catch(() => {});
  }

  async function markAll() {
    setItems((cur) => cur.map((x) => ({ ...x, read: true })));
    setUnread(0);
    await api.markAllNotificationsRead().catch(() => {});
  }

  if (items.length === 0) return <p className="py-10 text-center text-sm text-ink-500">Chưa có thông báo nào</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={markAll} disabled={unread === 0}>
          <CheckCheck className="size-4" aria-hidden />
          Đánh dấu đã đọc tất cả
        </Button>
      </div>
      <div className="rounded-xl border border-ink-200 bg-surface p-2">
        {items.map((n) => (
          <NotificationItem key={n.id} n={n} onOpen={onOpen} />
        ))}
      </div>
      {error && <p className="text-center text-sm text-danger">{error}</p>}
      {cursor && (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={more} loading={loading}>
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );
}
