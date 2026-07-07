"use client";

import { useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
};

export function PasswordInput({ label, error, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15",
            error && "border-danger",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition-colors hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" />
              <path d="M9.88 5.1A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7a11.6 11.6 0 0 1-2.12 3.17M6.1 6.1A11.4 11.4 0 0 0 1 12c1.73 3.89 6 7 11 7 1.01 0 1.98-.13 2.9-.37" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
