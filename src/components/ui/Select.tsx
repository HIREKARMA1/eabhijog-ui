import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: string;
  options: Array<{ value: string; label: string }>;
};

export function Select({ label, options, className, id, value, onChange, disabled, name }: SelectProps) {
  const selectId = id ?? name;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedValue = String(value ?? "");
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? options[0],
    [options, selectedValue],
  );

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

  function handleSelect(nextValue: string) {
    setOpen(false);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    } as ChangeEvent<HTMLSelectElement>);
  }

  return (
    <div className="block space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <div ref={rootRef} className="relative">
        <button
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow,background-color,transform] duration-150 hover:border-slate-300 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-navy-700/15 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
        >
          <span className="truncate pr-3">{selectedOption?.label ?? ""}</span>
          <span className="shrink-0 text-slate-500">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
              />
            </svg>
          </span>
        </button>

        {open ? (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <ul role="listbox" className="max-h-72 overflow-y-auto py-2">
              {options.map((option) => {
                const selected = option.value === selectedValue;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelect(option.value);
                      }}
                      className={cn(
                        "flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "bg-navy-700 text-white"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
