"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type PaginationItem = number | "ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  if (totalPages <= 1) return [1];

  const items: PaginationItem[] = [];
  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  items.push(1);
  if (left > 2) items.push("ellipsis");
  for (let page = left; page <= right; page += 1) {
    items.push(page);
  }
  if (right < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);

  return items;
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  className,
}: PaginationProps) {
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={loading}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-text-muted"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={loading || item === currentPage}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition",
              item === currentPage
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-surface",
              loading && "pointer-events-none opacity-60",
            )}
          >
            {item}
          </button>
        ),
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={loading}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
