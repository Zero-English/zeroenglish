"use client";

import { useState } from "react";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { cn } from "@/lib/utils";
import { Flame, Target, ChevronUp, ChevronDown, BookOpen, CheckCircle2 } from "lucide-react";
import { useT } from "@/components/language-provider";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 50];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(count: number): string {
  if (count === 0) return "bg-muted";
  if (count <= 2) return "bg-emerald-300 dark:bg-emerald-900/80";
  if (count <= 5) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 10) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

export function DailyGoalCard() {
  const { dailyGoal, setDailyGoal, todayLearned, streak, contributionData, loaded } = useDailyGoal();
  const [showPicker, setShowPicker] = useState(false);
  const t = useT();

  if (!loaded) return null;

  const progress = Math.min(todayLearned / dailyGoal, 1);
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - progress);

  const today = new Date();
  const currentYear = today.getFullYear();

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDate = new Date(contributionData[0]?.date);
  const startDay = firstDate.getDay();

  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ date: "", count: -1 });
  }

  for (const item of contributionData) {
    currentWeek.push(item);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const firstItem = weeks[w].find((d) => d.date);
    if (firstItem) {
      const m = new Date(firstItem.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTHS[m], col: w });
        lastMonth = m;
      }
    }
  }

  return (
    <div className={cn(CARD, "p-4 sm:p-6 w-full min-w-0 flex flex-col justify-between h-full")}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <Target className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                {t("দৈনিক লক্ষ্য", "Daily Goal")}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                {t("প্রতিদিন কয়টা শব্দ শিখবেন", "Daily target words")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-muted text-foreground border border-border/80 shadow-2xs">
                <Flame className="h-3.5 w-3.5 fill-primary text-primary" />
                <span>{t(`${streak} দিনের ধারা`, `${streak}d streak`)}</span>
              </div>
            )}
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
              title={t("লক্ষ্য পরিবর্তন", "Change goal")}
            >
              {showPicker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Circular Progress & Status */}
        <div className="flex items-center gap-3.5 sm:gap-5 mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/60">
          <div className="relative flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20">
            <svg width="64" height="64" viewBox="0 0 80 80" className="-rotate-90 sm:w-20 sm:h-20">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="5"
                className="stroke-muted"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-700 ease-out",
                  progress >= 1 ? "stroke-emerald-500" : "stroke-primary"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg font-bold tabular-nums text-foreground">
                {todayLearned}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">/ {dailyGoal}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {progress >= 1 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  {t("লক্ষ্য পূরণ!", "Completed!")}
                </span>
              ) : (
                <span className="text-xs font-semibold text-foreground">
                  {t("আজকের লক্ষ্য", "Today's Target")}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 truncate sm:whitespace-normal">
              {progress >= 1
                ? t("দারুণ! আজকের লক্ষ্য সম্পন্ন।", "Target reached!")
                : t(
                    `আর মাত্র ${dailyGoal - todayLearned}টি শব্দ বাকি`,
                    `${dailyGoal - todayLearned} words left`
                  )}
            </p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress >= 1 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Goal Picker Pills */}
        {showPicker && (
          <div className="mb-4 sm:mb-5 p-3 rounded-xl bg-muted/60 border border-border/80 transition-all">
            <span className="text-xs font-semibold text-foreground block mb-2">
              {t("দৈনিক লক্ষ্য নির্ধারণ করুন:", "Select target words per day:")}
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {GOAL_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setDailyGoal(n)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                    dailyGoal === n
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                      : "border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {n} {t("টি", "w")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contribution Heatmap */}
      <div className="border-t border-border/60 pt-3 sm:pt-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] sm:text-xs font-semibold text-foreground">
              {t(`${currentYear} অ্যাক্টিভিটি`, `${currentYear} Activity`)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{t("কম", "Less")}</span>
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-xs bg-muted" />
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-900/80" />
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
            <span>{t("বেশি", "More")}</span>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden w-full">
          <div className="inline-flex flex-col min-w-full">
            <div className="relative h-4 ml-7">
              {monthLabels.map((m, idx) => {
                const nextCol = monthLabels[idx + 1]?.col ?? weeks.length;
                return (
                  <div
                    key={`${m.label}-${m.col}`}
                    className="absolute text-[9px] sm:text-[10px] font-medium text-muted-foreground top-0"
                    style={{
                      left: `${m.col * 14}px`,
                      width: `${(nextCol - m.col) * 14 - 2}px`,
                    }}
                  >
                    {m.label}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[2px]">
              <div className="flex flex-col gap-[2px] mr-[3px]">
                {DAY_LABELS.map((l, i) => (
                  <div key={i} className="h-3 text-[9px] font-medium text-muted-foreground leading-3">
                    {l}
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={cn(
                        "h-3 w-3 rounded-xs transition-colors shrink-0",
                        day.count === -1 ? "bg-transparent" : getIntensity(day.count)
                      )}
                      title={
                        day.date
                          ? `${day.date}: ${t(`${day.count}টি শব্দ`, `${day.count} word${day.count !== 1 ? "s" : ""}`)}`
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
