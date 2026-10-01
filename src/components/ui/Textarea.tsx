import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { Field } from "./Field";
import { fieldClass } from "./fieldStyles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, rows = 3, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={fieldClass(error, `py-2.5 ${className ?? ""}`)}
        {...props}
      />
    </Field>
  );
});
