"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { ArrowLeft, Play, Sparkles } from "lucide-react";

const ALL_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface LevelHeroProps {
  level: string;
  label: string;
  labelBn: string;
  gradient?: string;
  text?: string;
  bg?: string;
  border?: string;
  solid?: string;
  stroke?: string;
  totalCount: number;
  categoryCount?: number;
  categoryLabel?: string;
  introEn?: string;
  introBn?: string;
  topics?: { en: string; bn: string }[];
  levelWordIds: number[];
}

export function LevelHero({
  level,
  label,
  labelBn,
  totalCount,
  levelWordIds,
}: LevelHeroProps) {
  const { learnedIds, loaded } = useLearnedWords();
  const t = useT();

  const learnedIdsSet = useMemo(() => new Set(levelWordIds), [levelWordIds]);
  const learned = useMemo(() => {
    if (!loaded) return 0;
    let count = 0;
    for (const id of learnedIds) {
      if (learnedIdsSet.has(Number(id))) count++;
    }
    return count;
  }, [learnedIds, learnedIdsSet, loaded]);

  const pct = totalCount > 0 ? Math.round((learned / totalCount) * 100) : 0;
  const remaining = Math.max(0, totalCount - learned);

  return (
    <section className="mx-auto max-w-4xl px-4 pt-4 pb-2 sm:px-6 lg:px-8">
      {/* 2. Minimal Mobile Card Widget */}
      <div className="mt-3 rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-xs dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-xl">
                {level} · {t(labelBn, label)}
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                CEFR
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#242423]/55 dark:text-zinc-400">
              {t(
                `মোট ${totalCount}টি শব্দ · ${learned}টি আয়ত্ত`,
                `${totalCount} words · ${learned} mastered`,
              )}
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/quiz/vocabulary?level=${level.toUpperCase()}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#242423] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
              title={t("কুইজ অনুশীলন", "Practice Quiz")}
            >
              <Play className="size-3 fill-current" />
              <span>{t("কুইজ", "Quiz")}</span>
            </Link>

            <Link
              href="/quiz/speed"
              className="hidden items-center gap-1 rounded-full border border-black/[0.06] bg-[#f1f1ef] px-3 py-1.5 text-xs font-semibold text-[#242423] transition-all hover:bg-[#eaeae8] active:scale-95 dark:border-white/[0.08] dark:bg-[#252528] dark:text-[#f3f3f2] xs:inline-flex"
              title={t("স্পিড টেস্ট", "Speed Test")}
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>{t("স্পিড", "Speed")}</span>
            </Link>
          </div>
        </div>

        {/* Minimal Progress Line */}
        <div className="mt-3">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="relative h-full rounded-full bg-[#242423] transition-all duration-500 ease-out dark:bg-white"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-[#242423]/45 dark:text-zinc-500">
            <span>
              {pct}% {t("সম্পন্ন", "completed")}
            </span>
            <span>
              {remaining} {t("বাকি", "remaining")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
