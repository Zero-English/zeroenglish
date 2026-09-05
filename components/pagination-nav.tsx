"use client";

import { useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COMPACT_BREAKPOINT = 640;

function useIsCompact(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT}px)`);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT}px)`).matches,
    () => false
  );
}

function getWindowedPages(
  page: number,
  total: number,
  radius: number
): (number | string)[] {
  if (total <= 1) return [1];
  if (total <= radius * 2 + 3) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | string)[] = [1];
  const start = Math.max(2, page - radius);
  const end = Math.min(total - 1, page + radius);
  if (start > 2) items.push("gap-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("gap-end");
  items.push(total);
  return items;
}

export function PaginationNav({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const isCompact = useIsCompact();
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);
  const items = getWindowedPages(safePage, safeTotal, isCompact ? 1 : 2);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        disabled={safePage === 1}
        aria-label="Previous page"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {items.map((p) =>
        typeof p === "string" ? (
          <span
            key={p}
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-sm text-gray-400 dark:text-gray-500"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={safeTotal === 1}
            aria-current={p === safePage ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors ${
              p === safePage
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
        disabled={safePage === safeTotal}
        aria-label="Next page"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}