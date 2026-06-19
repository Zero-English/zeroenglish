"use client";

import { useState } from "react";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { cn } from "@/lib/utils";
import { Flame, Target, ChevronUp, ChevronDown, BookOpen } from "lucide-react";

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 50];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(count: number): string {
  if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50";
  if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900/60";
  if (count <= 5) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 10) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

export function DailyGoalCard() {
  const { dailyGoal, setDailyGoal, todayLearned, streak, contributionData, loaded, refresh } = useDailyGoal();
  const [showPicker, setShowPicker] = useState(false);

  if (!loaded) return null;

  const progress = Math.min(todayLearned / dailyGoal, 1);
  const circumference = 2 * Math.PI * 36;
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
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Daily Goal
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-500">
              <Flame className="h-4 w-4" />
              {streak} day{streak > 1 ? "s" : ""}
            </div>
          )}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPicker ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="6"
              className="text-zinc-200 dark:text-zinc-800" />
            <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-700 ease-out",
                progress >= 1
                  ? "text-emerald-500"
                  : "text-orange-400"
              )} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{todayLearned}</span>
            <span className="text-[10px] text-zinc-400">/ {dailyGoal}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            {progress >= 1
              ? "Goal completed! Great job!"
              : `${dailyGoal - todayLearned} more word${dailyGoal - todayLearned > 1 ? "s" : ""} to reach today's goal`}
          </p>
          <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress >= 1
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-orange-400 to-amber-400"
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {showPicker && (
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="text-xs text-zinc-400 self-center mr-1">Set goal:</span>
          {GOAL_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setDailyGoal(n)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                dailyGoal === n
                  ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {currentYear}
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex flex-col">
            <div className="relative h-4 ml-8">
              {monthLabels.map((m, idx) => {
                const nextCol = monthLabels[idx + 1]?.col ?? weeks.length;
                return (
                  <div
                    key={`${m.label}-${m.col}`}
                    className="absolute text-[10px] text-zinc-400 top-0"
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
              <div className="flex flex-col gap-[2px] mr-[2px]">
                {DAY_LABELS.map((l, i) => (
                  <div key={i} className="h-3 text-[10px] text-zinc-400 leading-3">
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
                        "h-3 w-3 rounded-sm",
                        day.count === -1 ? "bg-transparent" : getIntensity(day.count)
                      )}
                      title={day.date ? `${day.date}: ${day.count} word${day.count !== 1 ? "s" : ""}` : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[10px] text-zinc-400">Less</span>
          <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
          <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
          <span className="text-[10px] text-zinc-400">More</span>
        </div>
      </div>
    </div>
  );
}
