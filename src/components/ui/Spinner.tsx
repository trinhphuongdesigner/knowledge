import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 role="status" aria-label="Đang tải" className={cn("size-5 animate-spin text-accent", className)} />;
}
