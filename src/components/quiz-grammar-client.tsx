"use client";

import Link from "next/link";
import {
  BookMarked,
  Sparkles,
  ArrowLeft,
  CircleAlert,
  Layers,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { quizTopicMeta, type QuizTopic } from "@/lib/quiz-sections";
import { useQuizMeta, type QuizTypeItem } from "@/lib/quiz-meta";
import { GrammarTopicCard } from "@/components/quiz-catalog";
import { GrammarPracticeSession } from "@/components/quiz-grammar-practice";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

function resolveSelectedTopics(
  quizTypes: QuizTypeItem[],
  slug: string | undefined
): { topic: QuizTopic; questionCount: number } | null {
  if (!slug) return null;
  const item = quizTypes.find((t) => t.name === slug);
  if (!item) return null;
  return { topic: quizTopicMeta(item.name), questionCount: item.questionCount };
}

export function QuizGrammarClient({
  selectedTopicSlug,
}: {
  selectedTopicSlug?: string;
}) {
  const t = useT();
  const { data, loading, error, reload } = useQuizMeta();

  const quizTypes = data?.quizTypes ?? [];
  const selected = resolveSelectedTopics(quizTypes, selectedTopicSlug);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl w-full">
          {loading && selectedTopicSlug ? (
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-32 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
              <div className="h-36 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
              <div className="h-56 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            </div>
          ) : error && selectedTopicSlug ? (
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
                href="/quiz/grammar"
                className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
              >
                {t("সব গ্রামার টপিক", "All grammar topics")}
              </Link>
            </div>
          ) : selectedTopicSlug && !selected ? (
            <TopicNotFound />
          ) : selected ? (
            <SelectedTopicView selected={selected} />
          ) : (
            <StaggerContainer>
              <StaggerItem>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(ICON_CHIP, "text-emerald-500")}>
                      <BookMarked className="size-4.5" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {t("গ্রামার টপিক কুইজ", "Grammar Topic Quizzes")}
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        {t(
                          "টেন্স, প্রিপজিশন, ভয়েস চেঞ্জ, আর্টিকেল ও ন্যারেশনসহ সব গুরুত্বপূর্ণ গ্রামার টপিক অনুশীলন।",
                          "Master English grammar concepts with targeted topic quizzes and instant explanations."
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
              </StaggerItem>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
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
              ) : quizTypes.length === 0 ? (
                <div className={cn(CARD, "p-8 text-center")}>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {t("এখনো কোনো গ্রামার টপিক কুইজ নেই।", "No grammar topic quizzes yet.")}
                  </p>
                </div>
              ) : (
                <div className={cn(CARD, "overflow-hidden")}>
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
                    {[...quizTypes]
                      .sort((a, b) => b.questionCount - a.questionCount)
                      .map((item) => {
                        const topic = quizTopicMeta(item.name);
                        const Icon = topic.icon;
                        const hasQuestions = item.questionCount > 0;
                        return (
                          <StaggerItem
                            key={item.name}
                            className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0"
                          >
                            <Link
                              href={`/quiz/grammar?topic=${encodeURIComponent(topic.name)}`}
                              className={cn(
                                "group flex h-full w-full flex-col text-left gap-3 p-5 sm:p-6 transition-colors",
                                "hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
                                    topic.gradient
                                  )}
                                >
                                  <Icon className="h-6 w-6" />
                                </div>

                                {hasQuestions ? (
                                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    {t(
                                      `${item.questionCount}টি প্রশ্ন`,
                                      `${item.questionCount} questions`
                                    )}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                    {t("শীঘ্রই আসছে", "Coming soon")}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                  {t(topic.labelBn, topic.label)}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                                  {t(topic.descBn, topic.desc)}
                                </p>
                              </div>
                            </Link>
                          </StaggerItem>
                        );
                      })}
                  </StaggerContainer>
                </div>
              )}
            </StaggerContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicNotFound() {
  const t = useT();
  return (
    <div className="space-y-6">
      <Link
        href="/quiz/grammar"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব গ্রামার টপিক", "All grammar topics")}
      </Link>

      <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
        <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <CircleAlert className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          {t("টপিকটি পাওয়া যায়নি", "Topic not found")}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {t(
            "এই ঠিকানায় কোনো গ্রামার টপিক নেই। নিচের তালিকা থেকে একটি টপিক বেছে নিন।",
            "There's no grammar topic at this address. Pick one from the list below."
          )}
        </p>
        <Link
          href="/quiz/grammar"
          className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
        >
          {t("সব গ্রামার টপিক দেখুন", "See all grammar topics")}
        </Link>
      </div>
    </div>
  );
}

function SelectedTopicView({
  selected,
}: {
  selected: { topic: QuizTopic; questionCount: number };
}) {
  const t = useT();
  const topic = selected.topic;
  return (
    <div className="space-y-6">
      <Link
        href="/quiz/grammar"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব গ্রামার টপিক", "All grammar topics")}
      </Link>

      <div className={cn(CARD, "overflow-hidden p-5 sm:p-6 relative")}>
        <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-[0.04] dark:opacity-[0.08]`} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${topic.gradient} text-white shadow-sm`}
            >
              <topic.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                <Layers className="h-3 w-3 text-orange-500" />
                {t("টপিক কুইজ", "Topic Quiz")}
              </div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t(topic.labelBn, topic.label)}
              </h2>
            </div>
          </div>
          {selected.questionCount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t(`${selected.questionCount}টি প্রশ্ন উপলব্ধ`, `${selected.questionCount} questions available`)}
            </div>
          )}
        </div>
      </div>

      {selected.questionCount === 0 ? (
        <NoQuizzesYet topic={topic} />
      ) : (
        <GrammarPracticeSession topic={topic} />
      )}
    </div>
  );
}

function NoQuizzesYet({ topic }: { topic: QuizTopic }) {
  const t = useT();
  return (
    <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
      <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
        <CircleAlert className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
        {t("এই টপিকে এখনো কোনো কুইজ নেই", "No quizzes for this topic yet")}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
        {t(
          `${topic.labelBn} টপিকে এখনো কোনো অনুশীলন প্রশ্ন যোগ করা হয়নি। অন্য টপিক থেকে অনুশীলন করুন।`,
          `No practice questions have been added for ${topic.label} yet. Try another topic in the meantime.`
        )}
      </p>
      <Link
        href="/quiz/grammar"
        className="inline-flex mt-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 text-sm shadow-md shadow-orange-500/20 transition-colors"
      >
        {t("আরেকটি টপিক বেছে নিন", "Pick another topic")}
      </Link>
    </div>
  );
}