"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ListChecks,
  CheckCircle2,
  XCircle,
  Trophy,
  GraduationCap,
  BookOpenCheck,
  BarChart3,
  Award,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { useAuthStatus } from "@/lib/auth-store";
import { quizTopicMeta } from "@/lib/quiz-sections";
import {
  fetchQuizResultsFromDb,
  dbResultDate,
  type DbQuizResult,
} from "@/lib/quiz-results-api";

const VOCAB_QUIZ_TYPES = new Set([
  "ENGLISH_TO_BANGLA",
  "BANGLA_TO_ENGLISH",
  "SYNONYMS",
  "ANTONYMS",
]);

// Grammar- and class-based practice results are stored in the QuizResults table
// (word/vocab practice lives in VocabularyExamResult). Vocabulary quiz types are
// excluded here so only grammar & class results render in this panel.
function isGrammarOrClassResult(r: DbQuizResult): boolean {
  if (r.examId != null) return false;
  if (r.mode !== "PRACTICE") return false;
  const type = r.quizType?.name ?? "";
  return !VOCAB_QUIZ_TYPES.has(type);
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function winColor(win: number) {
  if (win >= 90) return "text-emerald-500";
  if (win >= 70) return "text-sky-500";
  if (win >= 50) return "text-amber-500";
  return "text-rose-500";
}

function resultBadge(
  r: DbQuizResult
): { icon: LucideIcon; label: string; labelBn: string; iconColor: string; bg: string } {
  const type = r.quizType?.name ?? "";
  if (type === "MIXED") {
    return {
      icon: GraduationCap,
      label: r.title || "Class Quiz",
      labelBn: r.title || "শ্রেণি কুইজ",
      iconColor: "text-white",
      bg: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    };
  }
  const meta = quizTopicMeta(type);
  return {
    icon: BookOpenCheck,
    label: meta.label,
    labelBn: meta.labelBn,
    iconColor: meta.text,
    bg: meta.bg,
  };
}

function ResultBadgeIcon({ r }: { r: DbQuizResult }) {
  const badge = resultBadge(r);
  const Icon = badge.icon;
  return (
    <div className={cn("p-2.5 rounded-xl", badge.bg)}>
      <Icon className={cn("h-5 w-5", badge.iconColor)} />
    </div>
  );
}

function ResultItem({ result }: { result: DbQuizResult }) {
  const t = useT();
  const badge = resultBadge(result);
  const correct = result.correctQuestions?.length ?? result.correctAnswers;
  const incorrect = result.incorrectQuestions?.length ?? 0;

  return (
    <StaggerItem className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.01] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
      <div className="pointer-events-none relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ResultBadgeIcon r={result} />
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t(badge.labelBn, badge.label)}
            </h4>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(dbResultDate(result))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              winColor(result.scoreInPercent)
            )}
          >
            {result.scoreInPercent}%
          </span>
          <span className="text-xs text-zinc-400">{t("স্কোর", "score")}</span>
        </div>
      </div>

      <div className="pointer-events-none relative mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t(
              `${result.questionCount}টি প্রশ্ন`,
              `${result.questionCount} question${result.questionCount !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">{correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-rose-500" />
          <span className="text-xs text-rose-600 dark:text-rose-400">{incorrect}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {result.timePerQuestion}
            {t(" সেকেন্ড / প্রশ্ন", "s / question")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {result.levels.map((lv) => (
            <span
              key={lv}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                LEVEL_COLORS[lv]
              )}
            >
              {lv}
            </span>
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function QuizPracticeResultsPanel() {
  const { status } = useAuthStatus();
  const [results, setResults] = useState<DbQuizResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoaded(false);
      if (status !== "google") {
        if (cancelled) return;
        setResults([]);
        setLoaded(true);
        return;
      }
      const data = await fetchQuizResultsFromDb();
      if (cancelled) return;
      setResults(data.filter(isGrammarOrClassResult));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const stats = useMemo(() => {
    const total = results.length;
    const avg =
      total > 0
        ? Math.round(
            results.reduce((acc, r) => acc + r.scoreInPercent, 0) / total
          )
        : 0;
    const best =
      total > 0 ? Math.max(...results.map((r) => r.scoreInPercent)) : 0;
    const totalQuestions = results.reduce((acc, r) => acc + r.questionCount, 0);
    return { total, totalQuestions, avg, best };
  }, [results]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <GraduationCap className="size-6 animate-pulse" />
      </div>
    );
  }

  const summary = [
    {
      icon: BookOpenCheck,
      label: t("নেওয়া কুইজ", "Quizzes Taken"),
      value: stats.total,
      tint: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      icon: BarChart3,
      label: t("গড় স্কোর", "Avg. Score"),
      value: `${stats.avg}%`,
      tint: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-100 dark:bg-sky-900/30",
    },
    {
      icon: Award,
      label: t("সেরা স্কোর", "Best Score"),
      value: `${stats.best}%`,
      tint: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        {t(
          `${stats.total}টি কুইজ · ${stats.totalQuestions}টি প্রশ্নের উত্তর দেওয়া হয়েছে`,
          `${stats.total} practice quiz${stats.total !== 1 ? "zes" : ""} · ${stats.totalQuestions} questions answered`
        )}
      </p>

      {stats.total > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <StaggerContainer className="contents">
              {summary.map((s) => {
                const Icon = s.icon;
                return (
                  <StaggerItem
                    key={s.label}
                    className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.02] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-xl", s.bg)}>
                        <Icon className={cn("h-5 w-5", s.tint)} />
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {s.label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {s.value}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <StaggerContainer className="contents">
              {results.map((result, idx) => (
                <ResultItem key={result.id ?? idx} result={result} />
              ))}
            </StaggerContainer>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
            {t(
              "এখনো কোনো গ্রামার বা শ্রেণি কুইজের ফলাফল নেই।",
              "No grammar or class quiz results yet."
            )}
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs">
            {t(
              "কুইজ পেজ থেকে একটি গ্রামার বা শ্রেণি ভিত্তিক কুইজ নিন, আপনার ফলাফল এখানে দেখা যাবে।",
              "Take a grammar or class quiz from the Quiz page and your results will appear here."
            )}
          </p>
        </div>
      )}
    </div>
  );
}