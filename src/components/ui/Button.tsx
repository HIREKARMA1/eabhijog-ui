import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-saffron text-white hover:bg-saffron-hover border-transparent",
  secondary: "bg-navy-700 text-white hover:bg-navy-600 border-transparent",
  outline: "bg-white text-slate-700 border-border hover:bg-surface",
  ghost: "bg-transparent text-slate-700 border-transparent hover:bg-surface",
  danger: "bg-danger text-white hover:opacity-90 border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

// White spinner reads correctly on the filled (primary/secondary/danger) buttons.
const spinnerOnDark = "border-white/40 border-t-white";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const spinnerClass =
    variant === "outline" || variant === "ghost" ? undefined : spinnerOnDark;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size="xs" className={spinnerClass} /> : null}
      {children}
    </button>
  );
}
