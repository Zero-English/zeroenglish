"use client";

import React from "react";
import Link from "next/link";
import { Check, Flame, Target } from "lucide-react";
import { useT } from "@/components/language-provider";
import { useDailyRoutine } from "@/lib/use-daily-routine";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-[24px] border border-[var(--hero-glass-border)] bg-[var(--hero-glass)] backdrop-blur-[8px] p-3.5 sm:p-4 shadow-[var(--hero-glass-shadow)]";

export function DailyRoutineSection({ className }: { className?: string }) {
  const t = useT();
  const { items, summary, streak, loaded } = useDailyRoutine();

  if (!loaded) return null;

  const enabledItems = items.filter((item) => item.enabled);
  if (enabledItems.length === 0) return null;

  return (
    <div className={cn(CARD, "space-y-3", className)}>
      {/* Minimal Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-[#f1f1ef] text-[#1c1c1e] dark:bg-[#252528] dark:text-[#f4f4f5]">
            <Target className="size-3.5" />
          </span>
          <h3 className="text-xs sm:text-[13px] font-bold text-[#1c1c1e] dark:text-[#f4f4f5] truncate">
            {t("দৈনিক রুটিন", "Daily Routine")}
          </h3>
          {streak > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 tabular-nums">
              <Flame className="size-3 fill-amber-500" />
              <span>{streak}d</span>
            </span>
          )}
        </div>

        <span className="rounded-full bg-[#f1f1ef] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#242423]/70 dark:bg-[#252528] dark:text-zinc-300 shrink-0">
          {summary.completedItems}/{summary.totalItems} {t("সম্পন্ন", "Done")}
        </span>
      </div>

      {/* Thin Shimmering Liquid Progress Bar */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
        <div
          className="relative h-full overflow-hidden rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${summary.percent}%` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            style={{ transform: "translateX(600%)" }}
          />
        </div>
      </div>

      {/* Minimal 4-Row Routine Checklist */}
      <div className="space-y-0.5 pt-0.5">
        {enabledItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex items-center justify-between gap-2 rounded-[12px] px-2.5 py-1.5 hover:bg-[#242423]/[0.03] dark:hover:bg-white/[0.04] transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                  item.completed
                    ? "bg-emerald-500 text-white"
                    : "border border-black/20 dark:border-white/25 text-transparent"
                )}
              >
                <Check className="size-2.5 stroke-[3]" />
              </span>

              <span className="truncate text-xs font-medium text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white">
                {t(item.labelBn, item.labelEn)}
              </span>
            </div>

            <span
              className={cn(
                "text-[11px] tabular-nums shrink-0 font-medium",
                item.completed
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-[#242423]/45 dark:text-zinc-500"
              )}
            >
              {Math.min(item.progress, item.target)}/{item.target}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
