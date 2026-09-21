"use client";

import { useEffect, useState } from "react";
import { Eye, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/components/language-provider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { quizTypeI18n, difficultyI18n, levelI18n } from "./types";
import { SubmissionDialog } from "./submission-dialog";
import { Button } from "@/components/ui/button";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const CHIP_PENDING =
  "rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

const CHIP_APPROVED =
  "rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const DIVIDER = "border-b border-black/[0.06] dark:border-white/[0.08]";

const ITEMS_PER_PAGE = 10;

export type MyItem =
  | {
      kind: "question";
      id: number;
      quizType: string;
      questionText: string;
      difficultyLevel: string;
      isPending: boolean;
      options: string[];
      answer: string;
      explanation: string;
      class: string[];
    }
  | {
      kind: "word";
      id: number;
      word: string;
      meaningBn: string[];
      level: string;
      category: string;
      isPending: boolean;
      synonyms: string[];
      antonyms: string[];
      definitionEn: string;
      definitionBn: string;
      examplesEn: string[];
      examplesBn: string[];
      wordType: string[];
    };

type SubmissionData = {
  items: MyItem[];
  total: number;
  totalPages: number;
  page: number;
};

type SubmissionType = "question" | "word";

export function MySubmissions() {
  const [type, setType] = useState<SubmissionType>("question");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SubmissionData | null>(null);
  const [selected, setSelected] = useState<MyItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    const endpoint =
      type === "question" ? "/api/v1/quiz/mine" : "/api/v1/words/mine";

    fetch(`${endpoint}?page=${page}&limit=${ITEMS_PER_PAGE}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          const items: MyItem[] =
            type === "question"
              ? (json.data as Array<{
                  id: number;
                  quizType: string;
                  questionText: string;
                  difficultyLevel: string;
                  isPending: boolean;
                  options: string[];
                  answer: string;
                  explanation: string;
                  class: string[];
                }>).map((q) => ({ kind: "question", ...q }))
              : (json.data as Array<{
                  id: number;
                  word: string;
                  meaningBn: string[];
                  level: string;
                  category: string;
                  isPending: boolean;
                  synonyms: string[];
                  antonyms: string[];
                  definitionEn: string;
                  definitionBn: string;
                  examplesEn: string[];
                  examplesBn: string[];
                  wordType: string[];
                }>).map((w) => ({ kind: "word", ...w }));
          setData({
            items,
            total: json.pagination?.total ?? json.data.length,
            totalPages: json.pagination?.totalPages ?? 1,
            page,
          });
        } else {
          setData({ items: [], total: 0, totalPages: 1, page });
        }
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], total: 0, totalPages: 1, page });
      });

    return () => {
      cancelled = true;
    };
  }, [type, page]);

  const loading = data === null || data.page !== page;
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const start = items.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const end =
    items.length > 0
      ? Math.min((page - 1) * ITEMS_PER_PAGE + items.length, total)
      : 0;

  const pendingLabel = t("অপেক্ষমাণ", "Pending");
  const approvedLabel = t("অনুমোদিত", "Approved");

  function openItem(item: MyItem) {
    setSelected(item);
    setDialogOpen(true);
  }

  function handleSaved(updated: MyItem) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.id === updated.id ? { ...updated, isPending: true } : it
            ),
          }
        : prev
    );
  }

  function handleDeleted(id: number) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((it) => it.id !== id),
            total: Math.max(0, prev.total - 1),
          }
        : prev
    );
  }

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6 sm:py-5",
          DIVIDER
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(ICON_CHIP, "text-violet-500 bg-violet-500/10")}>
            <ListChecks className="size-4.5" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t("আমার সাবমিশন", "My submissions")}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {t("আপনি যা কিছু অবদান রেখেছেন", "Everything you've contributed")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data !== null ? (
            <span
              className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
            >
              {t(`${total}টি মোট`, `${total} total`)}
            </span>
          ) : null}
          <div className="grid grid-cols-2 gap-1 rounded-[10px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
            {(
              [
                { key: "question", labelBn: "প্রশ্ন", labelEn: "Questions" },
                { key: "word", labelBn: "শব্দ", labelEn: "Words" },
              ] as {
                key: SubmissionType;
                labelBn: string;
                labelEn: string;
              }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setType(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  type === tab.key
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {t(tab.labelBn, tab.labelEn)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className={cn(ICON_CHIP, "h-12 w-12 rounded-[14px] text-zinc-400")}>
              <ListChecks className="size-5" />
            </span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {type === "question"
                ? t(
                    "আপনি এখনো কোনো প্রশ্ন জমা দেননি।",
                    "You haven't submitted any questions yet."
                  )
                : t(
                    "আপনি এখনো কোনো শব্দ জমা দেননি।",
                    "You haven't submitted any words yet."
                  )}
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {items.map((item) => (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  {item.kind === "question" ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                            #{item.id}
                          </span>
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                            {t(...quizTypeI18n(item.quizType))}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              DIFFICULTY_CHIP[item.difficultyLevel] ??
                                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            )}
                          >
                            {t(...difficultyI18n(item.difficultyLevel))}
                          </span>
                          {item.isPending ? (
                            <span className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}>
                              {pendingLabel}
                            </span>
                          ) : (
                            <span className={cn(CHIP_APPROVED, "px-2 py-0.5 text-[11px] font-semibold")}>
                              {approvedLabel}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => openItem(item)}
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          {item.isPending
                            ? t("দেখুন/সম্পাদনা", "View/Edit")
                            : t("দেখুন", "View")}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {item.questionText}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                            #{item.id}
                          </span>
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                            {t(...levelI18n(item.level))}
                          </span>
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                            {item.category}
                          </span>
                          {item.isPending ? (
                            <span className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}>
                              {pendingLabel}
                            </span>
                          ) : (
                            <span className={cn(CHIP_APPROVED, "px-2 py-0.5 text-[11px] font-semibold")}>
                              {approvedLabel}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => openItem(item)}
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          {item.isPending
                            ? t("দেখুন/সম্পাদনা", "View/Edit")
                            : t("দেখুন", "View")}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {item.word}
                      </p>
                      {item.meaningBn.length > 0 ? (
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                          {item.meaningBn.join(", ")}
                        </p>
                      ) : null}
                    </>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-6 mb-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
              {t(
                `${start}–${end} / মোট ${total}`,
                `Showing ${start}–${end} of ${total}`
              )}
            </p>

            {totalPages > 1 ? (
              <Pagination>
                <div className="flex items-center gap-0.5 max-w-full">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={cn(page <= 1 ? "pointer-events-none opacity-50" : "")}
                    />
                  </PaginationItem>
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <PaginationContent>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={p === page}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                    </PaginationContent>
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={cn(page >= totalPages ? "pointer-events-none opacity-50" : "")}
                    />
                  </PaginationItem>
                </div>
              </Pagination>
            ) : null}
          </>
        )}
      </div>
      <SubmissionDialog
        item={selected}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelected(null);
        }}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </section>
  );
}