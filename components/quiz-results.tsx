"use client";

import Link from "next/link";
import { ArrowLeft, History, BookOpenCheck } from "lucide-react";
import { useT } from "@/components/language-provider";
import { VocabularyExamResultsPanel } from "@/components/vocabulary-exam-results-panel";
import { QuizPracticeResultsPanel } from "@/components/quiz-practice-results-panel";

export function QuizResults() {
  const t = useT();

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 active:text-zinc-600 dark:active:text-zinc-300 transition-colors group mb-6"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 group-active:-translate-x-0.5" />
            {t("কুইজে ফিরে যান", "Back to Quiz")}
          </Link>

          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold tracking-wide text-indigo-700 dark:text-indigo-300 uppercase">
                <History className="h-3.5 w-3.5" />
                {t("পূর্বের কুইজের ফলাফল", "Past Quiz Results")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {t("আপনার ফলাফল", "Your Results")}
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
              {t(
                "এখানে আপনার নেওয়া সব কুইজের ফলাফল দেখুন।",
                "Review all the practice quiz results you've taken."
              )}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-800 text-xs font-bold tracking-wide text-sky-700 dark:text-sky-300 uppercase">
                {t("শব্দ কুইজ", "Vocabulary Quizzes")}
              </span>
            </div>
            <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
              <VocabularyExamResultsPanel />
            </div>
          </div>

          <div className="animate-fade-up-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-xs font-bold tracking-wide text-amber-700 dark:text-amber-300 uppercase">
                <BookOpenCheck className="h-3.5 w-3.5" />
                {t("গ্রামার ও শ্রেণি কুইজ", "Grammar & Class Quizzes")}
              </span>
            </div>
            <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
              <QuizPracticeResultsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}