"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { Field } from "@/components/ui/Field";
import { fieldClass } from "@/components/ui/fieldStyles";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string };

export function PasswordInput({ label, error, className, id, ...props }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  return (
    <Field id={fieldId} label={label} error={error}>
      <div className="relative">
        <input
          {...props}
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={fieldClass(error, `min-h-11 pr-12 ${className ?? ""}`)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
    </Field>
  );
}
