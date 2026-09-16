"use client";

import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CircleAlert,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { quizClassMeta, type QuizClassOption } from "@/lib/quiz-sections";
import { useQuizMeta } from "@/lib/quiz-meta";
import { ClassCard } from "@/components/quiz-catalog";
import { QuizClassPracticeSession } from "@/components/quiz-class-practice";

function resolveSelectedClass(
  classes: string[],
  classCounts: Record<string, number>,
  value: string | undefined
): { option: QuizClassOption; questionCount: number } | null {
  if (!value) return null;
  if (!classes.includes(value)) return null;
  return { option: quizClassMeta(value), questionCount: classCounts[value] ?? 0 };
}

export function QuizClassClient({ selectedClassValue }: { selectedClassValue?: string }) {
  const t = useT();
  const { data, loading, error, reload } = useQuizMeta();

  const classes = data?.classes ?? [];
  const classCounts = data?.classCounts ?? {};
  const selected = resolveSelectedClass(classes, classCounts, selectedClassValue);

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-3xl w-full mx-auto">
        {loading && selectedClassValue ? (
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-40 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        ) : error && selectedClassValue ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
              <CircleAlert className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {t("কুইজটি লোড করা যায়নি", "Couldn't load this quiz")}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {t(
                "আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
                "Check your internet connection and try again."
              )}
            </p>
            <Link
              href="/quiz/class"
              className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
            >
              {t("সব শ্রেণির কুইজ", "All class quizzes")}
            </Link>
          </div>
        ) : selectedClassValue && !selected ? (
          <ClassNotFound />
        ) : selected ? (
          <SelectedClassView selected={selected} />
        ) : (
          <>
            <div className="animate-fade-up text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <GraduationCap className="h-3.5 w-3.5" />
                {t("শ্রেণি ভিত্তিক কুইজ", "Class Based Quizzes")}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("আপনার শ্রেণি বেছে নিন", "Choose Your Class")}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {t(
                  "প্রাথমিক থেকে বিশ্ববিদ্যালয় পর্যন্ত সব শ্রেণির জন্য উপযোগী কুইজ। আপনার শ্রেণিটি বেছে নিন।",
                  "Quizzes tailored for every class from primary to university. Pick yours."
                )}
              </p>
            </div>

            <div className="animate-fade-up-1 flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Sparkles className="h-3.5 w-3.5" />
                {t("শ্রেণিসমূহ", "Classes")}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-10 text-center">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("কুইজের তালিকা লোড করা যায়নি", "Couldn't load the quiz list")}
                </p>
                <button
                  onClick={reload}
                  className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-500 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-zinc-900 font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {t("আবার চেষ্টা করুন", "Try again")}
                </button>
              </div>
            ) : classes.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-10 text-center">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {t("এখনো কোনো শ্রেণির কুইজ নেই।", "No class based quizzes yet.")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {classes.map((value, i) => (
                  <ClassCard
                    key={value}
                    cls={quizClassMeta(value)}
                    index={i}
                    questionCount={classCounts[value] ?? 0}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 flex justify-center animate-fade-up-2">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("কুইজে ফিরে যান", "Back to Quiz")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ClassNotFound() {
  const t = useT();
  return (
    <>
      <Link
        href="/quiz/class"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-8"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব শ্রেণির কুইজ", "All class quizzes")}
      </Link>

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <CircleAlert className="h-7 w-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {t("শ্রেণিটি পাওয়া যায়নি", "Class not found")}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {t(
            "এই ঠিকানায় কোনো শ্রেণি নেই। নিচের তালিকা থেকে একটি শ্রেণি বেছে নিন।",
            "There's no class at this address. Pick one from the list below."
          )}
        </p>
        <Link
          href="/quiz/class"
          className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          {t("সব শ্রেণি দেখুন", "See all classes")}
        </Link>
      </div>
    </>
  );
}

function SelectedClassView({
  selected,
}: {
  selected: { option: QuizClassOption; questionCount: number };
}) {
  const t = useT();
  const { option: cls, questionCount } = selected;
  return (
    <>
      <Link
        href="/quiz/class"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-8"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব শ্রেণির কুইজ", "All class quizzes")}
      </Link>

      <div className="animate-fade-up">
        <div
          className={`relative overflow-hidden rounded-3xl border-2 ${cls.border} ${cls.bg} backdrop-blur-sm p-6 sm:p-8 mb-8`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${cls.gradient} opacity-10`} />
          <div className="relative flex items-center gap-4">
            <div
              className={`flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${cls.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
            >
              <cls.icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {t(cls.labelBn, cls.label)}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("শ্রেণি উপযোগী প্রশ্ন", "Class-based questions")}{" "}
                {questionCount > 0 &&
                  `· ${t(
                    `${questionCount}টি প্রশ্ন`,
                    `${questionCount} question${questionCount !== 1 ? "s" : ""}`
                  )}`}
              </p>
            </div>
          </div>
        </div>

        <QuizClassPracticeSession cls={cls} />
      </div>
    </>
  );
}