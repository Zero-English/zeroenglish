"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Layers,
  Search,
  Filter,
  Volume2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Info,
  CalendarDays,
  FileQuestion,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useAuthStatus } from "@/lib/auth-store";
import { requestGoogleLogin } from "@/lib/login-required";
import { useSpeak } from "@/lib/use-speak";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import {
  fetchMistakeBank,
  type MistakeBankData,
  type MistakeQuestionItem,
} from "@/lib/mistake-bank-api";
import { Classic } from "@/components/classic";
import { Button } from "@/components/ui/button";
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

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

interface QuestionCardProps {
  item: MistakeQuestionItem;
}

function QuestionCard({ item }: QuestionCardProps) {
  const t = useT();
  const speak = useSpeak();
  const [showExplanation, setShowExplanation] = useState(false);

  const diffColor =
    DIFFICULTY_COLORS[item.difficultyLevel] ??
    "bg-muted text-muted-foreground border-border";

  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] p-4 sm:p-5 transition-all duration-150 hover:bg-black/[0.025] dark:hover:bg-white/[0.03] space-y-3">
      {/* Top badges & metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]">
            {item.quizType?.name ? item.quizType.name.replace(/_/g, " ") : "GRAMMAR"}
          </span>
          <span
            className={cn(
              "font-medium px-2 py-0.5 rounded-md border text-[11px]",
              diffColor
            )}
          >
            {item.difficultyLevel}
          </span>
          <span className="font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[11px] tabular-nums">
            {t(`${item.mistakeCount} বার ভুল হয়েছে`, `Missed ${item.mistakeCount}x`)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {item.isResolved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              <CheckCircle2 className="size-3" />
              <span>{t("আয়ত্ত হয়েছে", "Mastered")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
              <AlertCircle className="size-3" />
              <span>{t("অনুশীলন প্রয়োজন", "Needs Practice")}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => speak(item.questionText)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title={t("উচ্চারণ শুনুন", "Listen")}
            aria-label={t("উচ্চারণ শুনুন", "Listen to question")}
          >
            <Volume2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="text-sm sm:text-base font-semibold text-foreground leading-snug">
        {item.questionText}
      </div>

      {/* Multiple-choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {item.options.map((opt, idx) => {
          const isCorrect = opt === item.answer;
          const letter = String.fromCharCode(65 + idx);

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors",
                isCorrect
                  ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold"
                  : "bg-muted/30 border-border/60 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                  isCorrect
                    ? "bg-emerald-500 text-white dark:bg-emerald-600"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {letter}
              </span>
              <span className="min-w-0 flex-1 truncate">{opt}</span>
              {isCorrect && (
                <Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Toggle */}
      {item.explanation && (
        <div className="pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            <Info className="size-3" />
            <span>
              {showExplanation
                ? t("ব্যাখ্যা লুকান", "Hide Explanation")
                : t("সঠিক উত্তরের ব্যাখ্যা দেখুন", "Show Explanation")}
            </span>
            {showExplanation ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </button>

          {showExplanation && (
            <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-foreground/90 leading-relaxed">
              <strong className="text-primary mr-1">
                {t("ব্যাখ্যা:", "Explanation:")}
              </strong>
              {item.explanation}
            </div>
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/30">
        <span className="truncate">
          {t("সর্বশেষ পরীক্ষা:", "Last exam:")} {item.lastExamTitle}
        </span>
        <span className="shrink-0 flex items-center gap-1">
          <CalendarDays className="size-3" />
          {formatDate(item.lastMistakeAt)}
        </span>
      </div>
    </div>
  );
}

export interface ProfileMistakesDeckProps {
  vocabularyWordsSlot?: ReactNode;
  totalVocabWordsCount?: number;
}

export function ProfileMistakesDeck({
  vocabularyWordsSlot,
  totalVocabWordsCount = 0,
}: ProfileMistakesDeckProps) {
  const t = useT();
  const { status } = useAuthStatus();
  const [data, setData] = useState<MistakeBankData | null>(null);
  const [loading, setLoading] = useState(true);

  // Deck view tabs
  const [deckTab, setDeckTab] = useState<"questions" | "words">("questions");

  // Filter state for questions
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unresolved" | "mastered">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Pagination state for questions
  const [page, setPage] = useState(1);
  const activeRef = useRef<HTMLLIElement | null>(null);
  const paginationContainerRef = useRef<HTMLDivElement | null>(null);
  const questionsListRef = useRef<HTMLDivElement | null>(null);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, selectedTopic]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      if (status !== "google") {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }
      const bank = await fetchMistakeBank();
      if (!cancelled) {
        setData(bank);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const questions = data?.questions ?? [];
  const totalQuestions = data?.totalMistakeQuestions ?? 0;
  const unresolvedCount = data?.unresolvedQuestionsCount ?? 0;
  const masteredCount = data?.masteredQuestionsCount ?? 0;

  // Derive distinct quiz topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const q of questions) {
      if (q.quizType?.name) set.add(q.quizType.name);
    }
    return Array.from(set).sort();
  }, [questions]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (statusFilter === "unresolved" && q.isResolved) return false;
      if (statusFilter === "mastered" && !q.isResolved) return false;
      if (selectedTopic !== "all" && q.quizType?.name !== selectedTopic) return false;
      if (search.trim()) {
        const qry = search.toLowerCase();
        const matchText = q.questionText.toLowerCase().includes(qry);
        const matchExplanation = (q.explanation || "").toLowerCase().includes(qry);
        const matchAnswer = q.answer.toLowerCase().includes(qry);
        if (!matchText && !matchExplanation && !matchAnswer) return false;
      }
      return true;
    });
  }, [questions, statusFilter, selectedTopic, search]);

  // Pagination calculations for questions
  const totalFiltered = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredQuestions, startIdx]);

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
    if (questionsListRef.current) {
      const rect = questionsListRef.current.getBoundingClientRect();
      if (rect.top < 80) {
        questionsListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* 🚀 Hero Banner Card: Combined Mistake Bank */}
      <div className={cn(CARD, "p-4 sm:p-6")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={cn(ICON_CHIP, "text-rose-500 bg-rose-500/10")}>
              <RefreshCw className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span>{t("ভুল উত্তর পুনর্বিবেচনা ডেক", "Mistakes Review Deck")}</span>
                {totalQuestions > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 tabular-nums">
                    {totalQuestions}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t(
                  "পূর্বের পরীক্ষা ও কুইজে ভুল উত্তর দেওয়া প্রশ্নগুলো পর্যালোচনা করুন এবং পরীক্ষা দিন।",
                  "Review questions you previously answered incorrectly across past exams and quizzes."
                )}
              </p>
            </div>
          </div>

          <Link
            href="/quiz/mistakes"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Zap className="size-4" />
            <span>{t("ভুল উত্তরের পরীক্ষা শুরু করুন", "Take Mistake Exam")}</span>
            {unresolvedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-foreground/20 text-primary-foreground tabular-nums">
                {unresolvedCount}
              </span>
            )}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 3-Pack Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 pt-4 border-t border-border/60 text-center">
          <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
              {t("মোট ভুল প্রশ্ন", "Total Mistakes")}
            </span>
            <span className="text-sm sm:text-lg font-bold tabular-nums text-foreground mt-0.5 block">
              {loading ? "…" : totalQuestions}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide block">
              {t("অনুশীলন প্রয়োজন", "Needs Practice")}
            </span>
            <span className="text-sm sm:text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5 block">
              {loading ? "…" : unresolvedCount}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide block">
              {t("আয়ত্ত হয়েছে", "Mastered")}
            </span>
            <span className="text-sm sm:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {loading ? "…" : masteredCount}
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 Segmented Tab Switcher: Wrong Questions vs Vocabulary Words */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] gap-1">
          <button
            type="button"
            onClick={() => setDeckTab("questions")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              deckTab === "questions"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>{t("ভুল প্রশ্ন", "Wrong Questions")}</span>
            {totalQuestions > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground tabular-nums">
                {totalQuestions}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDeckTab("words")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              deckTab === "words"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-3.5 text-amber-500" />
            <span>{t("দুর্বল শব্দ", "Vocabulary Words")}</span>
            {totalVocabWordsCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground tabular-nums">
                {totalVocabWordsCount}
              </span>
            )}
          </button>
        </div>

        {deckTab === "questions" && totalQuestions > 0 && (
          <div className="text-xs text-muted-foreground">
            {totalFiltered > 0
              ? totalPages > 1
                ? t(
                    `পৃষ্ঠা ${currentPage} / ${totalPages} (মোট ${totalFiltered}টি)`,
                    `Page ${currentPage} of ${totalPages} (${totalFiltered} total)`
                  )
                : t(
                    `${totalFiltered}টি প্রশ্ন দেখানো হচ্ছে`,
                    `Showing ${totalFiltered} question${totalFiltered !== 1 ? "s" : ""}`
                  )
              : t("কোনো প্রশ্ন পাওয়া যায়নি", "No questions found")}
          </div>
        )}
      </div>

      {/* 📖 TAB CONTENT 1: Wrong Questions */}
      {deckTab === "questions" && (
        <div className="space-y-4">
          {status !== "google" ? (
            <div className={cn(CARD, "p-8 text-center space-y-3")}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <h4 className="text-base font-semibold text-foreground">
                {t("গুগল দিয়ে সাইন ইন করুন", "Sign in with Google")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {t(
                  "আপনার নেওয়া সব কুইজ ও পরীক্ষার ভুল উত্তরগুলো স্বয়ংক্রিয়ভাবে ক্লাউড প্রোফাইলে সংরক্ষিত হয়।",
                  "Sign in to access your personalized mistake bank synced across all completed quizzes and exams."
                )}
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => requestGoogleLogin()}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t("গুগল সাইন ইন", "Sign in with Google")}
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Classic className="size-6" />
            </div>
          ) : totalQuestions === 0 ? (
            <div className={cn(CARD, "p-8 sm:p-12 text-center space-y-3")}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
              <h4 className="text-base font-semibold text-foreground">
                {t("কোনো ভুল প্রশ্ন পাওয়া যায়নি!", "No Mistake Questions in Bank!")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {t(
                  "দারুণ! আপনার আগের পরীক্ষাগুলোতে সব প্রশ্ন সঠিক হয়েছে অথবা এখনও কোনো পরীক্ষা নেওয়া হয়নি। নতুন কুইজ নিয়ে নিজেকে চ্যালেঞ্জ করুন।",
                  "Great job! You haven't made any mistakes yet or haven't taken an exam. Challenge yourself with a quiz to build your mistake review deck."
                )}
              </p>
              <div className="pt-2">
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Sparkles className="size-3.5" />
                  <span>{t("কুইজ খেলুন", "Explore Quizzes")}</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Search & Filters Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("প্রশ্ন বা ব্যাখ্যা খুঁজুন…", "Search questions or explanations…")}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0",
                      statusFilter === "all"
                        ? "bg-foreground text-background border-foreground font-semibold"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("সকল", "All")} ({totalQuestions})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter("unresolved")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0",
                      statusFilter === "unresolved"
                        ? "bg-amber-600 text-white border-amber-600 font-semibold dark:bg-amber-500"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("অনুশীলন প্রয়োজন", "Needs Practice")} ({unresolvedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter("mastered")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0",
                      statusFilter === "mastered"
                        ? "bg-emerald-600 text-white border-emerald-600 font-semibold dark:bg-emerald-500"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("আয়ত্ত হয়েছে", "Mastered")} ({masteredCount})
                  </button>
                </div>
              </div>

              {/* Topic Filters (if multiple topics exist) */}
              {topics.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase mr-1 shrink-0">
                    {t("টপিক:", "Topic:")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTopic("all")}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer shrink-0",
                      selectedTopic === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("সব টপিক", "All Topics")}
                  </button>
                  {topics.map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => setSelectedTopic(top)}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer shrink-0",
                        selectedTopic === top
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {top.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              )}

              {/* Question Cards List */}
              {totalFiltered === 0 ? (
                <div className={cn(CARD, "p-8 text-center text-xs text-muted-foreground")}>
                  {t(
                    "নির্বাচিত ফিল্টারের সাথে কোনো প্রশ্ন মেলেনি।",
                    "No questions matched your current filter."
                  )}
                </div>
              ) : (
                <div ref={questionsListRef} className="space-y-3 scroll-mt-20">
                  {paginatedQuestions.map((q) => (
                    <QuestionCard key={q.id} item={q} />
                  ))}
                </div>
              )}

              {totalFiltered > 0 && (
                <p className="mt-6 mb-4 text-center text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
                  {t(
                    `মোট ${totalFiltered}টির মধ্যে ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, totalFiltered)} দেখানো হচ্ছে`,
                    `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, totalFiltered)} of ${totalFiltered}`
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
          )}
        </div>
      )}

      {/* 📚 TAB CONTENT 2: Weak Vocabulary Words */}
      {deckTab === "words" && (
        <div className="min-w-0 w-full">
          {vocabularyWordsSlot}
        </div>
      )}
    </div>
  );
}
