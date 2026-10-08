import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Khối giữ chỗ có hiệu ứng "thở"; chỉ để trang trí nên ẩn với trình đọc màn hình. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton rounded-lg", className)} {...props} />;
}

/** Vài dòng chữ giả; dòng cuối ngắn hơn cho giống đoạn văn thật. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

/**
 * Vỏ ngoài của một skeleton toàn trang/khu vực: báo "đang tải" cho trình đọc màn hình một lần,
 * còn các khối Skeleton bên trong đều aria-hidden.
 */
export function SkeletonRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
