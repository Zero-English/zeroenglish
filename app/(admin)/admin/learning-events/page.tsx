"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { LearningEvent, LearningEventListResponse } from "./types";
import { UserAvatar } from "@/components/UserAvatar";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationNav } from "@/components/pagination-nav";

const PAGE_SIZES = [10, 20, 50];

const levelVariant: Record<LearningEvent["word"]["level"], "level"> = {
  A1: "level",
  A2: "level",
  B1: "level",
  B2: "level",
  C1: "level",
  C2: "level",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminLearningEventsPage() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/v1/learning-events?page=${page}&limit=${pageSize}`
        );
        const json = (await res.json()) as LearningEventListResponse;
        if (cancelled) return;
        if (!json.success) {
          setError(json.message || "Failed to load learning events");
          return;
        }
        setError(null);
        setEvents(json.data || []);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      } catch {
        if (!cancelled) setError("Failed to load learning events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const filtered = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      e.user.name,
      e.user.user_name,
      e.user.email,
      e.word.word,
      e.word.meaningBn.join(" "),
      e.word.level,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="p-4 lg:p-8">
      <BackButton />
      <header className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `Word learning events (${total})`}
        </p>
      </header>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, word, meaning, level..."
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Word</th>
                <th className="px-4 py-2.5 font-medium">Meaning (BN)</th>
                <th className="px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 font-medium">Learned At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-9" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-rose-600 dark:text-rose-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No learning events found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5 whitespace-nowrap">
                        <UserAvatar
                          id={e.user.id}
                          name={e.user.name}
                          userName={e.user.user_name}
                          image={e.user.image}
                          size="sm"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {e.user.name || e.user.user_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                      {e.user.email.toLowerCase()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {e.word.word}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">
                      {e.word.meaningBn.length > 0 ? (
                        e.word.meaningBn.slice(0, 2).map((m, i) => (
                          <Badge key={i} variant="secondary" className="mr-1">
                            {m}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={levelVariant[e.word.level]}>
                        {e.word.level}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                      {formatDate(e.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <label htmlFor="page-size" className="shrink-0">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setLoading(true);
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {total === 0 ? 0 : `${start}-${end}`}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {total}
              </span>
            </span>
          </div>
          <PaginationNav
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setLoading(true);
              setPage(p);
            }}
          />
        </div>
      </div>
    </div>
  );
}