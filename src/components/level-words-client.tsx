"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import Link from "next/link";
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
import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import {
  SearchX,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import {
  useGuidedTour,
  GuidedTour,
  TourReplayButton,
  LEVEL_WORDS_TOUR,
} from "@/components/guided-tour";

const ITEMS_PER_PAGE = 10;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

function buildLevelQuery({
  q,
  sort,
  category,
  wordType,
  status,
}: {
  q: string;
  sort: string;
  category: string;
  wordType?: string;
  status?: string;
}): string {
  const params = new URLSearchParams();
  const query = q.trim();
  if (query) params.set("q", query);
  if (sort && sort !== "default") params.set("sort", sort);
  if (category && category !== "all") params.set("category", category);
  if (wordType && wordType !== "all") params.set("type", wordType);
  if (status && status !== "all") params.set("status", status);
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

function EmptyState({
  filtered,
  basePath,
  status,
}: {
  filtered: boolean;
  basePath: string;
  status?: string;
}) {
  const t = useT();

  let title = t("কোনো শব্দ মেলেনি", "No words found");
  let desc = t(
    "আপনার সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।",
    "Try adjusting your search query or reset active filters.",
  );
  let Icon = SearchX;

  if (status === "unlearned") {
    Icon = CheckCircle2;
    title = t(
      "অভিনন্দন! এই লেভেলের সব শব্দ আয়ত্ত হয়েছে",
      "All words in this level mastered!",
    );
    desc = t(
      "এই লেভেলের সব শব্দ আপনি শিখে ফেলেছেন। অন্য লেভেলে যান অথবা সব ফিল্টার মুছুন।",
      "You have mastered every word in this level. Continue to the next level or clear active filters.",
    );
  } else if (status === "learned") {
    Icon = Sparkles;
    title = t(
      "এই লেভেলে এখনও কোনো শব্দ আয়ত্ত করেননি",
      "No words mastered in this level yet",
    );
    desc = t(
      "যেকোনো শব্দ কার্ডে 'Learned' বাটনে ক্লিক করে আয়ত্ত হিসেবে চিহ্নিত করুন।",
      "Tap the 'Learned' button on any word card to mark it as mastered.",
    );
  } else if (status === "bookmarked") {
    Icon = Bookmark;
    title = t(
      "এই লেভেলে কোনো সংরক্ষিত শব্দ নেই",
      "No saved words in this level",
    );
    desc = t(
      "ভবিষ্যতে অনুশীলনের জন্য শব্দ কার্ডের বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করতে পারেন।",
      "Bookmark words by tapping the Save icon on any card.",
    );
  } else if (!filtered) {
    title = t("এই লেভেলে কোনো শব্দ নেই", "No words in this level yet");
    desc = t(
      "শীঘ্রই এই লেভেলে নতুন শব্দ যুক্ত করা হবে।",
      "New words will be added to this level soon.",
    );
  }

  return (
    <div className="my-10 rounded-[28px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:p-12">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[20px] bg-[#f1f1ef] text-[#242423] dark:bg-[#252528] dark:text-[#f3f3f2]">
        <Icon className="size-7" />
      </div>
      <h3 className="text-base font-bold text-[#242423] dark:text-[#f3f3f2] sm:text-lg">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-xs text-[#242423]/60 dark:text-zinc-400 sm:text-sm">
        {desc}
      </p>
      {filtered && (
        <div className="mt-5">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#242423] px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("সব ফিল্টার মুছুন", "Clear All Filters")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export interface LevelWordsClientProps {
  words: Word[];
  gradient?: string;
  level: string;
  pageNum?: number;
  serverMode?: boolean;
  totalCount?: number;
  totalPages?: number;
  categories?: string[];
  search?: string;
  sort?: LevelPageSort;
  category?: string;
  wordType?: string;
  status?: string;
  levelWordIds?: number[];
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
  wordType = "all",
  status = "all",
  levelWordIds,
}: LevelWordsClientProps) {
  useTrackLevel(level, pageNum);
  const t = useT();
  const { isLearned, learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const {
    isBookmarked,
    bookmarkedIds,
    loaded: bookmarkLoaded,
  } = useBookmarkedWords();
  const storesLoaded = learnedLoaded && bookmarkLoaded;

  const {
    isOpen: isTourOpen,
    currentStepIndex: tourStepIndex,
    nextStep: tourNext,
    prevStep: tourPrev,
    closeTour,
    startTour,
  } = useGuidedTour(LEVEL_WORDS_TOUR);

  // Local cache of word objects, initialized with server-provided words
  const [wordsCache, setWordsCache] = useState<Map<number, Word>>(() => {
    const map = new Map<number, Word>();
    for (const w of words) map.set(w.id, w);
    return map;
  });

  useEffect(() => {
    setWordsCache((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const w of words) {
        if (!next.has(w.id)) {
          next.set(w.id, w);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [words]);

  const isStatusFilterActive = status !== "all";
  const hasOtherFilters =
    Boolean(search.trim()) ||
    category !== "all" ||
    wordType !== "all" ||
    sort !== "default";

  // When filtering by study status without server-side search/category filters,
  // we filter against the entire level's word ID sequence.
  const matchingIds = useMemo(() => {
    if (
      !isStatusFilterActive ||
      hasOtherFilters ||
      !levelWordIds ||
      levelWordIds.length === 0
    ) {
      return null;
    }
    if (!storesLoaded) return null;
    if (status === "unlearned") {
      return levelWordIds.filter((id) => !learnedIds.has(String(id)));
    }
    if (status === "learned") {
      return levelWordIds.filter((id) => learnedIds.has(String(id)));
    }
    if (status === "bookmarked") {
      return levelWordIds.filter((id) => bookmarkedIds.has(String(id)));
    }
    return levelWordIds;
  }, [
    isStatusFilterActive,
    hasOtherFilters,
    levelWordIds,
    storesLoaded,
    status,
    learnedIds,
    bookmarkedIds,
  ]);

  const total =
    matchingIds !== null ? matchingIds.length : (totalCount ?? words.length);

  const totalPages =
    matchingIds !== null
      ? Math.max(1, Math.ceil(matchingIds.length / ITEMS_PER_PAGE))
      : (serverTotalPages ?? Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));

  const currentPage = Math.min(Math.max(1, pageNum), totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, total);

  const pageItems = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );
  const basePath = `/vocabulary/${level.toLowerCase()}`;

  const activeItemRef = useRef<HTMLLIElement | null>(null);
  const paginationContainerRef = useRef<HTMLDivElement | null>(null);
  const isFirstPaginationMount = useRef(true);

  useEffect(() => {
    const behavior: ScrollBehavior = isFirstPaginationMount.current
      ? "auto"
      : "smooth";
    isFirstPaginationMount.current = false;

    const centerActiveItem = (mode: ScrollBehavior = behavior) => {
      const container = paginationContainerRef.current;
      const activeEl = activeItemRef.current;
      if (!container || !activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      if (containerRect.width === 0 || activeRect.width === 0) return;

      const currentRelativeLeft = activeRect.left - containerRect.left;
      const targetOffsetInViewport =
        containerRect.width / 2 - activeRect.width / 2;
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

  const pageHref = (n: number) => {
    const qs = buildLevelQuery({ q: search, sort, category, wordType, status });
    const path = n <= 1 ? basePath : `${basePath}/${n}`;
    return qs ? `${path}?${qs}` : path;
  };

  const currentPageIds = useMemo(() => {
    if (matchingIds === null) return null;
    return matchingIds.slice(start, end);
  }, [matchingIds, start, end]);

  const missingIds = useMemo(() => {
    if (!currentPageIds) return [];
    return currentPageIds.filter((id) => !wordsCache.has(id));
  }, [currentPageIds, wordsCache]);

  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (missingIds.length === 0) return;
    let active = true;
    setFetching(true);

    fetch(`/api/v1/words/by-ids?ids=${missingIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.data) return;
        setWordsCache((prev) => {
          const next = new Map(prev);
          for (const w of data.data) next.set(w.id, w);
          return next;
        });
      })
      .catch((err) => {
        console.error("Failed to fetch words by ids:", err);
      })
      .finally(() => {
        if (active) setFetching(false);
      });

    return () => {
      active = false;
    };
  }, [missingIds]);

  const displayedWords = useMemo(() => {
    if (matchingIds !== null) {
      if (!currentPageIds || currentPageIds.length === 0) return [];
      return currentPageIds
        .map((id) => wordsCache.get(id))
        .filter((w): w is Word => Boolean(w));
    }

    if (
      !storesLoaded &&
      (status === "learned" ||
        status === "unlearned" ||
        status === "bookmarked")
    ) {
      return words;
    }
    if (status === "learned") return words.filter((w) => isLearned(w.id));
    if (status === "unlearned") return words.filter((w) => !isLearned(w.id));
    if (status === "bookmarked") return words.filter((w) => isBookmarked(w.id));
    return words;
  }, [
    matchingIds,
    currentPageIds,
    wordsCache,
    storesLoaded,
    status,
    words,
    isLearned,
    isBookmarked,
  ]);

  const isLoadingWords =
    (isStatusFilterActive && !hasOtherFilters && !storesLoaded) ||
    (matchingIds !== null && fetching && displayedWords.length === 0);

  const categories =
    serverCategories ??
    Array.from(new Set(words.map((w) => w.category).filter(Boolean))).sort();
  const hasFilters =
    Boolean(search.trim()) ||
    sort !== "default" ||
    category !== "all" ||
    wordType !== "all" ||
    status !== "all";

  return (
    <div>
      <div data-tour="filter-bar">
        <LevelServerFilterBar
          basePath={basePath}
          search={search}
          sort={sort}
          category={category}
          categories={categories}
          wordType={wordType}
          status={status}
        />
      </div>

      {isLoadingWords ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#f1f1ef] dark:bg-[#252528]" />
                <div className="h-6 w-32 rounded-full bg-[#f1f1ef] dark:bg-[#252528]" />
                <div className="h-5 w-16 rounded-full bg-[#f1f1ef] dark:bg-[#252528]" />
              </div>
              <div className="mt-4 h-16 rounded-[18px] bg-[#f1f1ef] dark:bg-[#252528]" />
              <div className="mt-3 h-4 w-3/4 rounded-full bg-[#f1f1ef] dark:bg-[#252528]" />
            </div>
          ))}
        </div>
      ) : displayedWords.length === 0 ? (
        <EmptyState filtered={hasFilters} basePath={basePath} status={status} />
      ) : (
        <>
          <motion.div
            key={`server-${search}-${sort}-${category}-${wordType}-${status}-${currentPage}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {displayedWords.map((word, index) => (
              <motion.div
                key={`${word.id}-${word.word}`}
                variants={itemVariants}
              >
                <WordCard
                  word={word}
                  gradient={gradient}
                  isFirst={index === 0}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Showing counter badge & Guide Replay */}
          <div className="mt-8 mb-5 flex items-center justify-center gap-2">
            <span className="rounded-full bg-[#242423]/[0.05] px-4 py-1.5 text-xs font-semibold text-[#242423]/70 dark:bg-white/[0.06] dark:text-zinc-300">
              {t(
                `মোট ${total}টির মধ্যে ${start + 1}–${Math.min(end, total)} দেখানো হচ্ছে`,
                `Showing ${start + 1}–${Math.min(end, total)} of ${total}`,
              )}
            </span>
            <TourReplayButton onReplay={startTour} />
          </div>

          {totalPages > 1 && (
            <div
              data-tour="pagination"
              className="w-full rounded-[22px] sm:rounded-full border border-black/[0.06] bg-white p-1.5 sm:p-2 shadow-[0_2px_12px_rgba(0,0,0,0.03),0_12px_28px_-12px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-[#1c1c1e]"
            >
              <Pagination className="mx-0 w-full max-w-none">
                <div className="flex w-full items-center justify-between gap-1.5 sm:gap-2">
                  <PaginationPrevious
                    href={pageHref(currentPage - 1)}
                    text={t("আগে", "Prev")}
                    aria-disabled={currentPage <= 1}
                    className={cn(
                      "size-9 shrink-0 rounded-full p-0! text-xs font-semibold transition-all active:scale-95 sm:h-9 sm:w-auto sm:px-3.5!",
                      currentPage <= 1
                        ? "pointer-events-none opacity-35"
                        : "bg-[#f1f1ef] text-[#242423] hover:bg-[#e7e7e4] dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]",
                    )}
                  />

                  {/* Horizontally scrollable container showing ALL page buttons without clipping across full width */}
                  <div
                    ref={paginationContainerRef}
                    tabIndex={0}
                    aria-label={t("পৃষ্ঠা নির্বাচন", "Page selector")}
                    className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-0.5 px-1 focus:outline-hidden"
                  >
                    <PaginationContent
                      className={cn(
                        "flex w-max items-center gap-1 px-1",
                        totalPages <= 8 && "mx-auto",
                      )}
                    >
                      {pageItems.map((n) => (
                        <PaginationItem
                          key={n}
                          ref={n === currentPage ? activeItemRef : undefined}
                          className="shrink-0"
                        >
                          <PaginationLink
                            href={pageHref(n)}
                            isActive={n === currentPage}
                            className={cn(
                              "size-8 sm:size-8.5 rounded-full text-xs font-semibold tabular-nums transition-all active:scale-95",
                              n === currentPage
                                ? "border-0 bg-[#242423] text-white shadow-xs hover:bg-[#242423] hover:text-white dark:bg-white dark:text-[#242423] dark:hover:bg-white"
                                : "text-[#242423]/70 hover:bg-[#f1f1ef] hover:text-[#242423] dark:text-zinc-300 dark:hover:bg-[#252528] dark:hover:text-white",
                            )}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </PaginationContent>
                  </div>

                  <PaginationNext
                    href={pageHref(currentPage + 1)}
                    text={t("পরে", "Next")}
                    aria-disabled={currentPage >= totalPages}
                    className={cn(
                      "size-9 shrink-0 rounded-full p-0! text-xs font-semibold transition-all active:scale-95 sm:h-9 sm:w-auto sm:px-3.5!",
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-35"
                        : "bg-[#f1f1ef] text-[#242423] hover:bg-[#e7e7e4] dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]",
                    )}
                  />
                </div>
              </Pagination>
            </div>
          )}
        </>
      )}

      <GuidedTour
        config={LEVEL_WORDS_TOUR}
        isOpen={isTourOpen}
        currentStepIndex={tourStepIndex}
        onNext={tourNext}
        onPrev={tourPrev}
        onClose={closeTour}
      />
    </div>
  );
}
