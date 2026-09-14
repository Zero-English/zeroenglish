"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { Check, X, RotateCcw, Trophy, ArrowLeft } from "lucide-react";
import type { QuizTopic } from "@/lib/quiz-sections";

export interface TopicQuizQuestion {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: string;
  answer: string;
}

interface AnswerRecord {
  question: TopicQuizQuestion;
  picked: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizTopicPlay({
  topic,
  questions,
}: {
  topic: QuizTopic;
  questions: TopicQuizQuestion[];
}) {
  const t = useT();
  const [order, setOrder] = useState<TopicQuizQuestion[]>(() => shuffle(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const total = order.length;
  const current = order[currentIndex];
  const isAnswered = picked !== null;
  const score = answers.filter((a) => a.picked === a.question.answer).length;
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  function handlePick(option: string) {
    if (isAnswered || finished) return;
    setPicked(option);
  }

  function handleNext() {
    if (!isAnswered) return;
    const nextAnswers = [...answers, { question: current, picked: picked! }];
    setAnswers(nextAnswers);
    if (currentIndex >= total - 1) {
      setFinished(true);
      setPicked(null);
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setPicked(null);
  }

  function handleRestart() {
    setOrder(shuffle(questions));
    setCurrentIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    return (
      <ResultsView
        topic={topic}
        score={score}
        total={total}
        answers={answers}
        onRestart={handleRestart}
      />
    );
  }

  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="max-w-xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentIndex + 1}</span>
          <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
          {total}
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            {t("স্কোর", "Score")}{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{score}</span>
          </span>
          <Link
            href="/quiz/grammar"
            className="p-2 -m-2 rounded-xl text-zinc-400 hover:text-red-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title={t("কুইজ থেকে বেরিয়ে যান", "Exit quiz")}
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-10 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r",
            topic.gradient
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="animate-fade-up mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
          {t(topic.labelBn, topic.label)}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {current.questionText}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((option, i) => {
          const isCorrect = option === current.answer;
          const isWrongPick = isAnswered && option === picked && !isCorrect;

          let optionStyle =
            "border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/60";

          if (isAnswered) {
            if (isCorrect) {
              optionStyle =
                "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30";
            } else if (isWrongPick) {
              optionStyle =
                "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-400/30";
            } else {
              optionStyle =
                "border-zinc-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-950/30 opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handlePick(option)}
              disabled={isAnswered}
              className={cn(
                "w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default",
                optionStyle
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                  isAnswered
                    ? isCorrect
                      ? "bg-emerald-500 text-white"
                      : isWrongPick
                        ? "bg-red-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                )}
              >
                {isAnswered && (isCorrect || isWrongPick) ? (
                  isCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )
                ) : (
                  (letters[i] ?? "")
                )}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm sm:text-base leading-relaxed",
                  isAnswered && isCorrect
                    ? "text-emerald-800 dark:text-emerald-200 font-medium"
                    : isWrongPick
                      ? "text-red-800 dark:text-red-200 font-medium"
                      : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {isAnswered && (
        <div className="mt-7 flex justify-center animate-fade-up">
          <Button onClick={handleNext} size="lg" className="px-10">
            {currentIndex >= total - 1
              ? t("ফলাফল দেখুন", "See Results")
              : t("পরের প্রশ্ন", "Next Question")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultsView({
  topic,
  score,
  total,
  answers,
  onRestart,
}: {
  topic: QuizTopic;
  score: number;
  total: number;
  answers: AnswerRecord[];
  onRestart: () => void;
}) {
  const t = useT();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const incorrect = answers.filter((a) => a.picked !== a.question.answer);

  return (
    <div className="max-w-xl mx-auto">
      <div className="animate-fade-up">
        <div className={cn("relative overflow-hidden rounded-3xl border-2 backdrop-blur-sm p-8 text-center", topic.border, topic.bg)}>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", topic.gradient)} />
          <div className="relative">
            <div className={cn("inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-black/10", topic.gradient)}>
              <Trophy className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {t("কুইজ শেষ!", "Quiz complete!")}
            </h3>
            <p className="mt-2 text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {score}
              <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                /{total}
              </span>
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {percentage}% {t("সঠিক উত্তর", "correct answers")}
            </p>
          </div>
        </div>
      </div>

      {incorrect.length > 0 && (
        <div className="animate-fade-up-1 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400">
              <X className="h-3.5 w-3.5" />
              {t("ভুল উত্তর", "Incorrect Answers")} ({incorrect.length})
            </span>
          </div>
          <div className="space-y-3">
            {incorrect.map(({ question, picked }, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-4"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {question.questionText}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 text-red-700 dark:text-red-300">
                    {t("আপনার উত্তর:", "Your answer:")} {picked}
                  </span>
                  <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                    {t("সঠিক উত্তর:", "Correct answer:")} {question.answer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-up-2 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={onRestart} size="lg" className="px-8">
          <RotateCcw />
          {t("আবার খেলুন", "Play Again")}
        </Button>
        <Button asChild variant="outline" size="lg" className="px-8">
          <Link href="/quiz/grammar">
            <ArrowLeft />
            {t("সব গ্রামার টপিক", "All grammar topics")}
          </Link>
        </Button>
      </div>
    </div>
  );
}