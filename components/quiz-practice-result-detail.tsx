"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  BookOpenCheck,
  ListChecks,
  Trophy,
  XCircle,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { quizTopicMeta } from "@/lib/quiz-sections";
import {
  fetchQuizResultById,
  dbResultDate,
  type DbQuizQuestion,
  type DbQuizResult,
} from "@/lib/quiz-results-api";

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function resultBadge(
  r: DbQuizResult
): { label: string; labelBn: string; icon: LucideIcon; iconColor: string; bg: string } {
  const type = r.quizType?.name ?? "";
  if (type === "MIXED") {
    return {
      label: r.title || "Class Quiz",
      labelBn: r.title || "শ্রেণি কুইজ",
      icon: GraduationCap,
      iconColor: "text-white",
      bg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    };
  }
  const meta = quizTopicMeta(type);
  return {
    label: meta.label,
    labelBn: meta.labelBn,
    icon: BookOpenCheck,
    iconColor: meta.text,
    bg: meta.bg,
  };
}

function QuestionCard({ question }: { question: DbQuizQuestion }) {
  return (
    <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <Link
          href={`/quiz/question/${question.id}`}
          className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          {question.questionText}
        </Link>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            DIFFICULTY_COLORS[question.difficultyLevel] ??
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {question.difficultyLevel}
        </span>
      </div>
      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isCorrectOption = option === question.answer;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5",
                isCorrectOption
                  ? "border-emerald-400/70 dark:border-emerald-600/70 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40"
              )}
            >
              <span
                className={cn(
                  "flex flex-shrink-0 h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                  isCorrectOption
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                )}
              >
                {isCorrectOption ? <Check className="h-3.5 w-3.5" /> : (LETTERS[i] ?? "")}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm leading-relaxed",
                  isCorrectOption
                    ? "text-emerald-800 dark:text-emerald-200 font-medium"
                    : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                {option}
              </span>
            </div>
          );
        })}
      </div>
      {question.explanation ? (
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Explanation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
              {question.explanation
                .split(/<br\s*\/?>/i)
                .map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
            </p>
          </div>
        </div>
      ) : null}
    </StaggerItem>
  );
}

function QuestionSection({
  title,
  titleBn,
  questions,
  correct,
}: {
  title: string;
  titleBn: string;
  questions: DbQuizQuestion[];
  correct: boolean;
}) {
  const t = useT();
  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            correct ? "text-emerald-500" : "text-rose-500"
          )}
        />
        {t(titleBn, title)}
        <span className="text-xs font-normal text-zinc-400">({questions.length})</span>
      </h3>
      {questions.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          <StaggerContainer className="contents">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </StaggerContainer>
        </div>
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 px-1">
          {correct
            ? t("কোনো সঠিক প্রশ্ন নেই।", "No correct questions.")
            : t("কোনো ভুল প্রশ্ন নেই।", "No incorrect questions.")}
        </p>
      )}
    </div>
  );
}

export function QuizPracticeResultDetail({ resultId }: { resultId: number }) {
  const [result, setResult] = useState<DbQuizResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoaded(false);
      const data = await fetchQuizResultById(resultId);
      if (cancelled) return;
      setResult(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resultId]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <GraduationCap className="size-6 animate-pulse" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <Trophy className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
          {t("ফলাফলটি পাওয়া যায়নি।", "This result could not be found.")}
        </p>
        <Link
          href="/profile"
          className="mt-3 inline-flex text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
        >
          {t("প্রোফাইলে ফিরে যান", "Back to profile")}
        </Link>
      </div>
    );
  }

  const badge = resultBadge(result);
  const Icon = badge.icon;
  const correctCount = result.correctQuestions?.length ?? result.correctAnswers;
  const incorrectCount = result.incorrectQuestions?.length ?? 0;
  const hasDetail = (result.correctQuestions?.length ?? 0) + (result.incorrectQuestions?.length ?? 0) > 0;
  const accuracy = hasDetail
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : result.scoreInPercent;

  return (
    <StaggerContainer className="space-y-6">
      {/* Summary card */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={cn("p-2.5 rounded-xl", badge.bg)}>
            <Icon className={cn("h-5 w-5", badge.iconColor)} />
          </div>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t(badge.labelBn, badge.label)}
          </span>
        </div>
        <div
          className={cn(
            "text-6xl sm:text-7xl font-black bg-clip-text text-transparent mb-2",
            result.scoreInPercent >= 90
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : result.scoreInPercent >= 70
                ? "bg-gradient-to-br from-sky-500 to-blue-500"
                : result.scoreInPercent >= 50
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-rose-500 to-pink-500"
          )}
        >
          {result.scoreInPercent}%
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(dbResultDate(result))}
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {result.questionCount}
            </div>
            <div className="text-xs text-zinc-400">{t("মোট প্রশ্ন", "Questions")}</div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {correctCount}
            </div>
            <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              {t("সঠিক", "Correct")}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {incorrectCount}
            </div>
            <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
              {t("ভুল", "Incorrect")}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-3">
            <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {result.timePerQuestion}
            </div>
            <div className="text-xs text-zinc-400">
              {t("সেকেন্ড / প্রশ্ন", "s / question")}
            </div>
          </div>
        </div>

        {result.levels.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {result.levels.map((lv) => (
              <span
                key={lv}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium",
                  LEVEL_COLORS[lv] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {lv}
              </span>
            ))}
          </div>
        )}
      </StaggerItem>

      {/* Accuracy bar */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t("সঠিকতার হার", "Accuracy")}
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {accuracy}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700",
              accuracy >= 70
                ? "from-emerald-500 to-teal-500"
                : accuracy >= 50
                  ? "from-amber-500 to-orange-500"
                  : "from-rose-500 to-pink-500"
            )}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </StaggerItem>

      {/* Correct questions */}
      <StaggerItem>
        <QuestionSection
          title="Correct Questions"
          titleBn="সঠিক প্রশ্ন"
          questions={result.correctQuestions ?? []}
          correct
        />
      </StaggerItem>

      {/* Incorrect questions */}
      <StaggerItem>
        <QuestionSection
          title="Incorrect Questions"
          titleBn="ভুল প্রশ্ন"
          questions={result.incorrectQuestions ?? []}
          correct={false}
        />
      </StaggerItem>

      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 px-1">
        <ListChecks className="h-3.5 w-3.5" />
        {t(
          `মোট সময়: ${result.timeTotalQuiz} সেকেন্ড`,
          `Total time: ${result.timeTotalQuiz} seconds`
        )}
      </div>
    </StaggerContainer>
  );
}