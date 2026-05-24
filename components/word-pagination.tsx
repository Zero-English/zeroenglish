"use client";

import { useSearchParams } from "next/navigation";
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
}

export function WordPagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  // Generate page items to display
  const getPageItems = () => {
    const items: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first page
      items.push(1);

      // Add ellipsis if needed before current page range
      if (currentPage > 3) {
        items.push("ellipsis-start");
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      // Add ellipsis if needed after current page range
      if (currentPage < totalPages - 2) {
        items.push("ellipsis-end");
      }

      // Show last page
      items.push(totalPages);
    }

    return items;
  };

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
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
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? createPageUrl(currentPage - 1) : "#"}
            onClick={(e) => !hasPrevious && e.preventDefault()}
            className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageItems.map((item, index) => {
          if (typeof item === "string") {
            // Render ellipsis
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

        {/* Next Button */}
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
