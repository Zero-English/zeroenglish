"use client";

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

  const getPageItems = () => {
    const items: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
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
      <div className="flex items-center gap-0.5 max-w-full">
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? createPageUrl(currentPage - 1) : "#"}
            onClick={(e) => !hasPrevious && e.preventDefault()}
            className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <PaginationContent>
            {pageItems.map((pageNum) => (
              <PaginationItem key={pageNum}>
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

        <PaginationItem>
          <PaginationNext
            href={hasNext ? createPageUrl(currentPage + 1) : "#"}
            onClick={(e) => !hasNext && e.preventDefault()}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </div>
    </Pagination>
  );
}
