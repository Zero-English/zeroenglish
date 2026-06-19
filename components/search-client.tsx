"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Word } from "@/lib/data";
import { WordCard } from "@/components/word-card";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const LEVEL_GRADIENT: Record<string, string> = {
  A1: "from-emerald-500 to-teal-500",
  A2: "from-sky-500 to-blue-500",
  B1: "from-amber-500 to-orange-500",
  B2: "from-rose-500 to-pink-500",
};

function toStr(val: unknown): string {
  return typeof val === "string" ? val : "";
}

function searchWords(words: Word[], query: string): Word[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const scored: { word: Word; score: number }[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word || typeof word !== "object") continue;

    let score = 0;
    const wordLower = toStr(word.word).toLowerCase();
    const meaningLower = toStr(word.meaning_bn).toLowerCase();
    const defEnLower = toStr(word.definition_en).toLowerCase();
    const defBnLower = toStr(word.definition_bn).toLowerCase();

    if (wordLower === q) score += 100;
    else if (wordLower.startsWith(q)) score += 50;
    else if (wordLower.includes(q)) score += 20;

    if (meaningLower === q) score += 80;
    else if (meaningLower.startsWith(q)) score += 40;
    else if (meaningLower.includes(q)) score += 15;

    if (defEnLower.includes(q)) score += 5;
    if (defBnLower.includes(q)) score += 5;

    if (score > 0) scored.push({ word, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ word }) => word);
}

export function SearchClient({ words }: { words: Word[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [query, setQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const allResults = useMemo(() => searchWords(words, query), [words, query]);
  const totalPages = Math.max(1, Math.ceil(allResults.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const results = allResults.slice(start, start + ITEMS_PER_PAGE);

  const updateUrl = useCallback(
    (q: string, page: number) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (page > 1) params.set("page", String(page));
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrl(value, 1);
    }, 300);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
    updateUrl("", 1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    updateUrl(query, page);
  };

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
              {/* <FieldLabel htmlFor="search-input">Search</FieldLabel> */}
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
                    inputRef.current?.focus();
                  }}
                >
                  Search
                </Button>
              </ButtonGroup>
            </Field>
          </div>

          {isSearching && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {results.length === 0
                ? "No words found"
                : `Found ${results.length} word${results.length === 1 ? "" : "s"}`}
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

          {isSearching && results.length > 0 && (
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
                    Showing {start + 1}&ndash;{Math.min(start + ITEMS_PER_PAGE, allResults.length)} of {allResults.length}
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
        </div>
      </div>
    </div>
  );
}
