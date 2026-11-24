"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { mainCategoryLabel } from "@/lib/category";
import { getLevelMeta, isLevelLive } from "@/lib/level-copy";
import type { Word, LevelPageSort } from "@/lib/data";
import { LevelHero } from "@/components/level-hero";
import { LevelWordsClient } from "@/components/level-words-client";
import { useT } from "@/components/language-provider";
import { ArrowLeft, Compass, Construction, BookOpen } from "lucide-react";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface LevelConfig {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
  readonly gradient: string;
  readonly label: string;
  readonly labelBn: string;
  readonly solid: string;
  readonly stroke: string;
}

const levelConfig: Record<(typeof VALID_LEVELS)[number], LevelConfig> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    solid: "bg-emerald-500",
    stroke: "stroke-emerald-500",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    solid: "bg-sky-500",
    stroke: "stroke-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
    solid: "bg-amber-500",
    stroke: "stroke-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    solid: "bg-rose-500",
    stroke: "stroke-rose-500",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
    solid: "bg-violet-500",
    stroke: "stroke-violet-500",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
    solid: "bg-fuchsia-500",
    stroke: "stroke-fuchsia-500",
  },
};

export interface LevelPageContentProps {
  level: string;
  pageNum?: number;
  serverMode?: boolean;
  urlPage?: number | null;
  initialWords?: Word[];
  initialTotal?: number;
  levelTotal?: number;
  initialTotalPages?: number;
  initialCategories?: string[];
  initialCategoryCount?: number;
  initialCategoryLabel?: string;
  initialWordIds?: number[];
  search?: string;
  sort?: LevelPageSort;
  category?: string;
  wordType?: string;
  status?: string;
}

type HeroStats = Pick<
  ComponentProps<typeof LevelHero>,
  | "totalCount"
  | "categoryCount"
  | "categoryLabel"
  | "introEn"
  | "introBn"
  | "topics"
  | "levelWordIds"
>;

function NotFoundScreen() {
  const t = useT();
  return (
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[28px] sm:rounded-[32px] border border-black/[0.06] bg-white p-7 sm:p-9 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e]">
        <div className="size-14 mx-auto mb-4 rounded-[20px] bg-[#f1f1ef] dark:bg-[#252528] flex items-center justify-center text-[#242423] dark:text-[#f3f3f2]">
          <Compass className="size-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2] mb-2">
          {t("লেভেলটি খুঁজে পাওয়া যায়নি", "Level not found")}
        </h1>
        <p className="text-sm text-[#242423]/60 dark:text-zinc-400 mb-6 leading-relaxed">
          {t(
            "আপনি যে লেভেলটি খুঁজছেন সেটি বিদ্যমান নেই। দয়া করে সঠিক CEFR লেভেল নির্বাচন করুন।",
            "The level you're looking for doesn't exist. Please select a valid CEFR level.",
          )}
        </p>
        <Link
          href="/vocabulary"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#242423] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
        >
          <ArrowLeft className="size-4" />
          <span>{t("সব লেভেল দেখুন", "Browse all levels")}</span>
        </Link>
      </div>
    </div>
  );
}

function LevelInProgressScreen({
  level,
  labelBn,
  label,
  total,
}: {
  level: string;
  labelBn: string;
  label: string;
  total: number;
}) {
  const t = useT();
  const prevLevel =
    VALID_LEVELS[
      Math.max(0, VALID_LEVELS.indexOf(level as (typeof VALID_LEVELS)[number]) - 1)
    ] ?? "A1";

  return (
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-[28px] sm:rounded-[32px] border border-black/[0.06] bg-white p-7 sm:p-9 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e]">
        <div className="size-14 mx-auto mb-4 rounded-[20px] bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
          <Construction className="size-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2] mb-2">
          {t(
            `${level} · ${labelBn} লিস্ট তৈরি হচ্ছে`,
            `${level} · ${label} list is being built`,
          )}
        </h1>
        <p className="text-sm text-[#242423]/70 dark:text-zinc-300 mb-3 leading-relaxed">
          {t(
            `এই লেভেলে এখন ${total}টি শব্দ আছে। পর্যাপ্ত শব্দ যোগ হওয়ার পরেই এটি উন্মুক্ত করা হবে।`,
            `This level has ${total} entries so far. It will be unlocked once a comprehensive word list is verified.`,
          )}
        </p>
        <p className="text-xs text-[#242423]/50 dark:text-zinc-500 mb-6">
          {t(
            "ততক্ষণ আগের লেভেলগুলোতে অনুশীলন চালিয়ে যান।",
            "In the meantime, continue practicing with the earlier levels.",
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href={`/vocabulary/${prevLevel.toLowerCase()}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#242423] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <ArrowLeft className="size-4" />
            <span>{t(`${prevLevel} লেভেলে যান`, `Go to ${prevLevel}`)}</span>
          </Link>
          <Link
            href="/vocabulary"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#242423]/[0.05] px-5 py-2 text-sm font-semibold text-[#242423] transition-all hover:bg-[#242423]/[0.08] active:scale-95 dark:bg-white/[0.08] dark:text-[#f3f3f2]"
          >
            <BookOpen className="size-4" />
            <span>{t("সব লেভেল", "All levels")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LevelPageFrame({
  config,
  level,
  stats,
  children,
}: {
  config: LevelConfig;
  level: string;
  stats: HeroStats;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#f8f8f6] text-[#242423] transition-colors duration-200 dark:bg-[#0c0c0e] dark:text-[#f3f3f2]">
      <LevelHero
        level={level}
        label={config.label}
        labelBn={config.labelBn}
        gradient={config.gradient}
        text={config.text}
        bg={config.bg}
        border={config.border}
        solid={config.solid}
        stroke={config.stroke}
        {...stats}
      />

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function LevelPageContent({
  level,
  pageNum = 1,
  initialWords = [],
  initialTotal,
  levelTotal,
  initialTotalPages,
  initialCategories,
  initialCategoryCount,
  initialCategoryLabel,
  initialWordIds,
  search = "",
  sort = "default",
  category = "all",
  wordType = "all",
  status = "all",
}: LevelPageContentProps) {
  const upper = level.toUpperCase();
  const valid = VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number]);
  const config = valid
    ? levelConfig[upper as (typeof VALID_LEVELS)[number]]
    : null;
  const meta = getLevelMeta(upper);

  if (!valid || !config) return <NotFoundScreen />;

  const totalCount = initialTotal ?? initialWords.length;
  const levelSize = levelTotal ?? totalCount;
  const totalPages =
    initialTotalPages ?? Math.max(1, Math.ceil(totalCount / 10));
  const categories = initialCategories ?? [];

  if (meta && !isLevelLive(levelSize)) {
    return (
      <LevelInProgressScreen
        level={upper}
        label={meta.label}
        labelBn={meta.labelBn}
        total={levelSize}
      />
    );
  }

  return (
    <LevelPageFrame
      config={config}
      level={upper}
      stats={{
        totalCount: levelSize,
        categoryCount: initialCategoryCount ?? categories.length,
        categoryLabel: initialCategoryLabel ?? mainCategoryLabel([]),
        introEn: meta?.introEn ?? "",
        introBn: meta?.introBn ?? "",
        topics: meta?.topics ?? [],
        levelWordIds: initialWordIds ?? [],
      }}
    >
      <LevelWordsClient
        words={initialWords}
        gradient={config.gradient}
        level={upper}
        pageNum={pageNum}
        serverMode
        totalCount={totalCount}
        totalPages={totalPages}
        categories={categories}
        search={search}
        sort={sort}
        category={category}
        wordType={wordType}
        status={status}
        levelWordIds={initialWordIds ?? []}
      />
    </LevelPageFrame>
  );
}
