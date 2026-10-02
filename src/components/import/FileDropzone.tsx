"use client";

import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const ACCEPT = ".csv,.xlsx,.xls,.md,.markdown,.txt";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileDropzone({
  file,
  onFile,
  onClear,
  disabled,
}: {
  file: File | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label="Chọn hoặc kéo thả file để import"
        onClick={open}
        onKeyDown={onKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          dragging ? "border-brand-600 bg-brand-50" : "border-ink-300 bg-surface hover:border-brand-400 hover:bg-brand-50/50",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <UploadCloud className="size-9 text-accent" aria-hidden />
        <p className="text-sm font-medium text-ink-900">
          Kéo thả file vào đây hoặc <span className="text-accent underline">bấm để chọn file</span>
        </p>
        <p className="text-xs text-ink-600">Hỗ trợ .csv, .xlsx, .xls, .md, .markdown, .txt</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5">
          <FileSpreadsheet className="size-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
            <p className="text-xs text-ink-600">{formatSize(file.size)}</p>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label="Bỏ file đã chọn"
              className="flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-200 hover:text-ink-900"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
