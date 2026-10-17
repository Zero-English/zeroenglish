"use client";

import { useEffect, useRef } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  level?: string;
}

export function WordPagination({ currentPage, totalPages, level }: PaginationProps) {
  const activeRef = useRef<HTMLLIElement | null>(null);
  const paginationContainerRef = useRef<HTMLDivElement | null>(null);

  const isFirstMount = useRef(true);

  useEffect(() => {
    const behavior = isFirstMount.current ? "auto" : "smooth";
    isFirstMount.current = false;

    const centerActiveItem = (mode: ScrollBehavior = behavior) => {
      const container = paginationContainerRef.current;
      const activeEl = activeRef.current;
      if (!container || !activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      if (containerRect.width === 0 || activeRect.width === 0) return;

      const currentRelativeLeft = activeRect.left - containerRect.left;
      const targetOffsetInViewport = containerRect.width / 2 - activeRect.width / 2;
      const scrollDelta = currentRelativeLeft - targetOffsetInViewport;

      if (Math.abs(scrollDelta) > 1) {
        container.scrollBy({
          left: scrollDelta,
          behavior: mode,
        });
      }
    };

    const rafId = requestAnimationFrame(() => centerActiveItem());
    const handleResize = () => centerActiveItem("auto");
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentPage]);

  const getPageItems = () => {
    const items: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
    return items;
  };

  const createPageUrl = (page: number) => {
    if (page === 1) {
      return `/vocabulary/${level ?? ""}`;
    }
    return `/vocabulary/${level ?? ""}/${page}`;
  };

  const pageItems = getPageItems();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <div className="relative flex items-center justify-center max-w-full w-full gap-1 sm:gap-1.5">
        <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
          <PaginationPrevious
            href={hasPrevious ? createPageUrl(currentPage - 1) : "#"}
            onClick={(e) => !hasPrevious && e.preventDefault()}
            className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </div>

        <div
          ref={paginationContainerRef}
          className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 px-1"
        >
          <PaginationContent className="flex items-center justify-center gap-0.5 w-max min-w-full">
            {pageItems.map((pageNum) => (
              <PaginationItem
                key={pageNum}
                ref={pageNum === currentPage ? activeRef : undefined}
                className="shrink-0"
              >
                <PaginationLink
                  href={createPageUrl(pageNum)}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </div>

        <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
          <PaginationNext
            href={hasNext ? createPageUrl(currentPage + 1) : "#"}
            onClick={(e) => !hasNext && e.preventDefault()}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </div>
      </div>
    </Pagination>
  );
}
