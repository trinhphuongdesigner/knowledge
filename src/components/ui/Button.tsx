import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[color,background-color,box-shadow,transform] duration-150 " +
  "active:translate-y-[2px] motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_3px_0_var(--color-brand-800)] hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-[0_5px_0_var(--color-brand-800)] active:shadow-[0_1px_0_var(--color-brand-800)]",
  secondary:
    "border border-ink-200 bg-surface text-ink-900 shadow-[0_3px_0_var(--color-ink-200)] hover:-translate-y-0.5 hover:border-ink-300 hover:bg-ink-50 hover:shadow-[0_5px_0_var(--color-ink-200)] active:shadow-[0_1px_0_var(--color-ink-200)]",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:translate-y-0",
  danger:
    "bg-danger text-white shadow-[0_3px_0_var(--color-danger-deep)] hover:-translate-y-0.5 hover:bg-danger-hover hover:shadow-[0_5px_0_var(--color-danger-deep)] active:shadow-[0_1px_0_var(--color-danger-deep)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm sm:min-h-9",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles(variant, size, className)}
      {...props}
    >
      {loading && <Spinner className="size-4 text-current" />}
      {children}
    </button>
  );
}

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}
