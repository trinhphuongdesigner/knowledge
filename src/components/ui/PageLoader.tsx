import { cn } from "@/lib/utils";

type PageLoaderProps = { label?: string; className?: string };

/** Book page-flip loader, centered in the content area. */
export function PageLoader({ label = "Đang tải…", className }: PageLoaderProps) {
  return (
    <div className={cn("book-loader", className)} role="status" aria-live="polite" aria-label={label}>
      <div className="book-loader-icon" aria-hidden>
        <div className="book-loader-flip">
          <span className="book-loader-flip-spine" />
          <span className="book-loader-flip-base" />
          <span className="book-loader-flip-page" />
          <span className="book-loader-flip-page" />
          <span className="book-loader-flip-page" />
        </div>
      </div>
      <p className="book-loader-label">{label}</p>
    </div>
  );
}
