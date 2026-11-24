"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  ChevronRight,
  Flame,
  GraduationCap,
  Sparkles,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import { useLearnedWords } from "@/lib/use-learned-words";
import type { VocabularyFacets } from "@/lib/data";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { setSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import {
  useGuidedTour,
  GuidedTour,
  TourReplayButton,
  VOCABULARY_HUB_TOUR,
} from "@/components/guided-tour";

interface LevelVisualMeta {
  label: string;
  labelBn: string;
  tagline: string;
  taglineBn: string;
}

const LEVEL_META: Record<string, LevelVisualMeta> = {
  A1: {
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    tagline: "Everyday basics & foundations",
    taglineBn: "প্রতিদিনের প্রয়োজনীয় মূল শব্দ",
  },
  A2: {
    label: "Elementary",
    labelBn: "প্রাথমিক",
    tagline: "Simple routine communication",
    taglineBn: "দৈনন্দিন সাধারণ বার্তা বিনিময়",
  },
  B1: {
    label: "Intermediate",
    labelBn: "মাঝারি",
    tagline: "Work, travel & opinions",
    taglineBn: "কর্মক্ষেত্র, ভ্রমণ ও মতামত প্রকাশ",
  },
  B2: {
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    tagline: "Fluent & spontaneous speech",
    taglineBn: "সাবলীল ও গভীরতর যোগাযোগ",
  },
  C1: {
    label: "Advanced",
    labelBn: "উন্নত",
    tagline: "Academic & professional texts",
    taglineBn: "উচ্চতর প্রাতিষ্ঠানিক ও পেশাগত ভাষা",
  },
  C2: {
    label: "Mastery",
    labelBn: "পারদর্শী",
    tagline: "Native-like precision & nuance",
    taglineBn: "মাতৃভাষার মতো নিখুঁত ব্যবহার",
  },
};

type TierFilter = "all" | "beginner" | "intermediate" | "advanced";

export interface VocabularyClientProps {
  serverMode?: boolean;
  facets?: VocabularyFacets;
}

export function VocabularyClient({ facets }: VocabularyClientProps) {
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const { todayLearned, streak, dailyGoal, loaded: goalLoaded } = useDailyGoal();
  const t = useT();

  const {
    isOpen: isTourOpen,
    currentStepIndex: tourStepIndex,
    nextStep: tourNext,
    prevStep: tourPrev,
    closeTour,
    startTour,
  } = useGuidedTour(VOCABULARY_HUB_TOUR);

  const [activeTier, setActiveTier] = useState<TierFilter>("all");

  const totalWords = facets?.totalWords ?? 0;
  const totalLearned = learnedIds.size;
  const overallPct = totalWords > 0 ? Math.min(100, Math.round((totalLearned / totalWords) * 100)) : 0;
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todayLearned / dailyGoal) * 100)) : 0;
  const categoryLabel = facets?.categoryLabel ?? "Oxford 5000";

  // Filter levels by tier
  const filteredGroups = useMemo(() => {
    const groups = facets?.groups ?? [];
    return groups
      .map((group) => {
        const matchingLevels = group.levels.filter((item) => {
          if (activeTier === "beginner") return ["A1", "A2"].includes(item.level);
          if (activeTier === "intermediate") return ["B1", "B2"].includes(item.level);
          if (activeTier === "advanced") return ["C1", "C2"].includes(item.level);
          return true;
        });

        return {
          ...group,
          levels: matchingLevels,
        };
      })
      .filter((group) => group.levels.length > 0);
  }, [facets, activeTier]);

  return (
    <div className="relative min-h-dvh bg-[#f8f8f6] px-2.5 py-3 transition-colors duration-200 dark:bg-[#121214] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Main 2-Column Responsive Layout */}
        <div className="grid gap-3.5 sm:gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Overview & Activity Hub                     */}
          {/* ======================================================== */}
          <div className="w-full">
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-3.5">
              {/* Inset Header */}
              <div className="rounded-[18px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528] sm:rounded-[20px] sm:p-3.5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Hub Icon with Status Indicator */}
                  <span className="relative block size-10 shrink-0 sm:size-11">
                    <div className="flex size-full items-center justify-center rounded-[12px] bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423] sm:rounded-[14px]">
                      <GraduationCap className="size-5 sm:size-6" />
                    </div>
                    <span
                      className="absolute -bottom-px -right-px grid size-3 place-items-center sm:size-3.5"
                    >
                      <span
                        className="relative size-full rounded-full ring-2 ring-white dark:ring-[#252528]"
                        style={{ backgroundColor: "rgb(16, 185, 129)" }}
                      />
                    </span>
                  </span>

                  {/* Title & Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-[14px] font-semibold leading-5 text-[#242423] dark:text-[#f3f3f2] sm:text-[16px] sm:leading-6">
                        {t("শব্দভাণ্ডার", "Vocabulary Hub")}
                      </p>
                      <TourReplayButton onReplay={startTour} />
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] leading-4 text-[#242423]/60 dark:text-zinc-400 sm:text-[12px]">
                      <span className="truncate">{categoryLabel}</span>
                      <span aria-hidden="true" className="text-[#242423]/30 dark:text-zinc-600">·</span>
                      <span className="truncate font-medium text-emerald-600 dark:text-emerald-400">
                        {t("CEFR মানসম্মত", "CEFR Aligned")}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status / Retention Pill Row */}
                <div
                  role="radiogroup"
                  aria-label="Progress Overview"
                  className="mt-2.5 grid grid-cols-3 rounded-full bg-[#242423]/[0.05] p-0.5 dark:bg-white/[0.07] sm:mt-3"
                >
                  {/* Mastered Pill */}
                  <div
                    title="Mastered progress"
                    className="relative flex h-7 items-center justify-center gap-1 rounded-full text-[11px] font-medium text-[#242423] dark:text-[#f3f3f2] sm:h-8 sm:gap-1.5 sm:text-[12px]"
                  >
                    <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
                    <span
                      className="relative size-1.5 rounded-full"
                      style={{ backgroundColor: "rgb(16, 185, 129)" }}
                    />
                    <span className="relative truncate font-semibold tabular-nums">
                      {learnedLoaded ? `${overallPct}%` : "…"}
                    </span>
                  </div>

                  {/* Daily Goal Pill */}
                  <div
                    title="Today's goal"
                    className="relative flex h-7 items-center justify-center gap-1 rounded-full text-[11px] font-medium text-[#242423]/70 dark:text-zinc-400 sm:h-8 sm:gap-1.5 sm:text-[12px]"
                  >
                    <span
                      className="relative size-1.5 rounded-full"
                      style={{ backgroundColor: "rgb(99, 102, 241)" }}
                    />
                    <span className="relative truncate font-medium tabular-nums">
                      {goalLoaded ? `${todayLearned}/${dailyGoal}` : "…"}
                    </span>
                  </div>

                  {/* Streak Pill */}
                  <div
                    title="Active streak"
                    className="relative flex h-7 items-center justify-center gap-1 rounded-full text-[11px] font-medium text-[#242423]/70 dark:text-zinc-400 sm:h-8 sm:gap-1.5 sm:text-[12px]"
                  >
                    <span
                      className="relative size-1.5 rounded-full"
                      style={{ backgroundColor: "rgb(245, 158, 11)" }}
                    />
                    <span className="relative truncate font-medium tabular-nums">
                      {goalLoaded ? `${streak}d` : "…"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Grid (3 Columns, highly responsive) */}
              <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* Take Quiz */}
                <Link
                  href="/quiz/vocabulary"
                  className="group relative flex h-[64px] cursor-pointer flex-col justify-between rounded-[16px] bg-[#242423]/[0.04] p-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.07] active:scale-[0.97] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] sm:h-[74px] sm:rounded-[18px] sm:p-2.5"
                >
                  <span className="flex items-start justify-between">
                    <span className="size-3.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100 sm:size-4">
                      <BookOpenCheck className="size-full" />
                    </span>
                    <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500 sm:size-3.5" />
                  </span>
                  <span className="truncate text-[11px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[12px]">
                    {t("কুইজ", "Quiz")}
                  </span>
                </Link>

                {/* Quick Quiz */}
                <Link
                  href="/quiz/quick"
                  className="group relative flex h-[64px] cursor-pointer flex-col justify-between rounded-[16px] bg-[#242423]/[0.04] p-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.07] active:scale-[0.97] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] sm:h-[74px] sm:rounded-[18px] sm:p-2.5"
                >
                  <span className="flex items-start justify-between">
                    <span className="size-3.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100 sm:size-4">
                      <Trophy className="size-full" />
                    </span>
                    <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500 sm:size-3.5" />
                  </span>
                  <span className="truncate text-[11px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[12px]">
                    {t("কুইক", "Quick")}
                  </span>
                </Link>

                {/* Practice Mode */}
                <Link
                  href="/quiz/mistakes"
                  className="group relative flex h-[64px] cursor-pointer flex-col justify-between rounded-[16px] bg-[#242423]/[0.04] p-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.07] active:scale-[0.97] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] sm:h-[74px] sm:rounded-[18px] sm:p-2.5"
                >
                  <span className="flex items-start justify-between">
                    <span className="size-3.5 text-[#242423]/70 transition-colors group-hover:text-[#242423] dark:text-zinc-400 dark:group-hover:text-zinc-100 sm:size-4">
                      <Sparkles className="size-full" />
                    </span>
                    <ArrowUpRight className="size-3 text-[#242423]/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500 sm:size-3.5" />
                  </span>
                  <span className="truncate text-[11px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[12px]">
                    {t("অনুশীলন", "Practice")}
                  </span>
                </Link>
              </div>

              {/* Daily Target Progress Bar */}
              <div data-tour="daily-goal" className="mt-2 rounded-[16px] bg-[#242423]/[0.03] p-2.5 dark:bg-white/[0.04] sm:mt-2.5 sm:rounded-[18px] sm:p-3">
                <div className="flex items-center justify-between text-[11px] sm:text-[12px]">
                  <span className="font-semibold text-[#242423] dark:text-[#f3f3f2]">
                    {t("দৈনিক লক্ষ্য", "Daily Target")}
                  </span>
                  <span className="tabular-nums text-[#242423]/60 dark:text-zinc-400">
                    {goalLoaded ? `${todayLearned}/${dailyGoal} ${t("শব্দ", "words")}` : "…"}
                  </span>
                </div>

                <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
                  <div
                    className="relative h-full overflow-hidden rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${goalLoaded ? goalPct : 0}%` }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      style={{ transform: "translateX(600%)" }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] sm:text-[12px]">
                  <span className="flex items-center gap-1 font-medium text-[#242423]/70 dark:text-zinc-400">
                    <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>{goalLoaded ? `${streak} ${t("দিনের ধারাবাহিকতা", "day streak")}` : "…"}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-[#242423] dark:text-[#f3f3f2]">
                    {goalLoaded ? `${goalPct}%` : "0%"}
                  </span>
                </div>
              </div>

              {/* 3-Metric Stats Row */}
              <div className="mt-2 flex items-center justify-between gap-1.5 sm:mt-2.5 sm:gap-2">
                <div className="min-w-0 flex-1 rounded-[14px] bg-[#242423]/[0.04] px-1.5 py-2 text-center dark:bg-white/[0.04] sm:rounded-2xl sm:px-2 sm:py-2.5">
                  <p className="truncate text-[14px] font-semibold tabular-nums tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-base">
                    {totalWords.toLocaleString()}
                  </p>
                  <p className="truncate text-[10px] text-[#242423]/55 dark:text-zinc-400 sm:text-[11px]">
                    {t("মোট শব্দ", "Total Words")}
                  </p>
                </div>
                <div className="min-w-0 flex-1 rounded-[14px] bg-[#242423]/[0.04] px-1.5 py-2 text-center dark:bg-white/[0.04] sm:rounded-2xl sm:px-2 sm:py-2.5">
                  <p className="truncate text-[14px] font-semibold tabular-nums tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-base">
                    {learnedLoaded ? totalLearned.toLocaleString() : "…"}
                  </p>
                  <p className="truncate text-[10px] text-[#242423]/55 dark:text-zinc-400 sm:text-[11px]">
                    {t("শেখা শব্দ", "Learned")}
                  </p>
                </div>
                <div className="min-w-0 flex-1 rounded-[14px] bg-[#242423]/[0.04] px-1.5 py-2 text-center dark:bg-white/[0.04] sm:rounded-2xl sm:px-2 sm:py-2.5">
                  <p className="truncate text-[14px] font-semibold tabular-nums tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-base">
                    {facets?.levelCount ?? 6}
                  </p>
                  <p className="truncate text-[10px] text-[#242423]/55 dark:text-zinc-400 sm:text-[11px]">
                    {t("লেভেল", "Levels")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Workspaces-Style Level List                */}
          {/* ======================================================== */}
          <div className="w-full">
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-3.5">
              {/* Inset Header for CEFR Levels */}
              <div className="rounded-[18px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528] sm:rounded-[20px] sm:p-3.5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div>
                    <h2 className="text-[14px] font-semibold leading-5 text-[#242423] dark:text-[#f3f3f2] sm:text-[16px] sm:leading-6">
                      {t("CEFR লেভেলসমূহ", "CEFR Levels")}
                    </h2>
                    <p className="flex items-center gap-1.5 text-[11px] leading-4 text-[#242423]/60 dark:text-zinc-400 sm:text-[12px]">
                      <span>{t("লেভেলে ট্যাপ করে শব্দ শিখুন", "Tap any level to explore vocabulary")}</span>
                    </p>
                  </div>

                  {/* Tier Filter Pills (Even distribution with Apple sliding pill aesthetic) */}
                  <div
                    data-tour="tier-filter"
                    role="radiogroup"
                    aria-label="Filter by Tier"
                    className="grid w-full grid-cols-4 rounded-full bg-[#242423]/[0.05] p-0.5 dark:bg-white/[0.07] sm:flex sm:w-auto"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTier("all")}
                      className={cn(
                        "relative flex h-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none transition-colors duration-150 sm:h-8 sm:px-3 sm:text-[12px]",
                        activeTier === "all"
                          ? "text-[#242423] dark:text-[#f3f3f2]"
                          : "text-[#242423]/55 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {activeTier === "all" && (
                        <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
                      )}
                      <span className="relative">All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTier("beginner")}
                      className={cn(
                        "relative flex h-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none transition-colors duration-150 sm:h-8 sm:px-3 sm:text-[12px]",
                        activeTier === "beginner"
                          ? "text-[#242423] dark:text-[#f3f3f2]"
                          : "text-[#242423]/55 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {activeTier === "beginner" && (
                        <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
                      )}
                      <span className="relative">A1–A2</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTier("intermediate")}
                      className={cn(
                        "relative flex h-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none transition-colors duration-150 sm:h-8 sm:px-3 sm:text-[12px]",
                        activeTier === "intermediate"
                          ? "text-[#242423] dark:text-[#f3f3f2]"
                          : "text-[#242423]/55 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {activeTier === "intermediate" && (
                        <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
                      )}
                      <span className="relative">B1–B2</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTier("advanced")}
                      className={cn(
                        "relative flex h-7 cursor-pointer items-center justify-center rounded-full text-[11px] font-medium outline-none transition-colors duration-150 sm:h-8 sm:px-3 sm:text-[12px]",
                        activeTier === "advanced"
                          ? "text-[#242423] dark:text-[#f3f3f2]"
                          : "text-[#242423]/55 hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {activeTier === "advanced" && (
                        <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-[#323236]" />
                      )}
                      <span className="relative">C1–C2</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grouped Level Items */}
              <div data-tour="level-cards" className="mt-2 sm:mt-2.5 flex flex-col gap-1">
                {filteredGroups.map((group) => (
                  <div key={group.category || group.label} className="flex flex-col gap-1">
                    {/* Section Caption */}
                    <p className="px-2 pb-0.5 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/45 dark:text-zinc-500">
                      {group.label} ({group.total.toLocaleString()} {t("শব্দ", "words")})
                    </p>

                    {/* Level Rows */}
                    <div className="flex flex-col gap-1">
                      {group.levels.map(({ level: lv, total }) => {
                        const meta = LEVEL_META[lv] ?? LEVEL_META.A1;

                        return (
                          <Link
                            key={lv}
                            href={`/vocabulary/${lv.toLowerCase()}`}
                            onClick={() =>
                              setSelectedLevel(
                                lv.toUpperCase() as Parameters<typeof setSelectedLevel>[0]
                              )
                            }
                            className="group relative flex min-h-[56px] w-full cursor-pointer items-center justify-between rounded-[14px] px-3 py-2 text-left outline-none transition-all duration-150 hover:bg-[#242423]/[0.04] focus-visible:ring-2 focus-visible:ring-[#242423]/30 active:scale-[0.99] dark:hover:bg-white/[0.05] sm:min-h-[60px] sm:rounded-[16px] sm:px-3.5 sm:py-2.5"
                          >
                            {/* Left: Clean Typographic Hierarchy */}
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center rounded-[8px] bg-[#242423]/[0.06] px-2 py-0.5 font-mono text-[12px] font-bold tracking-tight text-[#242423] dark:bg-white/[0.08] dark:text-[#f3f3f2] sm:text-[13px]">
                                  {lv}
                                </span>
                                <span className="truncate text-[13.5px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[14.5px]">
                                  {t(meta.labelBn, meta.label)}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[11.5px] leading-4 text-[#242423]/55 dark:text-zinc-400 sm:text-[12.5px]">
                                {t(meta.taglineBn, meta.tagline)}
                              </p>
                            </div>

                            {/* Right: Word Count Pill & Subtle Action Chevron */}
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                              <span className="rounded-full bg-[#242423]/[0.05] px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-[#242423]/70 dark:bg-white/[0.08] dark:text-zinc-300 sm:px-2.5 sm:py-1 sm:text-[11px]">
                                {total.toLocaleString()} {t("শব্দ", "words")}
                              </span>
                              <span className="grid size-7 place-items-center rounded-full text-[#242423]/40 transition-all duration-150 group-hover:bg-[#242423]/[0.06] group-hover:text-[#242423] group-hover:translate-x-0.5 dark:text-zinc-500 dark:group-hover:bg-white/[0.08] dark:group-hover:text-zinc-100 sm:size-8">
                                <ChevronRight className="size-4" />
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuidedTour
        config={VOCABULARY_HUB_TOUR}
        isOpen={isTourOpen}
        currentStepIndex={tourStepIndex}
        onNext={tourNext}
        onPrev={tourPrev}
        onClose={closeTour}
      />
    </div>
  );
}
