import { cloneElement, useId, type ReactElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Gợi ý ngắn dạng bong bóng phía trên phần tử.
 * Chuột: hiện khi hover / focus. Cảm ứng (pointer-coarse): không hover được → tự hiện sẵn.
 * Trigger nhận aria-describedby nên trình đọc màn hình vẫn đọc gợi ý.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cn("group/tip relative inline-flex flex-col", className)}>
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 w-max max-w-[16rem] -translate-x-1/2 translate-y-1",
          "rounded-lg bg-ink-900 px-2.5 py-1.5 text-center text-xs font-medium text-balance text-ink-50 opacity-0 shadow-lg",
          "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
          "group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100",
          // Cảm ứng: nằm trong luồng (phía trên trigger) để không đè lên phần tử khác.
          "pointer-coarse:relative pointer-coarse:bottom-auto pointer-coarse:left-auto pointer-coarse:order-first pointer-coarse:mb-2.5 pointer-coarse:translate-none pointer-coarse:self-center pointer-coarse:opacity-100",
          // Mũi tên
          "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-ink-900",
        )}
      >
        {content}
      </span>
    </span>
  );
}
