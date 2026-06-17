"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

  const getPageItems = () => {
    const items: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 3) {
        items.push("ellipsis-start");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push("ellipsis-end");
      }

      items.push(totalPages);
    }

    return items;
  };

  const createPageUrl = (page: number) => {
    if (page === 1) {
      return `/${level ?? ""}`;
    }
    return `/${level ?? ""}/${page}`;
  };

  const pageItems = getPageItems();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? createPageUrl(currentPage - 1) : "#"}
            onClick={(e) => !hasPrevious && e.preventDefault()}
            className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageItems.map((item) => {
          if (typeof item === "string") {
            return (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const pageNum = item as number;
          const isActive = pageNum === currentPage;

          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href={createPageUrl(pageNum)}
                isActive={isActive}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href={hasNext ? createPageUrl(currentPage + 1) : "#"}
            onClick={(e) => !hasNext && e.preventDefault()}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
