"use client";

import { useState } from "react";
import Link from "next/link";
import { History, BookOpenCheck, Languages, ArrowLeft, LayoutGrid } from "lucide-react";
import { useT } from "@/components/language-provider";
import { CombinedExamResultsPanel } from "@/components/vocabulary-exam-results-panel";
import { QuizPracticeResultsPanel } from "@/components/quiz-practice-results-panel";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-[26px] sm:rounded-[30px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] shadow-xs";

type ActiveTab = "all" | "vocab" | "grammar";

export function CombinedExamResults() {
  const t = useT();
  const [tab, setTab] = useState<ActiveTab>("all");

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f8f8f6] text-[#242423] transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
        {/* Sunken Inset Header Bar */}
        <div className="rounded-[18px] sm:rounded-[22px] bg-[#f1f1ef] dark:bg-[#252528] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-[14px] bg-white text-[#242423] shadow-2xs dark:bg-white/10 dark:text-[#f3f3f2] flex items-center justify-center shrink-0">
              <History className="size-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("কুইজের ফলাফল", "Quiz Results History")}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t(
                  "আপনার নেওয়া সব অনুশীলন ও শব্দ কুইজের ফলাফল পর্যালোচনা করুন।",
                  "Review your practice quiz history, word recall and accuracy."
                )}
              </p>
            </div>
          </div>

          <Link
            href="/quiz"
            className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("সব কুইজ", "All Quizzes")}
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 rounded-full bg-[#f1f1ef] dark:bg-[#252528] border border-black/[0.04] dark:border-white/[0.06] gap-1">
          <button
            onClick={() => setTab("all")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              tab === "all"
                ? "bg-[#242423] text-white shadow-2xs dark:bg-white dark:text-[#242423]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {t("সব ফলাফল", "All Results")}
          </button>
          <button
            onClick={() => setTab("vocab")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              tab === "vocab"
                ? "bg-[#242423] text-white shadow-2xs dark:bg-white dark:text-[#242423]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Languages className="h-3.5 w-3.5" />
            {t("শব্দ কুইজ", "Vocabulary")}
          </button>
          <button
            onClick={() => setTab("grammar")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              tab === "grammar"
                ? "bg-[#242423] text-white shadow-2xs dark:bg-white dark:text-[#242423]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <BookOpenCheck className="h-3.5 w-3.5" />
            {t("গ্রামার ও শ্রেণি", "Grammar & Class")}
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {(tab === "all" || tab === "vocab") && (
            <div className="space-y-3">
              {tab === "all" && (
                <div className="flex items-center gap-2 px-1">
                  <div className="size-7 rounded-[8px] bg-white text-[#242423] shadow-2xs dark:bg-white/10 dark:text-[#f3f3f2] flex items-center justify-center">
                    <Languages className="size-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {t("শব্দভাণ্ডার কুইজের ফলাফল", "Vocabulary Quiz History")}
                  </h2>
                </div>
              )}
              <div className={cn(CARD, "p-5 sm:p-7")}>
                <CombinedExamResultsPanel />
              </div>
            </div>
          )}

          {(tab === "all" || tab === "grammar") && (
            <div className="space-y-3">
              {tab === "all" && (
                <div className="flex items-center gap-2 px-1">
                  <div className="size-7 rounded-[8px] bg-white text-[#242423] shadow-2xs dark:bg-white/10 dark:text-[#f3f3f2] flex items-center justify-center">
                    <BookOpenCheck className="size-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {t("গ্রামার ও শ্রেণি কুইজের ফলাফল", "Grammar & Class Quiz History")}
                  </h2>
                </div>
              )}
              <div className={cn(CARD, "p-5 sm:p-7")}>
                <QuizPracticeResultsPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
