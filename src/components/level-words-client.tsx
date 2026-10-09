"use client";

import { useMemo, useEffect } from "react";
import { motion } from "motion/react";
import type { Word, LevelPageSort } from "@/lib/data";
import { WordCard } from "@/components/word-card";
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
    if (page == null) return;
    const levelKey = level.toUpperCase();
    setSelectedLevel(levelKey as Parameters<typeof setSelectedLevel>[0]);
    recordLastLearned(levelKey, page);
  }, [level, page]);
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

export interface LevelWordsClientProps {
  words: Word[];
  gradient: string;
  level: string;
  pageNum?: number;
  serverMode?: boolean;
  totalCount?: number;
  totalPages?: number;
  categories?: string[];
  search?: string;
  sort?: LevelPageSort;
  category?: string;
}

export function LevelWordsClient({
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
