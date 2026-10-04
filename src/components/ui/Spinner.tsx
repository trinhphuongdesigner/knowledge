"use client";

import { Loader2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  const t = useT("common");
  return <Loader2 role="status" aria-label={t("loadingShort")} className={cn("size-5 animate-spin text-accent", className)} />;
}
