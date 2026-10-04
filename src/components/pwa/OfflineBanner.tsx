"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useT } from "@/i18n/client";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Dải thông báo nhỏ khi mất mạng; không chiếm chỗ khi online. */
export function OfflineBanner() {
  const t = useT("layout");
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-center text-sm font-medium text-amber-900"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      {t("offline")}
    </div>
  );
}
