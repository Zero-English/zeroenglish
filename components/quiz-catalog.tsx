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

  return (
    <Link
      href={`/quiz/grammar?topic=${encodeURIComponent(topic.name)}`}
      className={`group relative flex flex-col text-left overflow-hidden rounded-3xl border-2 ${topic.border} ${topic.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[1.02] active:-translate-y-1`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div className="relative flex items-center justify-between p-6 pb-4">
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {hasQuestions ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {t(
              `${questionCount}টি প্রশ্ন`,
              `${questionCount} question${questionCount !== 1 ? "s" : ""}`
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {t("শীঘ্রই আসছে", "Coming soon")}
          </span>
        )}
      </div>

      <div className="relative flex-1 px-6 pb-6 pt-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t(topic.labelBn, topic.label)}
        </h3>
        <p className={`text-sm font-medium mt-1 ${topic.text}`}>
          {t(topic.descBn, topic.desc)}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {t("শুরু", "Start")}
            <ArrowRight className="inline-block h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
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
  return (
    <Link
      href={`/quiz/class?class=${encodeURIComponent(cls.value)}`}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 ${cls.border} ${cls.bg} backdrop-blur-sm p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[1.02] active:-translate-y-0.5`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${cls.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div
        className={`relative flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cls.gradient} shadow-md shadow-black/10`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div className="relative min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {t(cls.labelBn, cls.label)}
        </span>
        {questionCount != null && (
          <span className="mt-0.5 block text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            {hasQuestions
              ? t(
                  `${questionCount}টি প্রশ্ন`,
                  `${questionCount} question${questionCount !== 1 ? "s" : ""}`
                )
              : t("শীঘ্রই আসছে", "Coming soon")}
          </span>
        )}
      </div>

      <ArrowRight className="relative h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600 transition-transform duration-300 group-hover:translate-x-1" />
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