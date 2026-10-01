import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { Field } from "./Field";
import { fieldClass } from "./fieldStyles";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error}>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={fieldClass(error, `min-h-11 ${className ?? ""}`)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
