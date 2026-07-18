import { cn } from "@/lib/utils/cn";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-4 w-4 border-2",
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

/** Simple orange (saffron) spinner used across the app. */
export function Spinner({
  className,
  size = "sm",
}: {
  className?: string;
  size?: SpinnerSize;
}) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-slate-200 border-t-saffron",
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Centered full-area loader. Drop into any page/section that is fetching data
 * so the user sees the orange spinner instead of a blank screen.
 */
export function PageLoader({
  label,
  className,
  size = "md",
}: {
  label?: string;
  className?: string;
  size?: SpinnerSize;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] w-full flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Spinner size={size} />
      {label ? <p className="text-sm font-medium text-slate-500">{label}</p> : null}
    </div>
  );
}

/** Small inline loader for sections/cards (does not force a tall min-height). */
export function SectionLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-3 py-10",
        className,
      )}
    >
      <Spinner size="sm" />
      {label ? <span className="text-sm font-medium text-slate-500">{label}</span> : null}
    </div>
  );
}
