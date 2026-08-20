"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { isEmptyHearingHtml, sanitizeHearingHtml } from "@/lib/hearing/richText";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  minHeightClassName?: string;
  className?: string;
<<<<<<< HEAD
  onHtmlChange?: (html: string) => void;
=======
>>>>>>> develop
};

function ToolbarButton({
  children,
  title,
  onClick,
}: {
  children: ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function HearingRichTextEditor({
  name,
  label,
  defaultValue = "<p></p>",
  hint,
  minHeightClassName = "min-h-28",
  className,
<<<<<<< HEAD
  onHtmlChange,
=======
>>>>>>> develop
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  function syncHidden() {
    const el = editorRef.current;
    const hidden = hiddenRef.current;
    if (!el || !hidden) return;
    const html = sanitizeHearingHtml(el.innerHTML);
<<<<<<< HEAD
    const next = isEmptyHearingHtml(html) ? "" : html;
    hidden.value = next;
    onHtmlChange?.(next);
=======
    hidden.value = isEmptyHearingHtml(html) ? "" : html;
>>>>>>> develop
  }

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.innerHTML = defaultValue || "<p></p>";
    syncHidden();
  }, [defaultValue]);

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHidden();
  }

  function addLink() {
    const url = window.prompt("Enter link URL (https://…)");
    if (!url) return;
    const trimmed = url.trim();
    if (
      !/^https?:\/\//i.test(trimmed) &&
      !trimmed.startsWith("/") &&
      !trimmed.startsWith("mailto:")
    ) {
      window.alert("Use an http(s), mailto, or site-relative link.");
      return;
    }
    run("createLink", trimmed);
  }

  return (
    <div className={cn("text-sm", className)}>
      <span id={labelId} className="mb-1 block font-medium">
        {label}
      </span>
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/70 px-1.5 py-1">
          <ToolbarButton title="Bold" onClick={() => run("bold")}>
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => run("italic")}>
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton title="Underline" onClick={() => run("underline")}>
            <span className="underline">U</span>
          </ToolbarButton>
          <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
          <ToolbarButton title="Bullet list" onClick={() => run("insertUnorderedList")}>
            • List
          </ToolbarButton>
          <ToolbarButton title="Numbered list" onClick={() => run("insertOrderedList")}>
            1. List
          </ToolbarButton>
          <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
          <ToolbarButton title="Insert link" onClick={addLink}>
            Link
          </ToolbarButton>
          <ToolbarButton title="Clear formatting" onClick={() => run("removeFormat")}>
            Clear
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={labelId}
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none",
            "[&_a]:text-link [&_a]:underline",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_li]:my-0.5 [&_p]:my-1",
            minHeightClassName,
          )}
          onInput={syncHidden}
          onBlur={syncHidden}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            syncHidden();
          }}
        />
      </div>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue="" />
      {hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
    </div>
  );
}
