"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Languages,
  Layers,
  ArrowLeftRight,
  Shuffle,
  ListChecks,
  Trophy,
  GraduationCap,
  CheckCircle2,
  XCircle,
  BarChart3,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import { useAuthStatus } from "@/lib/auth-store";
import {
  fetchCombinedExamResults,
  combinedExamResultDate,
  type DbCombinedExamResult,
} from "@/lib/vocabulary-exam-results-api";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const QUIZ_TYPE_META: Record<
  string,
  { label: string; labelBn: string; icon: LucideIcon; iconColor: string; bg: string; gradient: string }
> = {
  ENGLISH_TO_BANGLA: {
    label: "English to Bangla",
    labelBn: "ইংরেজি থেকে বাংলা",
    icon: Languages,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    gradient: "from-sky-500 to-blue-500",
  },
  BANGLA_TO_ENGLISH: {
    label: "Bangla to English",
    labelBn: "বাংলা থেকে ইংরেজি",
    icon: ArrowLeftRight,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    gradient: "from-indigo-500 to-purple-500",
  },
  SYNONYMS: {
    label: "Synonyms",
    labelBn: "সমার্থক শব্দ",
    icon: Shuffle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    gradient: "from-emerald-500 to-teal-500",
  },
  ANTONYMS: {
    label: "Antonyms",
    labelBn: "বিপরীত শব্দ",
    icon: Layers,
    iconColor: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
  },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-500/20",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/20",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-500/20",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 border-fuchsia-500/20",
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

function totalWordCount(r: DbCombinedExamResult) {
  return r.correctWords.length + r.incorrectWords.length;
}

function QuizTypeBadge({ r }: { r: DbCombinedExamResult }) {
  const dbType = r.quizType?.name ?? "";
  const meta = QUIZ_TYPE_META[dbType] ?? {
    label: "Vocabulary Quiz",
    labelBn: "শব্দ কুইজ",
    icon: GraduationCap,
    iconColor: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-black/[0.04] dark:bg-white/[0.06]",
    gradient: "from-zinc-500 to-zinc-600",
  };
  const Icon = meta.icon;
  return (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]", meta.bg, meta.iconColor)}>
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}

function QuizTypeLabel({ r }: { r: DbCombinedExamResult }) {
  const t = useT();
  const dbType = r.quizType?.name ?? "";
  const meta = QUIZ_TYPE_META[dbType];
  if (!meta) {
    return <span>{t("শব্দ কুইজ", "Vocabulary Quiz")}</span>;
  }
  return <span>{t(meta.labelBn, meta.label)}</span>;
}

function ResultItem({ result }: { result: DbCombinedExamResult }) {
  const t = useT();
  const total = totalWordCount(result);
  const correct = result.correctWords.length;
  const incorrect = result.incorrectWords.length;

  return (
    <StaggerItem className="group relative overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] p-3.5 sm:p-4 transition-all duration-150">
      <Link
        href={`/profile/vocabulary-exam-results/${result.id}`}
        className="absolute inset-0 z-0"
        aria-label={t(
          `ফলাফল #${result.id} দেখুন`,
          `View result #${result.id}`
        )}
      />
      <div className="pointer-events-none relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <QuizTypeBadge r={result} />
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              <QuizTypeLabel r={result} />
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <CalendarDays className="h-3 w-3" />
              {formatDate(combinedExamResultDate(result))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] px-2.5 py-0.5">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span
            className={cn(
              "text-xs font-bold tabular-nums",
              winColor(result.scoreInPercent)
            )}
          >
            {result.scoreInPercent}%
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.04] dark:border-white/[0.06] pt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-zinc-400" />
          <span className="tabular-nums">
            {t(`${total}টি শব্দ`, `${total} words`)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="tabular-nums">{correct}</span>
        </div>
        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
          <XCircle className="h-3.5 w-3.5" />
          <span className="tabular-nums">{incorrect}</span>
        </div>
        {result.quizType?.name !== "SYNONYMS" &&
          result.quizType?.name !== "ANTONYMS" && (
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="tabular-nums">
                {result.timePerWord}s / {t("শব্দ", "word")}
              </span>
            </div>
          )}
        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {result.levels.map((lv) => (
            <span
              key={lv}
              className={cn(
                "rounded-md px-1.5 py-0.2 text-[10px] font-semibold border",
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

export function CombinedExamResultsPanel() {
  const { status } = useAuthStatus();
  const [results, setResults] = useState<DbCombinedExamResult[]>([]);
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
      const data = await fetchCombinedExamResults();
      if (cancelled) return;
      setResults(data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const stats = useMemo(() => {
    const total = results.length;
    const totalWords = results.reduce((acc, r) => acc + totalWordCount(r), 0);
    const avg =
      total > 0
        ? Math.round(
            results.reduce((acc, r) => acc + r.scoreInPercent, 0) / total
          )
        : 0;
    const best =
      total > 0 ? Math.max(...results.map((r) => r.scoreInPercent)) : 0;
    return { total, totalWords, avg, best };
  }, [results]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-400">
        <GraduationCap className="size-6 animate-pulse" />
      </div>
    );
  }

  const summary = [
    {
      icon: GraduationCap,
      label: t("নেওয়া কুইজ", "Quizzes Taken"),
      value: stats.total,
      tint: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      icon: BarChart3,
      label: t("গড় স্কোর", "Avg. Score"),
      value: `${stats.avg}%`,
      tint: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Award,
      label: t("সেরা স্কোর", "Best Score"),
      value: `${stats.best}%`,
      tint: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t(
            `${stats.total}টি কুইজ · ${stats.totalWords}টি শব্দের উত্তর দেওয়া হয়েছে`,
            `${stats.total} practice quizzes · ${stats.totalWords} words answered`
          )}
        </p>
      </div>

      {stats.total > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <StaggerContainer className="contents">
              {summary.map((s) => {
                const Icon = s.icon;
                return (
                  <StaggerItem
                    key={s.label}
                    className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 sm:p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg, s.tint)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                        {s.label}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {s.value}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            <StaggerContainer className="contents">
              {results.map((result, idx) => (
                <ResultItem key={result.id ?? idx} result={result} />
              ))}
            </StaggerContainer>
          </div>
        </>
      ) : (
        <div className="text-center py-12 space-y-2">
          <Trophy className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t(
              "এখনো কোনো শব্দ কুইজের ফলাফল নেই।",
              "No vocabulary quiz results yet."
            )}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">
            {t(
              "কুইজ পেজ থেকে একটি প্র্যাকটিস কুইজ নিন, আপনার শব্দভিত্তিক ফলাফল এখানে দেখা যাবে।",
              "Take a practice quiz from the Quiz page and your word-level results will appear here."
            )}
          </p>
          <div className="pt-2">
            <Link
              href="/quiz/vocabulary"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3.5 py-1.5 shadow-sm transition-colors"
            >
              {t("শব্দ কুইজ শুরু করুন", "Start Vocabulary Quiz")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}