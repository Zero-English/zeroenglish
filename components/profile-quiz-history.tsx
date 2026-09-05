"use client";

import { useMemo } from "react";
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
  BarChart3,
  Award,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

export const quizHistory = [
  {
    quizType: "english_to_bangla",
    date: "2026-09-05",
    win: "85%",
    levels: ["A1", "B1", "B2", "C1", "C2"],
    numberOfQuestions: 20,
    timePerQuestion: 10,
  },
  {
    quizType: "bangla_to_english",
    date: "2026-09-04",
    win: "72%",
    levels: ["A1", "A2", "B1", "B2"],
    numberOfQuestions: 15,
    timePerQuestion: 12,
  },
  {
    quizType: "synonym",
    date: "2026-09-03",
    win: "90%",
    levels: ["A1", "A2", "B1", "B2", "C2"],
    numberOfQuestions: 25,
    timePerQuestion: 8,
  },
  {
    quizType: "antonym",
    date: "2026-09-02",
    win: "68%",
    levels: [ "A2", "B1", "B2", "C1", "C2"],
    numberOfQuestions: 20,
    timePerQuestion: 10,
  },
  {
    quizType: "english_to_bangla",
    date: "2026-09-01",
    win: "94%",
    levels: ["A1", "A2", "B1", "C1", "C2"],
    numberOfQuestions: 30,
    timePerQuestion: 7,
  },
  {
    quizType: "synonym",
    date: "2026-08-31",
    win: "80%",
    levels: ["A1", "A2", "B1", "C2"],
    numberOfQuestions: 10,
    timePerQuestion: 15,
  },
];

type QuizType = (typeof quizHistory)[number]["quizType"];

const QUIZ_META: Record<
  QuizType,
  { label: string; icon: LucideIcon; iconColor: string; bg: string; gradient: string }
> = {
  english_to_bangla: {
    label: "English → Bangla",
    icon: Languages,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-400 to-sky-500",
  },
  bangla_to_english: {
    label: "Bangla → English",
    icon: ArrowLeftRight,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-400 to-indigo-500",
  },
  synonym: {
    label: "Synonyms",
    icon: Shuffle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    gradient: "from-emerald-400 to-teal-500",
  },
  antonym: {
    label: "Antonyms",
    icon: Layers,
    iconColor: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    gradient: "from-rose-400 to-pink-500",
  },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

function winToNumber(entry: (typeof quizHistory)[number]) {
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

function WinRing({ win }: { win: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - win / 100);

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
        {win}%
      </div>
    </div>
  );
}

function QuizHistoryItem({ entry }: { entry: (typeof quizHistory)[number] }) {
  const meta = QUIZ_META[entry.quizType];
  const Icon = meta.icon;
  const win = winToNumber(entry);

  return (
    <StaggerItem className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.01] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
      <div
        className={cn(
          "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b opacity-60",
          meta.gradient
        )}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", meta.bg)}>
            <Icon className={cn("h-5 w-5", meta.iconColor)} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {meta.label}
            </h4>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(entry.date)}
            </p>
          </div>
        </div>
        <WinRing win={win} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {entry.numberOfQuestions} Questions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {entry.timePerQuestion}s / question
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.levels.map((lv) => (
            <span
              key={lv}
              className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", LEVEL_COLORS[lv])}
            >
              {lv}
            </span>
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function QuizHistoryPanel() {
  const stats = useMemo(() => {
    const total = quizHistory.length;
    const totalQuestions = quizHistory.reduce((acc, e) => acc + e.numberOfQuestions, 0);
    const avg = total > 0 ? Math.round(quizHistory.reduce((acc, e) => acc + winToNumber(e), 0) / total) : 0;
    const best = total > 0 ? Math.max(...quizHistory.map(winToNumber)) : 0;
    return { total, totalQuestions, avg, best };
  }, []);

  const summary = [
    { icon: GraduationCap, label: "Quizzes Taken", value: String(stats.total), tint: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { icon: BarChart3, label: "Avg. Win Rate", value: `${stats.avg}%`, tint: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
    { icon: Award, label: "Best Score", value: `${stats.best}%`, tint: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ];

  return (
    <div>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        {stats.total} quiz{stats.total !== 1 ? "zes" : ""} · {stats.totalQuestions} questions answered
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

      <div className="grid grid-cols-1 gap-4">
        <StaggerContainer className="contents">
          {quizHistory.map((entry) => (
            <QuizHistoryItem key={`${entry.quizType}-${entry.date}`} entry={entry} />
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}