"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  Sparkles,
  ArrowLeft,
  CircleAlert,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { quizTopicMeta, type QuizTopic } from "@/lib/quiz-sections";
import { useQuizMeta, type QuizTypeItem } from "@/lib/quiz-meta";
import { GrammarTopicCard } from "@/components/quiz-catalog";
import { QuizTopicPlay, type TopicQuizQuestion } from "@/components/quiz-topic-play";
import { QuizBackLink } from "@/components/quiz-back-link";

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
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-3xl w-full mx-auto">
        <QuizBackLink className="animate-fade-up mb-6" />

        {loading && selectedTopicSlug ? (
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-40 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        ) : error && selectedTopicSlug ? (
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
              href="/quiz/grammar"
              className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
            >
              {t("সব গ্রামার টপিক", "All grammar topics")}
            </Link>
          </div>
        ) : selectedTopicSlug && !selected ? (
          <TopicNotFound />
        ) : selected ? (
          <SelectedTopicView selected={selected} />
        ) : (
          <>
            <div className="animate-fade-up text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <BookMarked className="h-3.5 w-3.5" />
                {t("গ্রামার টপিক কুইজ", "Grammar Topic Quizzes")}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("গ্রামার টপিক বেছে নিন", "Choose a Grammar Topic")}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {t(
                  "যে গ্রামার টপিকটি অনুশীলন করতে চান সেটি বেছে নিন।",
                  "Pick a grammar topic you want to practice."
                )}
              </p>
            </div>

            <div className="animate-fade-up-1 flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <Sparkles className="h-3.5 w-3.5" />
                {t("গ্রামার টপিক", "Grammar Topics")}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
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
            ) : quizTypes.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-10 text-center">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {t("এখনো কোনো গ্রামার টপিক কুইজ নেই।", "No grammar topic quizzes yet.")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {[...quizTypes]
                  .sort((a, b) => b.questionCount - a.questionCount)
                  .map((item, i) => (
                    <GrammarTopicCard
                      key={item.name}
                      topic={quizTopicMeta(item.name)}
                      questionCount={item.questionCount}
                      index={i}
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

function TopicNotFound() {
  const t = useT();
  return (
    <>
      <Link
        href="/quiz/grammar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-8"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব গ্রামার টপিক", "All grammar topics")}
      </Link>

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <CircleAlert className="h-7 w-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
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
          className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          {t("সব গ্রামার টপিক দেখুন", "See all grammar topics")}
        </Link>
      </div>
    </>
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
    <>
      <Link
        href="/quiz/grammar"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-8"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("সব গ্রামার টপিক", "All grammar topics")}
      </Link>

      <div className="animate-fade-up">
        <div
          className={`relative overflow-hidden rounded-3xl border-2 ${topic.border} ${topic.bg} backdrop-blur-sm p-6 sm:p-8 mb-8`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-10`} />
          <div className="relative flex items-center gap-4">
            <div
              className={`flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
            >
              <topic.icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {t(topic.labelBn, topic.label)}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t(topic.descBn, topic.desc)}{" "}
                {selected.questionCount > 0 &&
                  `· ${t(
                    `${selected.questionCount}টি প্রশ্ন`,
                    `${selected.questionCount} question${selected.questionCount !== 1 ? "s" : ""}`
                  )}`}
              </p>
            </div>
          </div>
        </div>

        <TopicQuizSession topic={topic} questionCount={selected.questionCount} />
      </div>
    </>
  );
}

function TopicQuizSession({
  topic,
  questionCount,
}: {
  topic: QuizTopic;
  questionCount: number;
}) {
  const t = useT();
  const [questions, setQuestions] = useState<TopicQuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/quiz/by-type?quizType=${encodeURIComponent(topic.name)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setQuestions(json.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topic.name, questionCount, tick]);

  function reload() {
    setError(false);
    setLoading(true);
    setTick((n) => n + 1);
  }

  if (questionCount === 0 || (questions !== null && questions.length === 0)) {
    return <NoQuizzesYet topic={topic} />;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-40 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
        <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
        <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
      </div>
    );
  }

  if (error) {
    return (
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
        <button
          onClick={reload}
          className="inline-flex items-center gap-1.5 mt-6 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-500 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-zinc-900 font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t("আবার চেষ্টা করুন", "Try again")}
        </button>
      </div>
    );
  }

  if (questions === null) {
    return null;
  }

  return <QuizTopicPlay topic={topic} questions={questions} />;
}

function NoQuizzesYet({ topic }: { topic: QuizTopic }) {
  const t = useT();
  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
        <CircleAlert className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
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
        className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
      >
        {t("আরেকটি টপিক বেছে নিন", "Pick another topic")}
      </Link>
    </div>
  );
}