"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ListChecks,
  Trophy,
  GraduationCap,
  BarChart3,
  Award,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useQuizExamHistoryStore, type QuizExamHistoryEntry } from "@/lib/quiz-exam-history-store";
import type { ExamModeValue } from "@/types/quiz-exam";
import {
  fetchQuizResultsFromDb,
  dbResultDate,
  type DbQuizResult,
} from "@/lib/quiz-results-api";
import { useT, useNum } from "@/components/language-provider";
import { useAuthStatus } from "@/lib/auth-store";

const EXAM_MODE_META: Record<
  string,
  { label: string; labelBn: string; icon: LucideIcon; tint: string; bg: string; gradient: string }
> = {
  PRACTICE: {
    label: "Practice Exam",
    labelBn: "প্র্যাকটিস পরীক্ষা",
    icon: GraduationCap,
    tint: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-400 to-blue-500",
  },
  WEEKLY: {
    label: "Weekly Exam",
    labelBn: "সাপ্তাহিক পরীক্ষা",
    icon: Trophy,
    tint: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    gradient: "from-emerald-400 to-teal-500",
  },
  BIWEEKLY: {
    label: "Biweekly Exam",
    labelBn: "দ্বি-সাপ্তাহিক পরীক্ষা",
    icon: ClipboardList,
    tint: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    gradient: "from-violet-400 to-purple-500",
  },
};

const EXAM_LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

const EXAM_STATUS_META: Record<
  NonNullable<QuizExamHistoryEntry["status"]>,
  { label: string; labelBn: string; classes: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    labelBn: "জমা দেওয়া হয়েছে",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  },
  LATE_SUBMITTED: {
    label: "Late",
    labelBn: "দেরিতে জমা",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  },
  ABANDONED: {
    label: "Abandoned",
    labelBn: "পরিত্যক্ত",
    classes: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
  },
  REATTEMPTED: {
    label: "Reattempted",
    labelBn: "পুনরায় প্রচেষ্টা",
    classes: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
  },
};

function dbExamToEntry(r: DbQuizResult): QuizExamHistoryEntry {
  return {
    id: `db-${r.id}`,
    examId: r.examId ?? 0,
    title: r.title,
    mode: (r.mode as ExamModeValue) || "PRACTICE",
    date: dbResultDate(r),
    win: `${r.scoreInPercent}%`,
    levels: r.levels,
    numberOfQuestions: r.questionCount,
    timePerQuestion: r.timePerQuestion,
    status: r.status,
    isFirstAttempt: r.isFirstAttempt,
  };
}

function winToNumber(entry: QuizExamHistoryEntry) {
  return parseInt(entry.win);
}

function winColor(win: number) {
  if (win >= 90) return "text-emerald-500";
  if (win >= 75) return "text-sky-500";
  if (win >= 60) return "text-amber-500";
  return "text-rose-500";
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ExamWinRing({ win }: { win: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - win / 100);
  const num = useNum();

  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", winColor(win))}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {num(win)}%
      </div>
    </div>
  );
}

function QuizExamHistoryItem({ entry }: { entry: QuizExamHistoryEntry }) {
  const meta = EXAM_MODE_META[entry.mode] ?? EXAM_MODE_META.PRACTICE;
  const Icon = meta.icon;
  const win = winToNumber(entry);
  const t = useT();
  const num = useNum();
  const statusMeta =
    entry.status && entry.status !== "SUBMITTED"
      ? EXAM_STATUS_META[entry.status]
      : null;

  return (
    <StaggerItem className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.01] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
      <div
        className={cn(
          "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b opacity-60",
          meta.gradient
        )}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", meta.bg)}>
            <Icon className={cn("h-5 w-5", meta.tint)} />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {entry.title}
            </h4>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
              <span className={cn("font-medium", meta.tint)}>
                {t(meta.labelBn, meta.label)}
              </span>
              {statusMeta && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusMeta.classes
                  )}
                >
                  {t(statusMeta.labelBn, statusMeta.label)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(entry.date)}
              </span>
            </p>
          </div>
        </div>
        <ExamWinRing win={win} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t(`${num(entry.numberOfQuestions)}টি প্রশ্ন`, `${entry.numberOfQuestions} Questions`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {num(entry.timePerQuestion)}
            {t(" সেকেন্ড / প্রশ্ন", "s / question")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.levels.map((lv) => (
            <span
              key={lv}
              className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", EXAM_LEVEL_COLORS[lv])}
            >
              {lv}
            </span>
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function QuizExamHistoryPanel() {
  const localEntries = useQuizExamHistoryStore((s) => s.entries);
  const { status } = useAuthStatus();
  const [dbEntries, setDbEntries] = useState<QuizExamHistoryEntry[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  const t = useT();
  const num = useNum();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (status !== "google") {
        if (cancelled) return;
        setDbEntries([]);
        setDbLoaded(true);
        return;
      }
      setDbLoaded(false);
      const results = await fetchQuizResultsFromDb();
      if (cancelled) return;
      setDbEntries(
        results.filter((r) => r.examId != null).map(dbExamToEntry)
      );
      setDbLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const entries = useMemo(() => {
    const seen = new Set<string>();
    const combined: QuizExamHistoryEntry[] = [];
    for (const e of dbEntries) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      combined.push(e);
    }
    for (const e of localEntries) {
      if (e.dbId != null) continue;
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      combined.push(e);
    }
    return combined.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [dbEntries, localEntries]);

  const stats = useMemo(() => {
    const completed = entries.filter((e) => e.status !== "ABANDONED");
    const total = completed.length;
    const totalQuestions = completed.reduce((acc, e) => acc + e.numberOfQuestions, 0);
    const avg =
      total > 0 ? Math.round(completed.reduce((acc, e) => acc + winToNumber(e), 0) / total) : 0;
    const best = total > 0 ? Math.max(...completed.map(winToNumber)) : 0;
    return { total, totalQuestions, avg, best };
  }, [entries]);

  const summary = [
    { icon: ClipboardList, label: t("নেওয়া পরীক্ষা", "Exams Taken"), value: num(stats.total), tint: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
    { icon: BarChart3, label: t("গড় স্কোর", "Avg. Score"), value: `${num(stats.avg)}%`, tint: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
    { icon: Award, label: t("সেরা স্কোর", "Best Score"), value: `${num(stats.best)}%`, tint: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ];

  if (!dbLoaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <ClipboardList className="size-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        {t(
          `${num(stats.total)}টি পরীক্ষা · ${num(stats.totalQuestions)}টি প্রশ্নের উত্তর দেওয়া হয়েছে`,
          `${stats.total} exam${stats.total !== 1 ? "s" : ""} · ${stats.totalQuestions} questions answered`
        )}
      </p>

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
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</span>
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <StaggerContainer className="contents">
            {entries.map((entry, idx) => (
              <QuizExamHistoryItem
                key={entry.id ?? `exm-${entry.examId}-${entry.date}-${idx}`}
                entry={entry}
              />
            ))}
          </StaggerContainer>
        </div>
      ) : (
        <div className="text-center py-20">
          <Trophy className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
            {t("এখনো কোনো পরীক্ষার ফলাফল নেই।", "No exam results yet.")}
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs">
            {t(
              "কুইজ পেজ থেকে একটি নির্ধারিত পরীক্ষা নিন, আপনার ফলাফল এখানে দেখা যাবে।",
              "Take a scheduled exam from the Quiz page and your results will appear here."
            )}
          </p>
        </div>
      )}
    </div>
  );
}