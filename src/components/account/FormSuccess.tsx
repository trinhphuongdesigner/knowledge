import { CircleCheck } from "lucide-react";

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-700"
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
