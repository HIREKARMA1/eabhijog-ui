"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

export type HearingSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function HearingFieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1.5 block min-w-0 wrap-break-word text-sm text-slate-800">
      <span className="font-semibold">{label}</span>
      {hint ? <span className="font-normal text-slate-500"> ({hint})</span> : null}
    </span>
  );
}

type Props = {
  label: string;
  name: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  options: HearingSelectOption[];
  onChange?: (value: string) => void;
};

export function HearingSelectField({
  label,
  name,
  required,
  value,
  defaultValue = "",
  placeholder,
  hint,
  searchable = false,
  searchPlaceholder,
  options,
  onChange,
}: Props) {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t("hearing", "register.selectOption");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("hearing", "register.searchEllipsis");
  const listId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internal, setInternal] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : internal;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === selectedValue) ?? null,
    [options, selectedValue],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query),
    );
  }, [options, searchQuery, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }
    if (searchable) {
      searchInputRef.current?.focus();
    }
  }, [open, searchable]);

  function pick(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
    setSearchQuery("");
  }

  return (
    <div className="block min-w-0 w-full">
      <HearingFieldLabel label={label} hint={hint} />

      <div ref={rootRef} className="relative min-w-0 w-full">
        <select
          name={name}
          required={required}
          value={selectedValue}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        >
        {required ? (
          <option value="" disabled>
            {resolvedPlaceholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
        </select>

        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "hearing-form-select flex w-full min-w-0 items-center justify-between gap-3 text-left",
            open && "border-saffron ring-[3px] ring-saffron/12",
            !selectedOption && "text-slate-500",
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? resolvedPlaceholder}</span>
          <Chevron open={open} />
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            className="hearing-form-dropdown absolute left-0 right-0 z-50 mt-1.5 max-w-full overflow-x-hidden"
          >
            {searchable ? (
              <div className="border-b border-border p-2">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder={resolvedSearchPlaceholder}
                  className="hearing-form-input"
                  aria-label={t("hearing", "register.searchAria", { label })}
                />
              </div>
            ) : null}
            <ul className="max-h-64 overflow-y-auto py-1.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  if (opt.disabled && !opt.value) return null;
                  const selected = opt.value === selectedValue;
                  return (
                    <li key={opt.value || opt.label}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={opt.disabled}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => !opt.disabled && pick(opt.value)}
                        className={cn(
                          "hearing-form-dropdown-option flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-left text-sm",
                          selected && "is-selected",
                          opt.disabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-saffron bg-saffron text-white"
                              : "border-slate-300 bg-white",
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6l2.5 2.5 4.5-5"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-4 text-center text-sm text-slate-500">
                  {t("hearing", "register.noOptionMatch")}
                </li>
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0 text-navy-700 transition-transform duration-150", open && "rotate-180")}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
