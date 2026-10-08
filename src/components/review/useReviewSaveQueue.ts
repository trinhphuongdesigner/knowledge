"use client";

import { useEffect, useState } from "react";
import type { ReviewInput } from "@/lib/validators";
import { createSaveQueue, postReviews, type SaveQueue } from "./saveQueue";

/**
 * Hàng đợi lưu kết quả ôn cho một phiên (xem createSaveQueue): gửi tuần tự, keepalive khi trang
 * bị ẩn/đóng hoặc component unmount, gửi lại khi có mạng trở lại.
 * `mode` và `opts` chỉ đọc ở lần render đầu → `onStatus` nên là hàm ổn định (vd. setState).
 */
export function useReviewSaveQueue(
  mode: ReviewInput["mode"],
  opts: { delayMs?: number; onStatus?: (failed: boolean) => void } = {},
): SaveQueue {
  const [queue] = useState(() =>
    createSaveQueue({
      send: (batch, keepalive) => postReviews({ ...batch, mode }, keepalive),
      delayMs: opts.delayMs,
      maxBatch: 50,
      onStatus: opts.onStatus,
      onDrop: (batch, err) => console.warn("Dropped review results", batch, err),
    }),
  );

  useEffect(() => {
    const onHide = () => queue.flushKeepalive();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    const onOnline = () => void queue.flush();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      queue.flushKeepalive();
    };
  }, [queue]);

  return queue;
}
