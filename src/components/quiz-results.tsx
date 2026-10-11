"use client";

import { useState } from "react";
import Link from "next/link";
import { History, BookOpenCheck, Languages, ArrowLeft, Sparkles, LayoutGrid } from "lucide-react";
import { useT } from "@/components/language-provider";
import { CombinedExamResultsPanel } from "@/components/vocabulary-exam-results-panel";
import { QuizPracticeResultsPanel } from "@/components/quiz-practice-results-panel";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

type ActiveTab = "all" | "vocab" | "grammar";

export function CombinedExamResults() {
  const t = useT();
  const [tab, setTab] = useState<ActiveTab>("all");

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(ICON_CHIP, "text-indigo-500")}>
              <History className="size-4.5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("কুইজের ফলাফল", "Quiz Results History")}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {t(
                  "আপনার নেওয়া সব অনুশীলন ও শব্দ কুইজের ফলাফল পর্যালোচনা করুন।",
                  "Review your practice quiz history, word recall and accuracy."
                )}
              </p>
            </div>
          </div>

          <Link
            href="/quiz"
            className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/60 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("সব কুইজ", "All Quizzes")}
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] gap-1">
          <button
            onClick={() => setTab("all")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              tab === "all"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {t("সব ফলাফল", "All Results")}
          </button>
          <button
            onClick={() => setTab("vocab")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              tab === "vocab"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <Languages className="h-3.5 w-3.5 text-sky-500" />
            {t("শব্দ কুইজ", "Vocabulary")}
          </button>
          <button
            onClick={() => setTab("grammar")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              tab === "grammar"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <BookOpenCheck className="h-3.5 w-3.5 text-emerald-500" />
            {t("গ্রামার ও শ্রেণি", "Grammar & Class")}
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {(tab === "all" || tab === "vocab") && (
            <div className="space-y-3">
              {tab === "all" && (
                <div className="flex items-center gap-2 px-1">
                  <div className={cn(ICON_CHIP, "h-7 w-7 text-sky-500")}>
                    <Languages className="size-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {t("শব্দভাণ্ডার কুইজের ফলাফল", "Vocabulary Quiz History")}
                  </h2>
                </div>
              )}
              <div className={cn(CARD, "p-4 sm:p-6")}>
                <CombinedExamResultsPanel />
              </div>
            </div>
          )}

          {(tab === "all" || tab === "grammar") && (
            <div className="space-y-3">
              {tab === "all" && (
                <div className="flex items-center gap-2 px-1">
                  <div className={cn(ICON_CHIP, "h-7 w-7 text-emerald-500")}>
                    <BookOpenCheck className="size-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {t("গ্রামার ও শ্রেণি কুইজের ফলাফল", "Grammar & Class Quiz History")}
                  </h2>
                </div>
              )}
              <div className={cn(CARD, "p-4 sm:p-6")}>
                <QuizPracticeResultsPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}