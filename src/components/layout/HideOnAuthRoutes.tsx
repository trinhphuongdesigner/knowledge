"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const AUTH_PATHS = ["/login", "/welcome"];

/** The app Header lives in the root layout; the (auth) pages and /welcome have their own chrome. */
export function HideOnAuthRoutes({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (AUTH_PATHS.includes(pathname)) return null;
  return <>{children}</>;
}
