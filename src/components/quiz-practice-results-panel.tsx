"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  ListChecks,
  CheckCircle2,
  XCircle,
  Trophy,
  GraduationCap,
  BookOpenCheck,
  BarChart3,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { useAuthStatus } from "@/lib/auth-store";
import { quizTopicMeta } from "@/lib/quiz-sections";
import {
  fetchCombinedExamResultsFromDb,
  dbResultDate,
  type DbCombinedExamResult,
} from "@/lib/quiz-results-api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const VOCAB_QUIZ_TYPES = new Set([
  "ENGLISH_TO_BANGLA",
  "BANGLA_TO_ENGLISH",
  "SYNONYMS",
  "ANTONYMS",
]);

// Grammar- and class-based practice results are stored in the CombinedExamResult table
// (word/vocab practice is written to the same table). Vocabulary quiz types are
// excluded here so only grammar & class results render in this panel.
function isGrammarOrClassResult(r: DbCombinedExamResult): boolean {
  if (r.examId != null) return false;
  if (r.mode !== "PRACTICE") return false;
  const type = r.quizType?.name ?? "";
  return !VOCAB_QUIZ_TYPES.has(type);
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-500/20",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/20",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-500/20",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 border-fuchsia-500/20",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function winColor(win: number) {
  if (win >= 90) return "text-emerald-500";
  if (win >= 70) return "text-sky-500";
  if (win >= 50) return "text-amber-500";
  return "text-rose-500";
}

function resultBadge(
  r: DbCombinedExamResult
): { icon: LucideIcon; label: string; labelBn: string; iconColor: string; bg: string } {
  const type = r.quizType?.name ?? "";
  if (type === "MIXED") {
    return {
      icon: GraduationCap,
      label: r.title || "Class Quiz",
      labelBn: r.title || "শ্রেণি কুইজ",
      iconColor: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    };
  }
  const meta = quizTopicMeta(type);
  return {
    icon: BookOpenCheck,
    label: meta.label,
    labelBn: meta.labelBn,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  };
}

function ResultBadgeIcon({ r }: { r: DbCombinedExamResult }) {
  const badge = resultBadge(r);
  const Icon = badge.icon;
  return (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]", badge.bg, badge.iconColor)}>
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}

function ResultItem({ result }: { result: DbCombinedExamResult }) {
  const t = useT();
  const badge = resultBadge(result);
  const correct = result.correctQuestions?.length ?? result.correctAnswers;
  const incorrect = result.incorrectQuestions?.length ?? 0;

  return (
    <StaggerItem className="group relative overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] p-3.5 sm:p-4 transition-all duration-150">
      <Link
        href={`/profile/quiz-results/${result.id}`}
        className="absolute inset-0 z-0"
        aria-label={t(
          `ফলাফল #${result.id} দেখুন`,
          `View result #${result.id}`
        )}
      />
      <div className="pointer-events-none relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ResultBadgeIcon r={result} />
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t(badge.labelBn, badge.label)}
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <CalendarDays className="h-3 w-3" />
              {formatDate(dbResultDate(result))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] px-2.5 py-0.5">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span
            className={cn(
              "text-xs font-bold tabular-nums",
              winColor(result.scoreInPercent)
            )}
          >
            {result.scoreInPercent}%
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.04] dark:border-white/[0.06] pt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-zinc-400" />
          <span className="tabular-nums">
            {t(
              `${result.questionCount}টি প্রশ্ন`,
              `${result.questionCount} question${result.questionCount !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="tabular-nums">{correct}</span>
        </div>
        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
          <XCircle className="h-3.5 w-3.5" />
          <span className="tabular-nums">{incorrect}</span>
        </div>
        {result.timePerQuestion > 0 && (
          <div className="flex items-center gap-1 text-zinc-400">
            <Clock3 className="h-3.5 w-3.5" />
            <span className="tabular-nums">
              {result.timePerQuestion}s / {t("প্রশ্ন", "q")}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {result.levels.map((lv) => (
            <span
              key={lv}
              className={cn(
                "rounded-md px-1.5 py-0.2 text-[10px] font-semibold border",
                LEVEL_COLORS[lv]
              )}
            >
              {lv}
            </span>
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function QuizPracticeResultsPanel() {
  const { status } = useAuthStatus();
  const [results, setResults] = useState<DbCombinedExamResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const t = useT();

  const [page, setPage] = useState(1);
  const activeRef = useRef<HTMLLIElement | null>(null);
  const paginationContainerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoaded(false);
      if (status !== "google") {
        if (cancelled) return;
        setResults([]);
        setLoaded(true);
        return;
      }
      const data = await fetchCombinedExamResultsFromDb();
      if (cancelled) return;
      setResults(data.filter(isGrammarOrClassResult));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const stats = useMemo(() => {
    const total = results.length;
    const avg =
      total > 0
        ? Math.round(
            results.reduce((acc, r) => acc + r.scoreInPercent, 0) / total
          )
        : 0;
    const best =
      total > 0 ? Math.max(...results.map((r) => r.scoreInPercent)) : 0;
    const totalQuestions = results.reduce((acc, r) => acc + r.questionCount, 0);
    return { total, totalQuestions, avg, best };
  }, [results]);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = useMemo(() => {
    return results.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [results, startIdx]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const isFirstMount = useRef(true);

  useEffect(() => {
    const behavior = isFirstMount.current ? "auto" : "smooth";
    isFirstMount.current = false;

    const centerActiveItem = (mode: ScrollBehavior = behavior) => {
      const container = paginationContainerRef.current;
      const activeEl = activeRef.current;
      if (!container || !activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      if (containerRect.width === 0 || activeRect.width === 0) return;

      const currentRelativeLeft = activeRect.left - containerRect.left;
      const targetOffsetInViewport = containerRect.width / 2 - activeRect.width / 2;
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      if (rect.top < 80) {
        listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <GraduationCap className="size-6 animate-pulse" />
      </div>
    );
  }

  const summary = [
    {
      icon: BookOpenCheck,
      label: t("নেওয়া কুইজ", "Quizzes Taken"),
      value: stats.total,
      tint: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BarChart3,
      label: t("গড় স্কোর", "Avg. Score"),
      value: `${stats.avg}%`,
      tint: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Award,
      label: t("সেরা স্কোর", "Best Score"),
      value: `${stats.best}%`,
      tint: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t(
            `${stats.total}টি কুইজ · ${stats.totalQuestions}টি প্রশ্নের উত্তর দেওয়া হয়েছে`,
            `${stats.total} practice quizzes · ${stats.totalQuestions} questions answered`
          )}
        </p>
        {totalPages > 1 && (
          <span className="text-xs text-muted-foreground">
            {t(
              `পৃষ্ঠা ${currentPage} / ${totalPages}`,
              `Page ${currentPage} of ${totalPages}`
            )}
          </span>
        )}
      </div>

      {stats.total > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <StaggerContainer className="contents">
              {summary.map((s) => {
                const Icon = s.icon;
                return (
                  <StaggerItem
                    key={s.label}
                    className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 sm:p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg, s.tint)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                        {s.label}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {s.value}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          <div ref={listRef} className="grid grid-cols-1 gap-2.5 sm:gap-3 scroll-mt-20">
            <StaggerContainer className="contents">
              {paginatedResults.map((result, idx) => (
                <ResultItem key={result.id ?? idx} result={result} />
              ))}
            </StaggerContainer>
          </div>

          {total > 0 && (
            <p className="mt-5 mb-2 text-center text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
              {t(
                `মোট ${total}টির মধ্যে ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, total)} দেখানো হচ্ছে`,
                `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, total)} of ${total}`
              )}
            </p>
          )}

          {totalPages > 1 && (
            <Pagination>
              <div className="relative flex items-center justify-center max-w-full w-full gap-1 sm:gap-1.5">
                <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "")}
                  />
                </div>
                <div
                  ref={paginationContainerRef}
                  className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 px-1"
                >
                  <PaginationContent className="flex items-center justify-center gap-0.5 w-max min-w-full">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem
                        key={p}
                        ref={p === currentPage ? activeRef : undefined}
                        className="shrink-0"
                      >
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(p);
                          }}
                          isActive={p === currentPage}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </div>
                <div className="shrink-0 z-10 bg-background/95 backdrop-blur-xs">
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : "")}
                  />
                </div>
              </div>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-12 space-y-2">
          <Trophy className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t(
              "এখনো কোনো গ্রামার বা শ্রেণি কুইজের ফলাফল নেই।",
              "No grammar or class quiz results yet."
            )}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">
            {t(
              "কুইজ পেজ থেকে একটি গ্রামার বা শ্রেণি ভিত্তিক কুইজ নিন, আপনার ফলাফল এখানে দেখা যাবে।",
              "Take a grammar or class quiz from the Quiz page and your results will appear here."
            )}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <Link
              href="/quiz/grammar"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 shadow-sm transition-colors"
            >
              {t("গ্রামার কুইজ", "Grammar Quizzes")}
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/quiz/class"
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-3.5 py-1.5 shadow-sm transition-colors"
            >
              {t("শ্রেণি কুইজ", "Class Quizzes")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}