"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  GraduationCap,
  Loader2,
  Minus,
  PenLine,
  Plus,
  Settings2,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useDailyRoutine } from "@/lib/use-daily-routine";
import {
  ROUTINE_TARGET_LIMITS,
  type DailyRoutineItem,
  type RoutineActivityKey,
  type RoutineTargets,
} from "@/lib/daily-routine";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const TARGET_STEP: Record<RoutineActivityKey, number> = {
  words: 5,
  quizQuestions: 5,
  grammarRules: 1,
  dailyPractice: 1,
};

function parseDateKey(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function getIntensity(count: number, maxItems: number): string {
  if (count <= 0) return "bg-muted";
  const ratio = count / Math.max(1, maxItems);
  if (ratio <= 0.25) return "bg-emerald-300 dark:bg-emerald-900/80";
  if (ratio <= 0.5) return "bg-emerald-400 dark:bg-emerald-700";
  if (ratio <= 0.75) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

function ActivityIcon({
  activityKey,
  className,
}: {
  activityKey: RoutineActivityKey;
  className?: string;
}) {
  if (activityKey === "words") return <BookOpen className={className} />;
  if (activityKey === "quizQuestions")
    return <GraduationCap className={className} />;
  if (activityKey === "grammarRules") return <PenLine className={className} />;
  return <Zap className={className} />;
}

function unitLabel(item: DailyRoutineItem, lang: "en" | "bn"): string {
  if (item.key === "dailyPractice") {
    return lang === "bn" ? "সেশন" : "session";
  }
  return lang === "bn" ? item.unitBn : item.unitEn;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

export function DailyRoutineCard() {
  const { lang, t } = useLanguage();
  const {
    targets,
    items,
    summary,
    streak,
    history,
    loaded,
    saving,
    error,
    updateTargets,
  } = useDailyRoutine();

  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<RoutineTargets>(targets);

  if (!loaded) return null;

  const enabledItems = items.filter((item) => item.enabled);
  const progress =
    summary.totalItems > 0 ? summary.completedItems / summary.totalItems : 0;
  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - progress);
  const remaining = Math.max(0, summary.totalItems - summary.completedItems);

  const currentYear = new Date().getFullYear();

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDate = history[0]?.date ? parseDateKey(history[0].date) : null;
  const startDay = firstDate ? firstDate.getDay() : 0;

  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ date: "", count: -1 });
  }

  for (const item of history) {
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
    const firstItem = weeks[w].find((day) => day.date);
    if (firstItem) {
      const month = parseDateKey(firstItem.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], col: w });
        lastMonth = month;
      }
    }
  }

  const openSettings = () => {
    setDraft(targets);
    setShowSettings(true);
  };

  const adjustDraft = (key: RoutineActivityKey, delta: number) => {
    const limits = ROUTINE_TARGET_LIMITS[key];
    setDraft((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        target: Math.min(
          limits.max,
          Math.max(limits.min, previous[key].target + delta)
        ),
      },
    }));
  };

  const saveSettings = async () => {
    const saved = await updateTargets(draft);
    if (saved) setShowSettings(false);
  };

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
                {t("দৈনিক রুটিন", "Daily Routine")}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                {t("আপনার ব্যক্তিগত দৈনিক পরিকল্পনা", "Your personal daily plan")}
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
              type="button"
              onClick={() =>
                showSettings ? setShowSettings(false) : openSettings()
              }
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
              title={t("রুটিন সাজান", "Customize routine")}
              aria-label={t("রুটিন সাজান", "Customize routine")}
            >
              {showSettings ? (
                <X className="h-4 w-4" />
              ) : (
                <Settings2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Overall progress */}
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
                {summary.completedItems}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                / {summary.totalItems}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {summary.allCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  {t("রুটিন সম্পন্ন!", "Routine complete!")}
                </span>
              ) : (
                <span className="text-xs font-semibold text-foreground">
                  {t("আজকের রুটিন", "Today's routine")}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 truncate sm:whitespace-normal">
              {summary.totalItems === 0
                ? t(
                    "ট্র্যাকিং শুরু করতে অন্তত একটি আইটেম চালু করুন।",
                    "Enable at least one item to start tracking."
                  )
                : summary.allCompleted
                  ? t("দারুণ! আজকের সব রুটিন সম্পন্ন।", "Great! You finished today's routine.")
                  : t(
                      `আজ আর ${remaining}টি আইটেম বাকি`,
                      `${remaining} item${remaining !== 1 ? "s" : ""} left today`
                    )}
            </p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress >= 1 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${summary.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="mb-4 sm:mb-5 p-3 rounded-xl bg-muted/60 border border-border/80 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  {t("রুটিন সাজান", "Customize routine")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t("কোন আইটেম কতটা করবেন", "Choose what counts each day")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item) => {
                const config = draft[item.key];
                const limits = ROUTINE_TARGET_LIMITS[item.key];
                return (
                  <div
                    key={item.key}
                    className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <ActivityIcon
                        activityKey={item.key}
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      />
                      <span className="flex-1 text-[11px] sm:text-xs font-medium text-foreground truncate">
                        {t(item.labelBn, item.labelEn)}
                      </span>
                      <Toggle
                        checked={config.enabled}
                        label={t(item.labelBn, item.labelEn)}
                        onChange={(enabled) =>
                          setDraft((previous) => ({
                            ...previous,
                            [item.key]: { ...previous[item.key], enabled },
                          }))
                        }
                      />
                    </div>

                    {config.enabled && (
                      <div className="mt-1.5 flex items-center justify-between gap-2 pl-5">
                        <span className="text-[10px] text-muted-foreground">
                          {t("দৈনিক লক্ষ্য", "Daily target")}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              adjustDraft(item.key, -TARGET_STEP[item.key])
                            }
                            disabled={config.target <= limits.min}
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md border border-border/80 transition-colors",
                              config.target <= limits.min
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted cursor-pointer"
                            )}
                            aria-label={t("কমান", "Decrease target")}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold tabular-nums text-foreground">
                            {config.target}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              adjustDraft(item.key, TARGET_STEP[item.key])
                            }
                            disabled={config.target >= limits.max}
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md border border-border/80 transition-colors",
                              config.target >= limits.max
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted cursor-pointer"
                            )}
                            aria-label={t("বাড়ান", "Increase target")}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="w-12 text-[10px] text-muted-foreground">
                            {unitLabel(item, lang)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="mt-2 text-[10px] font-medium text-red-500">{error}</p>
            )}

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t("বাতিল", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-2xs transition-colors",
                  saving
                    ? "opacity-70 cursor-wait"
                    : "hover:bg-primary/90 cursor-pointer"
                )}
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                {t("সংরক্ষণ", "Save")}
              </button>
            </div>
          </div>
        )}

        {/* Routine items */}
        {enabledItems.length > 0 ? (
          <div className="space-y-0.5 mb-1">
            {enabledItems.map((item) => {
              const percent = Math.min(
                100,
                Math.round((item.progress / item.target) * 100)
              );
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 -mx-0.5 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      item.completed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <ActivityIcon
                        activityKey={item.key}
                        className="h-3.5 w-3.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] sm:text-xs font-semibold text-foreground truncate">
                        {t(item.labelBn, item.labelEn)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-[11px] tabular-nums shrink-0",
                          item.completed
                            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {Math.min(item.progress, item.target)} / {item.target}{" "}
                        {unitLabel(item, lang)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.completed ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground mb-1">
            {t(
              "কোনো রুটিন আইটেম চালু নেই। উপরের সেটিংস থেকে চালু করুন।",
              "No routine items enabled. Turn some on in settings."
            )}
          </p>
        )}
      </div>

      {/* Contribution Heatmap */}
      <div className="border-t border-border/60 pt-3 sm:pt-4 mt-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] sm:text-xs font-semibold text-foreground">
              {t(`${currentYear} রুটিন অ্যাক্টিভিটি`, `${currentYear} Routine Activity`)}
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
              {monthLabels.map((month, index) => {
                const nextCol = monthLabels[index + 1]?.col ?? weeks.length;
                return (
                  <div
                    key={`${month.label}-${month.col}`}
                    className="absolute text-[9px] sm:text-[10px] font-medium text-muted-foreground top-0"
                    style={{
                      left: `${month.col * 14}px`,
                      width: `${(nextCol - month.col) * 14 - 2}px`,
                    }}
                  >
                    {month.label}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[2px]">
              <div className="flex flex-col gap-[2px] mr-[3px]">
                {DAY_LABELS.map((label, index) => (
                  <div
                    key={index}
                    className="h-3 text-[9px] font-medium text-muted-foreground leading-3"
                  >
                    {label}
                  </div>
                ))}
              </div>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        "h-3 w-3 rounded-xs transition-colors shrink-0",
                        day.count === -1
                          ? "bg-transparent"
                          : getIntensity(day.count, summary.totalItems)
                      )}
                      title={
                        day.date
                          ? `${day.date}: ${t(
                              `${day.count}টি রুটিন আইটেম`,
                              `${day.count} routine item${day.count !== 1 ? "s" : ""}`
                            )}`
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
