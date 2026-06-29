"use client";

import { useMemo } from "react";
import type { Word } from "@/lib/data";
import { getDuplicateWordIds } from "@/lib/words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { WordCard } from "@/components/word-card";
import { LevelFilterBar, type FilterType, type SortType } from "@/components/level-filter-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useLevelPage, useLevelFilter, useLevelSort, setLevelState } from "@/lib/level-pagination-store";

const ITEMS_PER_PAGE = 10;

interface LevelWordsClientProps {
  words: Word[];
  gradient: string;
  level: string;
}

export function LevelWordsClient({ words, gradient, level }: LevelWordsClientProps) {
  const { isLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, loaded: bookmarkLoaded } = useBookmarkedWords();
  const loaded = learnedLoaded && bookmarkLoaded;

  const page = useLevelPage(level);
  const filter = useLevelFilter(level);
  const sort = useLevelSort(level);

  const duplicateIds = useMemo(() => getDuplicateWordIds(words), [words]);

  const filtered = useMemo(() => {
    let result = [...words];

    if (loaded) {
      switch (filter) {
        case "learned":
          result = result.filter((w) => isLearned(w.id, w.word));
          break;
        case "not-learned":
          result = result.filter((w) => !isLearned(w.id, w.word));
          break;
        case "bookmarked":
          result = result.filter((w) => isBookmarked(w.id, w.word));
          break;
        case "not-bookmarked":
          result = result.filter((w) => !isBookmarked(w.id, w.word));
          break;
        case "duplicates":
          result = result.filter((w) => duplicateIds.has(w.id));
          break;
      }
    }

    switch (sort) {
      case "az":
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "za":
        result.sort((a, b) => b.word.localeCompare(a.word));
        break;
    }

    return result;
  }, [words, filter, sort, loaded, isLearned, isBookmarked, duplicateIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageWords = filtered.slice(start, start + ITEMS_PER_PAGE);

  const handleFilterChange = (f: FilterType) => {
    setLevelState(level, { filter: f, page: 1 });
  };

  const handleSortChange = (s: SortType) => {
    setLevelState(level, { sort: s, page: 1 });
  };

  const handlePageChange = (p: number) => {
    setLevelState(level, { page: p });
  };

  const getPageItems = () => {
    const items: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
    return items;
  };

  return (
    <div>
      <LevelFilterBar
        filter={filter}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      {!loaded ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
            />
          ))}
        </div>
      ) : pageWords.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            No words match this filter.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pageWords.map((word) => (
              <WordCard key={`${word.id}-${word.word}`} word={word} gradient={gradient} />
            ))}
          </div>

          <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
            Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </p>

          {totalPages > 1 && (
            <Pagination>
              <div className="flex items-center gap-0.5 max-w-full">
                <PaginationItem>
                    <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={cn(
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    )}
                  />
                </PaginationItem>

                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <PaginationContent>
                    {getPageItems().map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
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
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={cn(
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    )}
                  />
                </PaginationItem>
              </div>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
