"use client";

import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CircleAlert,
  BookOpen,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { quizClassMeta, type QuizClassOption } from "@/lib/quiz-sections";
import { useQuizMeta } from "@/lib/quiz-meta";
import { ClassCard } from "@/components/quiz-catalog";
import { QuizClassPracticeSession } from "@/components/quiz-class-practice";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

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
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl w-full">
          {loading && selectedClassValue ? (
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-32 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
              <div className="h-36 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
              <div className="h-56 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            </div>
          ) : error && selectedClassValue ? (
            <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
              <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-300 mb-4">
                <CircleAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
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
                className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
              >
                {t("সব শ্রেণির কুইজ", "All class quizzes")}
              </Link>
            </div>
          ) : selectedClassValue && !selected ? (
            <ClassNotFound />
          ) : selected ? (
            <SelectedClassView selected={selected} />
          ) : (
            <StaggerContainer>
              <StaggerItem>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="space-y-1">
                    <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("শ্রেণি ভিত্তিক কুইজ", "Class Based Quizzes")}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      {t(
                        "প্রাথমিক থেকে বিশ্ববিদ্যালয়, SSC, HSC, IELTS ও BCS উপযোগী কুইজ অনুশীলন।",
                        "Practice English tailored for school, university, SSC, HSC, IELTS and BCS."
                      )}
                    </p>
                  </div>
                  {classes.length > 0 && (
                    <span className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 tabular-nums">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      {t(`${classes.length}টি শ্রেণি`, `${classes.length} classes`)}
                    </span>
                  )}
                </div>
              </StaggerItem>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
                  ))}
                </div>
              ) : error ? (
                <div className={cn(CARD, "p-8 text-center")}>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {t("কুইজের তালিকা লোড করা যায়নি", "Couldn't load the quiz list")}
                  </p>
                  <button
                    onClick={reload}
                    className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-orange-600 text-white font-semibold px-5 py-2 text-sm shadow-md shadow-orange-500/20 hover:bg-orange-700 transition-colors cursor-pointer"
                  >
                    {t("আবার চেষ্টা করুন", "Try again")}
                  </button>
                </div>
              ) : classes.length === 0 ? (
                <div className={cn(CARD, "p-8 text-center")}>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {t("এখনো কোনো শ্রেণির কুইজ নেই।", "No class based quizzes yet.")}
                  </p>
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {classes.map((value, i) => (
                    <StaggerItem key={value}>
                      <ClassCard
                        cls={quizClassMeta(value)}
                        index={i}
                        questionCount={classCounts[value] ?? 0}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </StaggerContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassNotFound() {
  const t = useT();
  return (
    <div className="space-y-6">
      <Link
        href="/quiz/class"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব শ্রেণির কুইজ", "All class quizzes")}
      </Link>

      <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
        <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <CircleAlert className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
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
          className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
        >
          {t("সব শ্রেণি দেখুন", "See all classes")}
        </Link>
      </div>
    </div>
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
    <div className="space-y-6">
      <Link
        href="/quiz/class"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব শ্রেণির কুইজ", "All class quizzes")}
      </Link>

      <div className={cn(CARD, "overflow-hidden p-5 sm:p-6 relative")}>
        <div className={`absolute inset-0 bg-gradient-to-br ${cls.gradient} opacity-[0.04] dark:opacity-[0.08]`} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${cls.gradient} text-white shadow-sm`}
            >
              <cls.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                <BookOpen className="h-3 w-3 text-orange-500" />
                {t("শ্রেণি কুইজ", "Class Quiz")}
              </div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t(cls.labelBn, cls.label)}
              </h2>
            </div>
          </div>
          {questionCount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t(`${questionCount}টি প্রশ্ন উপলব্ধ`, `${questionCount} questions available`)}
            </div>
          )}
        </div>
      </div>

      {questionCount === 0 ? (
        <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
          <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
            <CircleAlert className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
            {t("এই শ্রেণিতে এখনো কোনো কুইজ নেই", "No quizzes for this class yet")}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {t(
              `${selected.option.labelBn} শ্রেণির জন্য এখনো কোনো অনুশীলন প্রশ্ন যোগ করা হয়নি। অন্য শ্রেণি থেকে অনুশীলন করুন।`,
              `No practice questions have been added for ${selected.option.label} yet. Try another class in the meantime.`
            )}
          </p>
          <Link
            href="/quiz/class"
            className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
          >
            {t("আরেকটি শ্রেণি বেছে নিন", "Pick another class")}
          </Link>
        </div>
      ) : (
        <QuizClassPracticeSession cls={selected.option} />
      )}
    </div>
  );
}