"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Word } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { cn } from "@/lib/utils";
import { WordCard } from "@/components/word-card";
import type { BrowseWordsResponse, PaginationInfo, WordRef, WordStatsResponse } from "@/types/api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const LEVEL_CARD_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; gradient: string; label: string; solid: string }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    solid: "bg-emerald-500",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    solid: "bg-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    solid: "bg-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    solid: "bg-rose-500",
  },
};

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

const LEVEL_GRADIENT: Record<string, string> = {
  A1: "from-emerald-500 to-teal-500",
  A2: "from-sky-500 to-blue-500",
  B1: "from-amber-500 to-orange-500",
  B2: "from-rose-500 to-pink-500",
};

const FILTER_OPTIONS = ["all", ...LEVELS] as const;

export function VocabularyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLevel = searchParams.get("level") || "all";
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();

  const [stats, setStats] = useState<Record<string, number>>({});
  const [wordRefs, setWordRefs] = useState<WordRef[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [level, setLevel] = useState<string>(initialLevel);
  const [page, setPage] = useState(initialPage);

  const [words, setWords] = useState<Word[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/words/stats");
        const json = (await res.json()) as WordStatsResponse;
        if (json.success && json.data) {
          const map: Record<string, number> = {};
          json.data.levels.forEach((lv) => {
            map[lv.level] = lv.count;
          });
          setStats(map);
          setWordRefs(json.data.wordRefs);
        }
      } catch (err) {
        console.error("Failed to load vocabulary stats:", err);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const fetchPage = useCallback(async (targetLevel: string, targetPage: number) => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(ITEMS_PER_PAGE),
      });
      if (targetLevel !== "all") params.set("level", targetLevel);

      const res = await fetch(`/api/v1/words/browse?${params.toString()}`);
      const json = (await res.json()) as BrowseWordsResponse;
      if (json.success && json.data) {
        setWords(json.data);
        setPagination(json.pagination ?? null);
      } else {
        setWords([]);
        setPagination({ total: 0, page: targetPage, limit: ITEMS_PER_PAGE, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load words:", err);
      setWords([]);
      setPagination({ total: 0, page: targetPage, limit: ITEMS_PER_PAGE, totalPages: 1 });
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPage(level, page);
    }, 0);
    return () => clearTimeout(timer);
  }, [level, page, fetchPage]);

  const updateUrl = useCallback(
    (lv: string, pg: number) => {
      const params = new URLSearchParams();
      if (lv !== "all") params.set("level", lv);
      if (pg > 1) params.set("page", String(pg));
      router.replace(`/vocabulary?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleLevelChange = (lv: string) => {
    setLevel(lv);
    setPage(1);
    updateUrl(lv, 1);
  };

  const goToPage = (pg: number) => {
    setPage(pg);
    updateUrl(level, pg);
  };

  const levelStats = LEVELS.map((lv) => {
    const total = stats[lv] ?? 0;
    const learned = wordRefs.filter(
      (ref) => ref.level === lv && learnedIds.has(`${ref.id}|${ref.word}`)
    ).length;
    return { level: lv, total, learned };
  });

  const totalPages = pagination ? Math.max(1, pagination.totalPages) : 1;
  const safePage = Math.min(page, totalPages);
  const start = words.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const end = start + words.length - 1;
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

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Vocabulary
              </h1>
              <span className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Oxford 3000
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pick a level to start browsing its words.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {levelStats.map(({ level: lv, total, learned }) => {
              const c = LEVEL_CARD_CONFIG[lv];
              const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
              const ready = statsLoading || !learnedLoaded;
              return (
                <Link
                  key={lv}
                  href={`/${lv.toLowerCase()}`}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
                    c.border,
                    c.bg
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-300",
                      c.gradient
                    )}
                  />
                  <div className="relative flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          "text-3xl sm:text-4xl font-black bg-gradient-to-br bg-clip-text text-transparent",
                          c.gradient
                        )}
                      >
                        {lv}
                      </span>
                      <span className={cn("text-xs font-medium", c.text)}>{c.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {statsLoading ? "\u00A0" : `${total} words`}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {ready ? "\u00A0" : `${learned} learned`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                        {!ready ? (
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", c.solid)}
                            style={{ width: `${pct}%` }}
                          />
                        ) : (
                          <div className="h-full w-1/3 rounded-full bg-zinc-300/70 dark:bg-zinc-700 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <section className="mt-16 mb-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Browse words
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {listLoading
                    ? "Loading..."
                    : total === 0
                    ? "No words found"
                    : `Showing ${start}\u2013${end} of ${total} words`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleLevelChange(option)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                      level === option
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-200 bg-white/60 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                    )}
                  >
                    {option === "all" ? "All" : option}
                  </button>
                ))}
              </div>
            </div>

            {listLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
                  />
                ))}
              </div>
            ) : words.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-400 dark:text-zinc-500 text-sm">No words found.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {words.map((word) => (
                    <WordCard
                      key={`${word.id}-${word.word}`}
                      word={word}
                      gradient={LEVEL_GRADIENT[word.level] || "from-zinc-500 to-zinc-400"}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
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
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}