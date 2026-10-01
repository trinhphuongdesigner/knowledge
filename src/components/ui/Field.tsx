import type { ReactNode } from "react";

/** Label + control + error wrapper shared by Input, Textarea and Select. */
export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
