"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { mainCategoryLabel } from "@/lib/category";
import { getLevelMeta, isLevelLive } from "@/lib/level-copy";
import type { Word, LevelPageSort } from "@/lib/data";
import { LevelHero } from "@/components/level-hero";
import { LevelWordsClient } from "@/components/level-words-client";
import { useT } from "@/components/language-provider";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="max-w-md mx-auto text-center mt-24">
        <div className="text-7xl mb-6">🗺️</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t("লেভেলটি খুঁজে পাওয়া যায়নি", "Level not found")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          {t(
            "আপনি যে লেভেলটি খুঁজছেন সেটি বিদ্যমান নেই।",
            "The level you're looking for doesn't exist."
          )}
        </p>
        <Button asChild>
          <Link href="/vocabulary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("লেভেল তালিকায় ফিরুন", "Back to levels")}
          </Link>
        </Button>
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
  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="max-w-xl mx-auto text-center mt-20">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t(`${level} · ${labelBn} লিস্ট তৈরি হচ্ছে`, `${level} · ${label} list is being built`)}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">
          {t(
            `এই লেভেলে এখন ${total}টি শব্দ আছে। যথেষ্ট শব্দ জমা হওয়ার আগে এটিকে শেখার জন্য খোলা হচ্ছে না, তাই এখনো সার্চ ইঞ্জিন থেকে বাদ দেওয়া হয়েছে।`,
            `This level has ${total} entries so far. It is not open for study, and it is kept out of search results, until it holds enough words to be worth your time.`
          )}
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-8">
          {t(
            "ততক্ষণ নিচের লেভেলগুলোতে শুরু করুন।",
            "Start from one of the levels below in the meantime."
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href={`/vocabulary/${(VALID_LEVELS[VALID_LEVELS.indexOf(level as (typeof VALID_LEVELS)[number]) - 1] ?? "A1").toLowerCase()}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("আগের লেভেল", "Previous level")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/vocabulary">{t("সব লেভেল", "All levels")}</Link>
          </Button>
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
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cuc3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

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

      <div className="relative px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
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
      />
    </LevelPageFrame>
  );
}
