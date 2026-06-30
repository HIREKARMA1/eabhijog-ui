import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const areaId = id ?? props.name;
  return (
    <label className="block space-y-1.5" htmlFor={areaId}>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <textarea
        id={areaId}
        className={cn(
          "min-h-[100px] w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15",
          className,
        )}
        {...props}
      />
    </label>
  );
}
