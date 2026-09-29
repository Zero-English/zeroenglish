"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Word, LevelPageSort } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { WordCard } from "@/components/word-card";
import { LevelFilterBar, type FilterType, type SortType } from "@/components/level-filter-bar";
import { LevelServerFilterBar } from "@/components/level-server-filter-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useLevelFilter, useLevelSort, useLevelCategory, setLevelState } from "@/lib/level-pagination-store";
import { setSelectedLevel } from "@/lib/level-store";
import { recordLastLearned } from "@/lib/last-learned-store";
import { useT } from "@/components/language-provider";

const ITEMS_PER_PAGE = 10;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function buildLevelQuery({
  q,
  sort,
  category,
}: {
  q: string;
  sort: string;
  category: string;
}): string {
  const params = new URLSearchParams();
  const query = q.trim();
  if (query) params.set("q", query);
  if (sort && sort !== "default") params.set("sort", sort);
  if (category && category !== "all") params.set("category", category);
  return params.toString();
}

function useTrackLevel(level: string, page: number) {
  useEffect(() => {
    const levelKey = level.toUpperCase();
    setSelectedLevel(levelKey as Parameters<typeof setSelectedLevel>[0]);
    recordLastLearned(levelKey, page);
  }, [level, page]);
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  const t = useT();
  return (
    <div className="text-center py-16">
      <p className="text-zinc-400 dark:text-zinc-500 text-sm">
        {filtered
          ? t("এই ফিল্টারের সাথে কোনো শব্দ মেলে না।", "No words match this filter.")
          : t("এই লেভেলে কোনো শব্দ নেই।", "There are no words in this level yet.")}
      </p>
    </div>
  );
}

interface LevelWordsClientProps {
  words: Word[];
  gradient: string;
  level: string;
  pageNum?: number;
  /**
   * Server mode: `words` is already sliced, filtered and ordered by the server,
   * and the filter controls drive the URL rather than local state.
   */
  serverMode?: boolean;
  totalCount?: number;
  totalPages?: number;
  categories?: string[];
  search?: string;
  sort?: LevelPageSort;
  category?: string;
}

export function LevelWordsClient(props: LevelWordsClientProps) {
  // Two distinct trees rather than a conditional return, so each one keeps a
  // stable hook order when the mode flips on hydration.
  return props.serverMode ? <ServerModeList {...props} /> : <BankModeList {...props} />;
}

function ServerModeList({
  words,
  gradient,
  level,
  pageNum = 1,
  totalCount,
  totalPages: serverTotalPages,
  categories: serverCategories,
  search = "",
  sort = "default",
  category = "all",
}: LevelWordsClientProps) {
  useTrackLevel(level, pageNum);
  const t = useT();

  const total = totalCount ?? words.length;
  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageNum), totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, total);
  const pageItems = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );
  const basePath = `/vocabulary/${level.toLowerCase()}`;

  const pageHref = (n: number) => {
    const qs = buildLevelQuery({ q: search, sort, category });
    const path = n <= 1 ? basePath : `${basePath}/${n}`;
    return qs ? `${path}?${qs}` : path;
  };

  const categories = serverCategories ?? Array.from(new Set(words.map((w) => w.category).filter(Boolean))).sort();
  const hasFilters = Boolean(search.trim()) || sort !== "default" || category !== "all";

  return (
    <div>
      <LevelServerFilterBar
        basePath={basePath}
        search={search}
        sort={sort}
        category={category}
        categories={categories}
      />

      {words.length === 0 ? (
        <EmptyState filtered={hasFilters} />
      ) : (
        <>
          <motion.div
            key={`server-${search}-${sort}-${category}-${currentPage}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {words.map((word) => (
              <motion.div key={`${word.id}-${word.word}`} variants={itemVariants}>
                <WordCard word={word} gradient={gradient} />
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {t(
              `মোট ${total}টির মধ্যে ${start + 1}–${end} দেখানো হচ্ছে`,
              `Showing ${start + 1}–${end} of ${total}`
            )}
          </p>

          {totalPages > 1 ? (
            <Pagination>
              <div className="flex items-center gap-0.5 max-w-full">
                <PaginationItem>
                  <PaginationPrevious
                    href={pageHref(currentPage - 1)}
                    aria-disabled={currentPage <= 1}
                    className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "")}
                  />
                </PaginationItem>

                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <PaginationContent>
                    {pageItems.map((n) => (
                      <PaginationItem key={n}>
                        <PaginationLink href={pageHref(n)} isActive={n === currentPage}>
                          {n}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </div>

                <PaginationItem>
                  <PaginationNext
                    href={pageHref(currentPage + 1)}
                    aria-disabled={currentPage >= totalPages}
                    className={cn(
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                    )}
                  />
                </PaginationItem>
              </div>
            </Pagination>
          ) : null}
        </>
      )}
    </div>
  );
}

function BankModeList({ words, gradient, level, pageNum = 1 }: LevelWordsClientProps) {
  const { isLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, loaded: bookmarkLoaded } = useBookmarkedWords();
  const loaded = learnedLoaded && bookmarkLoaded;
  const t = useT();
  const router = useRouter();

  const page = pageNum;
  const basePath = `/vocabulary/${level.toLowerCase()}`;
  const filter = useLevelFilter(level);
  const sort = useLevelSort(level);
  const category = useLevelCategory(level);

  useTrackLevel(level, page);

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
    router.push(basePath);
  };

  const handleSortChange = (s: SortType) => {
    setLevelState(level, { sort: s, page: 1 });
    router.push(basePath);
  };

  const handleCategoryChange = (c: string) => {
    setLevelState(level, { category: c, page: 1 });
    router.push(basePath);
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
        <SkeletonList />
      ) : pageWords.length === 0 ? (
        <EmptyState filtered />
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
              `মোট ${filtered.length}টির মধ্যে ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, filtered.length)} দেখানো হচ্ছে`,
              `Showing ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`
            )}
          </p>

          {totalPages > 1 && (
            <Pagination>
              <div className="flex items-center gap-0.5 max-w-full">
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage - 1 <= 1 ? basePath : `${basePath}/${currentPage - 1}`}
                    aria-disabled={currentPage <= 1}
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
                          href={pageNum <= 1 ? basePath : `${basePath}/${pageNum}`}
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
                    href={currentPage + 1 <= 1 ? basePath : `${basePath}/${currentPage + 1}`}
                    aria-disabled={currentPage >= totalPages}
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
