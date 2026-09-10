"use client";

import { useMemo, useEffect } from "react";
import { motion } from "motion/react";
import type { Word } from "@/lib/data";
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
import { useLevelPage, useLevelFilter, useLevelSort, useLevelCategory, setLevelState } from "@/lib/level-pagination-store";
import { setSelectedLevel } from "@/lib/level-store";
import { useT, useNum } from "@/components/language-provider";

const ITEMS_PER_PAGE = 10;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

interface LevelWordsClientProps {
  words: Word[];
  gradient: string;
  level: string;
}

export function LevelWordsClient({ words, gradient, level }: LevelWordsClientProps) {
  const { isLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, loaded: bookmarkLoaded } = useBookmarkedWords();
  const loaded = learnedLoaded && bookmarkLoaded;
  const t = useT();
  const num = useNum();

  useEffect(() => {
    setSelectedLevel(level.toUpperCase() as Parameters<typeof setSelectedLevel>[0]);
  }, [level]);

  const page = useLevelPage(level);
  const filter = useLevelFilter(level);
  const sort = useLevelSort(level);
  const category = useLevelCategory(level);

  const categories = useMemo(
    () => Array.from(new Set(words.map((w) => w.category).filter(Boolean))).sort(),
    [words]
  );

  const filtered = useMemo(() => {
    let result = [...words];

    if (loaded) {
      switch (filter) {
        case "learned":
          result = result.filter((w) => isLearned(w.id));
          break;
        case "not-learned":
          result = result.filter((w) => !isLearned(w.id));
          break;
        case "bookmarked":
          result = result.filter((w) => isBookmarked(w.id));
          break;
        case "not-bookmarked":
          result = result.filter((w) => !isBookmarked(w.id));
          break;
      }
    }

    if (category !== "all") {
      result = result.filter((w) => w.category === category);
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
  }, [words, filter, sort, loaded, isLearned, isBookmarked, category]);

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

  const handleCategoryChange = (c: string) => {
    setLevelState(level, { category: c, page: 1 });
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
        category={category}
        categories={categories}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onCategoryChange={handleCategoryChange}
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
            {t("এই ফিল্টারের সাথে কোনো শব্দ মেলে না।", "No words match this filter.")}
          </p>
        </div>
      ) : (
        <>
          <motion.div
            key={`${filter}-${sort}-${currentPage}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {pageWords.map((word) => (
              <motion.div key={`${word.id}-${word.word}`} variants={itemVariants}>
                <WordCard word={word} gradient={gradient} />
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {t(
              `মোট ${num(filtered.length)}টির মধ্যে ${num(start + 1)}–${num(Math.min(start + ITEMS_PER_PAGE, filtered.length))} দেখানো হচ্ছে`,
              `Showing ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`
            )}
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
{num(pageNum)}
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
