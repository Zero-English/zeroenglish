"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Word } from "@/lib/data";
import { WordCard } from "@/components/word-card";
import { searchCachedWords, getCachedWords } from "@/lib/vocab-cache";
import type { BrowseWordsResponse, PaginationInfo } from "@/types/api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/language-provider";
import { Search, Sparkles, X, ArrowDown } from "lucide-react";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 350;

const LEVEL_GRADIENT: Record<string, string> = {
  A1: "from-emerald-500 to-teal-500",
  A2: "from-sky-500 to-blue-500",
  B1: "from-amber-500 to-orange-500",
  B2: "from-rose-500 to-pink-500",
  C1: "from-violet-500 to-purple-500",
  C2: "from-fuchsia-500 to-pink-500",
};

const SUGGESTION_POOL = [
  "different",
  "important",
  "improve",
  "weather",
  "travel",
  "choose",
  "knowledge",
  "journey",
  "delicious",
  "success",
  "courage",
  "endless",
  "curious",
  "talent",
  "discover",
  "fortune",
  "harvest",
  "wonder",
  "fragile",
  "breeze",
];

const PICK_COUNT = 6;

export function SearchClient() {
  const router = useRouter();
  const t = useT();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [results, setResults] = useState<Word[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [suggestions] = useState<string[]>(() => {
    const pool = [...SUGGESTION_POOL];
    const picked: string[] = [];
    const count = Math.min(PICK_COUNT, pool.length);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const updateUrl = useCallback(
    (q: string, page: number) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (page > 1) params.set("page", String(page));
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchResults = useCallback(async (q: string, page: number) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setPagination(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cached = await getCachedWords();
      if (cached.length > 0) {
        const all = await searchCachedWords(trimmed);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const sliced = all.slice(start, start + ITEMS_PER_PAGE);
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
        setResults(sliced);
        setPagination({
          total,
          page: Math.min(page, totalPages),
          limit: ITEMS_PER_PAGE,
          totalPages,
        });
        return;
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search: trimmed,
      });
      const res = await fetch(`/api/v1/words/browse?${params.toString()}`);
      const json = (await res.json()) as BrowseWordsResponse;
      if (json.success && json.data) {
        setResults(json.data);
        setPagination(json.pagination ?? null);
      } else {
        setError(json.message || "Search failed");
        setResults([]);
        setPagination(null);
      }
    } catch {
      setError("Failed to search words");
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(debouncedQuery, currentPage);
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedQuery, currentPage, fetchResults]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query !== debouncedQuery) {
        setDebouncedQuery(query);
        setCurrentPage(1);
        updateUrl(query, 1);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debouncedQuery, updateUrl]);

  const searchNow = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const trimmed = q.trim();
      setDebouncedQuery(trimmed);
      setCurrentPage(1);
      updateUrl(trimmed, 1);
      setQuery(trimmed);
    },
    [updateUrl]
  );

  const handleChange = (value: string) => {
    setQuery(value);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setDebouncedQuery("");
    setCurrentPage(1);
    updateUrl("", 1);
    inputRef.current?.focus();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    updateUrl(query, page);
  };

  const totalPages = pagination ? Math.max(1, pagination.totalPages) : 1;
  const safePage = Math.min(currentPage, totalPages);
  const start = results.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const end = start + results.length - 1;
  const total = pagination?.total ?? 0;

  const getPageItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (safePage > 3) items.push("ellipsis-start");
      const startPage = Math.max(2, safePage - 1);
      const endPage = Math.min(totalPages - 1, safePage + 1);
      for (let i = startPage; i <= endPage; i++) items.push(i);
      if (safePage < totalPages - 2) items.push("ellipsis-end");
      items.push(totalPages);
    }
    return items;
  };

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <section className="relative px-4 pt-10 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              {t("সব লেভেলের শব্দ খুঁজুন", "Find words across all levels")}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {t("অনুসন্ধান", "Search")}
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
              {t(
                "যেকোনো ইংরেজি শব্দ খুঁজুন এবং সরাসরি এর বাংলা অর্থ, উদাহরণ, সমার্থক ও বিপরীত শব্দ দেখুন।",
                "Look up any English word and jump straight to its Bangla meaning, examples, synonyms and antonyms."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fade-up-1 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <Input
              id="search-input"
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchNow(query);
              }}
              placeholder={t("যেকোনো শব্দ খুঁজুন…", "Search any word...")}
              className="h-12 w-full rounded-xl border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 pl-11 pr-11 text-base backdrop-blur-sm transition-shadow focus-visible:ring-2 focus-visible:ring-zinc-400/60"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!isSearching && (
            <div className="mt-5 flex items-center gap-2 flex-wrap animate-fade-up-2">
              <span className="text-xs font-medium text-zinc-400">{t("পরামর্শ:", "Suggestions:")}</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => searchNow(s)}
                  className="rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 backdrop-blur-sm transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {!isSearching ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm mb-5">
                  <Search className="h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  {t("অভিধান খোঁজতে টাইপ করা শুরু করুন", "Start typing to search the dictionary")}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {t("অনুসন্ধান বক্সে ফোকাস করতে", "Press")}{" "}
                  <kbd className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-1.5 py-0.5 font-sans text-[11px] text-zinc-500 dark:text-zinc-400">/</kbd>{" "}
                  {t("চাপুন", "to focus the search box")}
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <p className="text-sm font-medium text-rose-500">{error}</p>
                <button
                  onClick={() => searchNow(debouncedQuery)}
                  className="mt-3 text-sm text-zinc-400 underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300 hover:underline transition-colors"
                >
                  {t("আবার চেষ্টা করুন", "Try again")}
                </button>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  {t(`"${debouncedQuery}" এর জন্য কোনো শব্দ পাওয়া যায়নি`, `No words found for “${debouncedQuery}”`)}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {t("আলাদা বানান বা একটি সহজ শব্দ দিয়ে চেষ্টা করুন।", "Try a different spelling or a simpler word.")}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-5 flex items-center justify-between animate-fade-up">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {total === 1 ? (
                      t("১টি শব্দ পাওয়া গেছে", "1 word found")
                    ) : (
                      <>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
{total}
                        </span>{" "}
                        {t("টি শব্দ পাওয়া গেছে", "words found")}
                      </>
                    )}
                  </p>
                  {query.trim() !== debouncedQuery && (
                    <button
                      onClick={() => searchNow(query)}
                      className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {t(`"${query}" এখন খুঁজুন`, `Search for “${query}” now`)}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {results.map((word, i) => (
                    <motion.div
                      key={`${word.id}-${word.word}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(0.04 * i, 0.4), duration: 0.3, ease: "easeOut" }}
                    >
                      <WordCard
                        word={word}
                        gradient={LEVEL_GRADIENT[word.level] || "from-zinc-500 to-zinc-400"}
                      />
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <>
                    <p className="mt-8 mb-5 flex items-center justify-center gap-1.5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      <ArrowDown className="h-3.5 w-3.5" />
                      {t(
                        `মোট ${total}টির মধ্যে ${start}–${end} দেখানো হচ্ছে`,
                        `Showing ${start}–${end} of ${total}`
                      )}
                    </p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (safePage > 1) goToPage(safePage - 1);
                            }}
                            className={safePage <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {getPageItems().map((item) =>
                          typeof item === "string" ? (
                            <PaginationItem key={item}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={item}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToPage(item);
                                }}
                                isActive={item === safePage}
                              >
                                {item}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (safePage < totalPages) goToPage(safePage + 1);
                            }}
                            className={safePage >= totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}