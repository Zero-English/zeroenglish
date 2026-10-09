"use client";

import { useMemo, useEffect, useRef } from "react";
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
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
  PaginationNextButton,
  PaginationPreviousButton,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  useLevelFilter,
  useLevelSort,
  useLevelCategory,
  useLevelPage,
  useLevelPageHydrated,
  setLevelState,
  setLevelPage,
  seedLevelPageFromUrl,
} from "@/lib/level-pagination-store";
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

function useTrackLevel(level: string, page: number | null) {
  useEffect(() => {
    // In bank mode the page is held back as null until the store hydrates, so
    // the pre-hydration default of 1 never overwrites a real stored page.
    if (page == null) return;
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
   * Bank mode only: the page carried by an explicit `/vocabulary/<level>/<n>`
   * segment, or `null` on the bare level URL. It lets a deep link win over the
   * persisted page once, after which the segment is dropped from the address
   * bar. Server mode ignores it — those URLs stay real for crawlers.
   */
  urlPage?: number | null;
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

function BankModeList({ words, gradient, level, urlPage }: LevelWordsClientProps) {
  const { isLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, loaded: bookmarkLoaded } = useBookmarkedWords();
  const loaded = learnedLoaded && bookmarkLoaded;
  const t = useT();

  // Paging is client state here: the words are already in the IndexedDB bank,
  // so navigating to `/vocabulary/<level>/<n>` would throw the page away only to
  // re-render the same words. The persisted page wins on the bare level URL.
  const storedPage = useLevelPage(level);
  const pageHydrated = useLevelPageHydrated();
  const adoptedUrl = useRef(false);

  useEffect(() => {
    if (adoptedUrl.current || urlPage == null || !pageHydrated) return;
    adoptedUrl.current = true;
    // An explicit segment wins once, so a shared or bookmarked link is honoured.
    seedLevelPageFromUrl(level, urlPage);
    // Then drop the segment: the page now lives in the store, and a signed-in
    // reader navigating to `/vocabulary/a1` would just resume this same page.
    // Next 16 syncs replaceState with the router and re-syncs usePathname
    // without re-running the server, so this costs no request. `BankModeList`
    // only ever renders for a signed-in reader, so crawler URLs are untouched.
    window.history.replaceState(null, "", `/vocabulary/${level.toLowerCase()}`);
  }, [urlPage, level, pageHydrated]);

  const filter = useLevelFilter(level);
  const sort = useLevelSort(level);
  const category = useLevelCategory(level);

  // Record the page actually on screen so "Continue Learning" stays accurate.
  useTrackLevel(level, pageHydrated ? storedPage : null);

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
  const currentPage = Math.min(storedPage, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageWords = filtered.slice(start, start + ITEMS_PER_PAGE);

  const goToPage = (n: number) => {
    const target = Math.min(Math.max(1, n), totalPages);
    setLevelPage(level, target);
  };

  const handleFilterChange = (f: FilterType) => {
    setLevelState(level, { filter: f, page: 1 });
  };

  const handleSortChange = (s: SortType) => {
    setLevelState(level, { sort: s, page: 1 });
  };

  const handleCategoryChange = (c: string) => {
    setLevelState(level, { category: c, page: 1 });
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

      {!loaded || !pageHydrated ? (
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
                  <PaginationPreviousButton
                    onClick={() => goToPage(currentPage - 1)}
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
                        <PaginationButton onClick={() => goToPage(pageNum)} isActive={pageNum === currentPage}>
                          {pageNum}
                        </PaginationButton>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </div>

                <PaginationItem>
                  <PaginationNextButton
                    onClick={() => goToPage(currentPage + 1)}
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
