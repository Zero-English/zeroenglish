"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Word } from "@/lib/data";
import { WordCard } from "@/components/word-card";
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
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 350;

const LEVEL_GRADIENT: Record<string, string> = {
  A1: "from-emerald-500 to-teal-500",
  A2: "from-sky-500 to-blue-500",
  B1: "from-amber-500 to-orange-500",
  B2: "from-rose-500 to-pink-500",
};

export function SearchClient() {
  const router = useRouter();
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

  useEffect(() => {
    inputRef.current?.focus();
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
      return;
    }

    setLoading(true);
    setError(null);
    try {
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

  const handleChange = (value: string) => {
    setQuery(value);
  };

  const handleClear = () => {
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

  const isSearching = query.trim().length > 0;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent mb-2">
              Search
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Find words across the Oxford 3000 vocabulary list
            </p>
          </div>

          <div className="mb-8">
            <Field>
              <ButtonGroup className="border-none">
                <Input
                  id="search-input"
                  className="rounded-r-none focus:ring-0 focus-visible:ring-0"
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Type to search..."
                />
                <Button
                  variant="outline"
                  className="rounded-l-none h-9 border-l-0"
                  onClick={() => {
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    if (query.trim()) {
                      setDebouncedQuery(query);
                      setCurrentPage(1);
                      updateUrl(query, 1);
                    } else {
                      inputRef.current?.focus();
                    }
                  }}
                >
                  Search
                </Button>
              </ButtonGroup>
              {query.trim() && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </Field>
          </div>

          {isSearching && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {loading
                ? "Searching..."
                : error
                ? error
                : total === 0
                ? "No words found"
                : `Found ${total} word${total === 1 ? "" : "s"}`}
            </p>
          )}

          {!isSearching && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                Type to start searching
              </p>
            </div>
          )}

          {isSearching && (
            <>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">{error}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">No words found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {results.map((word) => (
                      <WordCard
                        key={`${word.id}-${word.word}`}
                        word={word}
                        gradient={LEVEL_GRADIENT[word.level] || "from-zinc-500 to-zinc-400"}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <>
                      <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                        Showing {start}&ndash;{end} of {total}
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}