"use client";

import { useEffect, useState, useRef } from "react";
import {
  Eye,
  ListChecks,
  Clock,
  CheckCircle2,
  FileQuestion,
  BookOpen,
  Sparkles,
  HelpCircle,
  Tag,
} from "lucide-react";
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
import { StaggerContainer, StaggerItem } from "@/components/stagger";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60" },
  A2: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800/60" },
  B1: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60" },
  B2: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800/60" },
  C1: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800/60" },
  C2: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", text: "text-fuchsia-700 dark:text-fuchsia-300", border: "border-fuchsia-200 dark:border-fuchsia-800/60" },
};

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
};

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

  const activeRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [page]);

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

  const pendingCount = items.filter((i) => i.isPending).length;
  const approvedCount = items.filter((i) => !i.isPending).length;

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
    <section className="space-y-4 sm:space-y-5">
      {/* 3-Summary Bento Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={cn(CARD, "p-3.5 sm:p-4 flex items-center gap-3")}>
          <div className={cn(ICON_CHIP, "text-sky-500 bg-sky-500/10")}>
            {type === "question" ? (
              <FileQuestion className="size-4 sm:size-4.5" />
            ) : (
              <BookOpen className="size-4 sm:size-4.5" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              {t("মোট সাবমিশন", "Total Submitted")}
            </span>
            <span className="text-base sm:text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {total}
            </span>
          </div>
        </div>

        <div className={cn(CARD, "p-3.5 sm:p-4 flex items-center gap-3")}>
          <div className={cn(ICON_CHIP, "text-amber-500 bg-amber-500/10")}>
            <Clock className="size-4 sm:size-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {t("পর্যালোচনাধীন", "Pending Review")}
            </span>
            <span className="text-base sm:text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
          </div>
        </div>

        <div className={cn(CARD, "p-3.5 sm:p-4 flex items-center gap-3")}>
          <div className={cn(ICON_CHIP, "text-emerald-500 bg-emerald-500/10")}>
            <CheckCircle2 className="size-4 sm:size-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {t("অনুমোদিত ও প্রকাশিত", "Approved & Live")}
            </span>
            <span className="text-base sm:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Submissions Deck */}
      <div className={cn(CARD, "overflow-hidden")}>
        {/* Navigation Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("ধরন নির্বাচন করুন:", "Content Type:")}
            </span>
            <div className="inline-flex rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
              {(
                [
                  { key: "question", labelBn: "কুইজ প্রশ্ন", labelEn: "Questions", icon: FileQuestion },
                  { key: "word", labelBn: "শব্দভাণ্ডার", labelEn: "Words", icon: BookOpen },
                ] as {
                  key: SubmissionType;
                  labelBn: string;
                  labelEn: string;
                  icon: React.ComponentType<{ className?: string }>;
                }[]
              ).map((tab) => {
                const TabIcon = tab.icon;
                const isActive = type === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setType(tab.key);
                      setPage(1);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                  >
                    <TabIcon className="size-3.5" />
                    <span>{t(tab.labelBn, tab.labelEn)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            {total > 0
              ? t(
                  `মোট ${total}টি ${type === "question" ? "প্রশ্ন" : "শব্দ"}`,
                  `Total ${total} ${type === "question" ? "questions" : "words"}`
                )
              : null}
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className={cn(ICON_CHIP, "h-12 w-12 rounded-2xl text-zinc-400")}>
                <ListChecks className="size-6" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {type === "question"
                    ? t("কোনো প্রশ্ন পাওয়া যায়নি", "No questions submitted yet")
                    : t("কোনো শব্দ পাওয়া যায়নি", "No words submitted yet")}
                </h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
                  {t(
                    "আপনি কন্ট্রিবিউটর হিসেবে নতুন প্রশ্ন বা শব্দ জমা দিলে এখানে তা পর্যালোচনা এবং সম্পাদনা করতে পারবেন।",
                    "When you submit new questions or words as a contributor, they will appear here for tracking and editing."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <>
              <StaggerContainer className="space-y-3 sm:space-y-3.5">
                {items.map((item) => {
                  const levelCfg =
                    item.kind === "word"
                      ? LEVEL_CONFIG[item.level] ?? LEVEL_CONFIG.A1
                      : null;

                  return (
                    <StaggerItem
                      key={item.id}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.08)]",
                        "bg-white/70 dark:bg-zinc-900/60 hover:border-black/[0.12] dark:hover:border-white/[0.15]"
                      )}
                    >
                      {/* Left status accent border */}
                      <div
                        className={cn(
                          "absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b",
                          item.isPending
                            ? "from-amber-400 to-amber-500"
                            : "from-emerald-400 to-emerald-500"
                        )}
                      />

                      <div className="pl-2.5 sm:pl-3">
                        {item.kind === "question" ? (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] px-2 py-0.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                  #{item.id}
                                </span>
                                <span className="rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                                  {t(...quizTypeI18n(item.quizType))}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                                    DIFFICULTY_CHIP[item.difficultyLevel] ??
                                      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                  )}
                                >
                                  {t(...difficultyI18n(item.difficultyLevel))}
                                </span>
                                {item.isPending ? (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                    <Clock className="size-3" />
                                    {t("অপেক্ষমাণ", "Pending")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="size-3" />
                                    {t("অনুমোদিত", "Approved")}
                                  </span>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-semibold shrink-0 rounded-xl cursor-pointer"
                                onClick={() => openItem(item)}
                              >
                                <Eye className="h-3.5 w-3.5 text-zinc-500" />
                                {item.isPending
                                  ? t("দেখুন/সম্পাদনা", "View/Edit")
                                  : t("দেখুন", "View")}
                              </Button>
                            </div>

                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed mb-2">
                              {item.questionText}
                            </p>

                            {item.options && item.options.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      "px-2 py-0.5 rounded-lg text-xs border font-medium",
                                      opt === item.answer
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-semibold"
                                        : "bg-black/[0.02] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-black/[0.04] dark:border-white/[0.06]"
                                    )}
                                  >
                                    {opt} {opt === item.answer ? "✓" : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] px-2 py-0.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                  #{item.id}
                                </span>
                                {levelCfg && (
                                  <span
                                    className={cn(
                                      "rounded-lg px-2 py-0.5 text-[11px] font-semibold border",
                                      levelCfg.bg,
                                      levelCfg.text,
                                      levelCfg.border
                                    )}
                                  >
                                    {item.level}
                                  </span>
                                )}
                                <span className="rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                                  {item.category}
                                </span>
                                {item.isPending ? (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                    <Clock className="size-3" />
                                    {t("অপেক্ষমাণ", "Pending")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="size-3" />
                                    {t("অনুমোদিত", "Approved")}
                                  </span>
                                )}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-semibold shrink-0 rounded-xl cursor-pointer"
                                onClick={() => openItem(item)}
                              >
                                <Eye className="h-3.5 w-3.5 text-zinc-500" />
                                {item.isPending
                                  ? t("দেখুন/সম্পাদনা", "View/Edit")
                                  : t("দেখুন", "View")}
                              </Button>
                            </div>

                            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                {item.word}
                              </h3>
                              {item.meaningBn && item.meaningBn.length > 0 && (
                                <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                  {item.meaningBn.join("; ")}
                                </p>
                              )}
                            </div>

                            {item.definitionEn && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {item.definitionEn}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              <p className="mt-6 sm:mt-8 mb-4 text-center text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
                {t(
                  `মোট ${total}টির মধ্যে ${start}–${end} দেখানো হচ্ছে`,
                  `Showing ${start}–${end} of ${total}`
                )}
              </p>

              {totalPages > 1 && (
                <Pagination>
                  <div className="relative flex items-center justify-center max-w-full w-full gap-1 sm:gap-1.5">
                    <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={cn(page <= 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 px-1">
                      <PaginationContent className="flex items-center justify-center gap-0.5 w-max min-w-full">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (p) => (
                            <PaginationItem
                              key={p}
                              ref={p === page ? activeRef : undefined}
                              className="shrink-0"
                            >
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
                    <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        className={cn(page >= totalPages ? "pointer-events-none opacity-50" : "")}
                      />
                    </div>
                  </div>
                </Pagination>
              )}
            </>
          )}
        </div>
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