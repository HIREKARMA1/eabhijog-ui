import { cn } from "@/lib/utils/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  className?: string;
};

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-card p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
