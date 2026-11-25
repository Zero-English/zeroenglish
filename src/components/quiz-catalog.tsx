"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  ArrowRight,
  GraduationCap,
  BookOpenCheck,
  RefreshCw,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import {
  quizTopicMeta,
  quizClassMeta,
  type QuizTopic,
  type QuizClassOption,
} from "@/lib/quiz-sections";
import { useQuizMeta } from "@/lib/quiz-meta";
import { cn } from "@/lib/utils";

export const PASTEL_STYLES = [
  "bg-[#ecf7f1] dark:bg-[#12281d] border-emerald-500/10",
  "bg-[#f3f0fb] dark:bg-[#211a33] border-purple-500/10",
  "bg-[#faf4ee] dark:bg-[#2b2219] border-amber-500/10",
  "bg-[#f0f5f1] dark:bg-[#1c2820] border-teal-500/10",
  "bg-[#eef5fa] dark:bg-[#162432] border-blue-500/10",
  "bg-[#f9f1f5] dark:bg-[#2d1b26] border-rose-500/10",
];

export function GrammarTopicCard({
  topic,
  questionCount,
  index,
}: {
  topic: QuizTopic;
  questionCount: number;
  index: number;
}) {
  const t = useT();
  const Icon = topic.icon;
  const hasQuestions = questionCount > 0;
  const pastel = PASTEL_STYLES[index % PASTEL_STYLES.length];

  return (
    <Link
      href={`/quiz/grammar?topic=${encodeURIComponent(topic.name)}`}
      className={cn(
        "group relative flex flex-col justify-between text-left rounded-[22px] border border-black/[0.06] bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-8px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] active:scale-[0.99]"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[14px] border shadow-2xs transition-transform duration-300 group-hover:scale-105",
              pastel
            )}
          >
            <Icon className="size-5" />
          </div>

          {hasQuestions ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
              {t(
                `${questionCount}টি প্রশ্ন`,
                `${questionCount} question${questionCount !== 1 ? "s" : ""}`
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 dark:bg-white/[0.05] dark:text-zinc-500">
              {t("শীঘ্রই আসছে", "Coming soon")}
            </span>
          )}
        </div>

        <div className="mt-3.5">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-base">
            {t(topic.labelBn, topic.label)}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t(topic.descBn, topic.desc)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/[0.04] pt-3 dark:border-white/[0.04]">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
          {t("অনুশীলন শুরু", "Start Practice")}
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-[#f1f1ef] text-zinc-600 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:bg-[#252528] dark:text-zinc-300 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function ClassCard({
  cls,
  index,
  questionCount,
}: {
  cls: QuizClassOption;
  index: number;
  questionCount?: number;
}) {
  const t = useT();
  const Icon = cls.icon;
  const hasQuestions = (questionCount ?? 0) > 0;
  const pastel = PASTEL_STYLES[index % PASTEL_STYLES.length];

  return (
    <Link
      href={`/quiz/class?class=${encodeURIComponent(cls.value)}`}
      className={cn(
        "group relative flex items-center justify-between gap-3 rounded-[20px] border border-black/[0.06] bg-white p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_-8px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[22px]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] active:scale-[0.99]"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[12px] border shadow-2xs transition-transform duration-300 group-hover:scale-105",
            pastel
          )}
        >
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t(cls.labelBn, cls.label)}
          </span>
          {questionCount != null && (
            <span className="mt-0.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {hasQuestions
                ? t(
                    `${questionCount}টি প্রশ্ন`,
                    `${questionCount} question${questionCount !== 1 ? "s" : ""}`
                  )
                : t("শীঘ্রই আসছে", "Coming soon")}
            </span>
          )}
        </div>
      </div>

      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f1f1ef] text-zinc-600 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:bg-[#252528] dark:text-zinc-300 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SectionBadge({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function RetryState({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-8 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-3">
        <BookOpenCheck className="h-6 w-6 text-zinc-400" />
      </div>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {t("কুইজের তালিকা লোড করা যায়নি", "Couldn't load the quiz list")}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
        {t(
          "আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
          "Check your internet connection and try again."
        )}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-500 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-zinc-900 font-semibold px-5 py-2.5 text-sm hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
      >
        <RefreshCw className="h-4 w-4" />
        {t("আবার চেষ্টা করুন", "Try again")}
      </button>
    </div>
  );
}

const INITIAL_GRAMMAR_TOPICS = 6;
const GRAMMAR_TOPICS_PER_PAGE = 6;

export function GrammarTopicsSection() {
  const t = useT();
  const { data, loading, error, reload } = useQuizMeta();
  const [visibleCount, setVisibleCount] = useState(INITIAL_GRAMMAR_TOPICS);

  const topics =
    data?.quizTypes
      .map((qt) => ({
        topic: quizTopicMeta(qt.name),
        questionCount: qt.questionCount,
      }))
      .sort((a, b) => b.questionCount - a.questionCount) ?? [];
  const visible = topics.slice(0, visibleCount);
  const hasMore = visibleCount < topics.length;

  return (
    <section>
      <div className="animate-fade-up-1 flex items-center gap-2 mb-4">
        <SectionBadge icon={BookMarked} label={t("গ্রামার টপিক কুইজ", "Grammar Topic Quizzes")} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          ))}
        </div>
      ) : error ? (
        <RetryState onRetry={reload} />
      ) : topics.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-8 text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t("এখনো কোনো গ্রামার টপিক কুইজ নেই।", "No grammar topic quizzes yet.")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {visible.map(({ topic, questionCount }, i) => (
              <GrammarTopicCard
                key={topic.name}
                topic={topic}
                questionCount={questionCount}
                index={i}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center animate-fade-up-2">
              <button
                onClick={() => setVisibleCount((n) => n + GRAMMAR_TOPICS_PER_PAGE)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-500 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-zinc-900 font-semibold px-6 py-3 text-sm hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
                {t("আরও গ্রামার টপিক লোড করুন", "Load more grammar topics")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function ClassesSection() {
  const t = useT();
  const { data, loading, error, reload } = useQuizMeta();

  const classes = data?.classes.map((c) => quizClassMeta(c)) ?? [];

  return (
    <section>
      <div className="animate-fade-up-1 flex items-center gap-2 mb-4">
        <SectionBadge icon={GraduationCap} label={t("শ্রেণি ভিত্তিক কুইজ", "Class Based Quizzes")} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          ))}
        </div>
      ) : error ? (
        <RetryState onRetry={reload} />
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-8 text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t("এখনো কোনো শ্রেণির কুইজ নেই।", "No class based quizzes yet.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {classes.map((cls, i) => (
            <ClassCard
              key={cls.value}
              cls={cls}
              index={i}
              questionCount={data?.classCounts?.[cls.value] ?? 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}