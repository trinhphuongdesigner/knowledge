import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Field } from "./Field";
import { fieldClass } from "./fieldStyles";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={fieldClass(error, `min-h-11 ${className ?? ""}`)}
        {...props}
      />
    </Field>
  );
});
