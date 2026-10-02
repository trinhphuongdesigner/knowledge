"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { urlBase64ToBytes } from "@/lib/notifications-core";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = "checking" | "unsupported" | "no-key" | "no-sw" | "denied" | "off" | "on";

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** Bật/tắt thông báo đẩy cho THIẾT BỊ này (đăng ký Web Push với service worker và lưu lên server). */
export function PushDeviceControl() {
  const [state, setState] = useState<State>("checking");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const set = (s: State) => !cancelled && setState(s);
      setIosHint(isIos() && !isStandalone());
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return set("unsupported");
      if (!VAPID_PUBLIC_KEY) return set("no-key");
      if (Notification.permission === "denied") return set("denied");
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return set("no-sw");
      const sub = await reg.pushManager.getSubscription();
      set(sub && Notification.permission === "granted" ? "on" : "off");
    })().catch(() => !cancelled && setState("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setPending(true);
    setError(undefined);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(VAPID_PUBLIC_KEY!) }));
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("Trình duyệt không trả về khoá đăng ký");
      await api.pushSubscribe({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
      setState("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không bật được thông báo");
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setPending(true);
    setError(undefined);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await api.pushUnsubscribe(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
      setState("off");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tắt được thông báo");
    } finally {
      setPending(false);
    }
  }

  const status: Record<State, string> = {
    checking: "Đang kiểm tra…",
    unsupported: "Trình duyệt này không hỗ trợ thông báo đẩy.",
    "no-key": "Máy chủ chưa cấu hình thông báo đẩy.",
    "no-sw": "Chỉ khả dụng khi ứng dụng chạy bản production (cần service worker).",
    denied: "Thông báo đang bị chặn. Hãy cho phép thông báo cho trang này trong cài đặt trình duyệt rồi tải lại.",
    off: "Đang tắt trên thiết bị này.",
    on: "Đang bật trên thiết bị này.",
  };

  return (
    <div className="rounded-xl border border-ink-200 p-3 text-sm">
      <p className="font-medium text-ink-800">Thông báo trên thiết bị này</p>
      <p role="status" className="mt-0.5 text-ink-500">
        {status[state]}
      </p>
      {iosHint && (
        <p className="mt-1 text-ink-500">
          Trên iPhone/iPad: hãy thêm ứng dụng vào Màn hình chính (Chia sẻ → Thêm vào Màn hình chính) rồi mở từ biểu tượng đó để bật
          thông báo.
        </p>
      )}
      {error && <p className="mt-1 text-danger">{error}</p>}
      {(state === "off" || state === "on") && (
        <div className="mt-2">
          {state === "off" ? (
            <Button type="button" variant="secondary" size="sm" onClick={enable} loading={pending}>
              <BellRing className="size-4" aria-hidden />
              Bật thông báo
            </Button>
          ) : (
            <Button type="button" variant="secondary" size="sm" onClick={disable} loading={pending}>
              <BellOff className="size-4" aria-hidden />
              Tắt thông báo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
