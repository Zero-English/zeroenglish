"use client";

import React from "react";
import type { LatestPost } from "@/components/news/latest-posts-home";
import { LatestPostsHome } from "@/components/news/latest-posts-home";
import type { LeaderboardRow } from "@/components/leaderboard";
import type { LevelStatItem } from "@/lib/data";
import { LenisProvider } from "@/components/lenis-provider";
import { HeroCleanShowcase } from "@/components/hero-clean-showcase";
import { CefrLevelsSection } from "@/components/cefr-levels-section";
import { DailyRoutineSection } from "@/components/daily-routine-section";
import {
  GrammarWorkbookSection,
  StudyToolkitSection,
  QuizModesSection,
} from "@/components/home-sections";

export function HomeContent({
  levelStats,
  posts,
  leaderboard: _leaderboard,
}: {
  levelStats: LevelStatItem[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
  return (
    <LenisProvider>
      <div className="relative min-h-dvh overflow-x-clip bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5] selection:bg-orange-200 selection:text-zinc-950 dark:selection:bg-orange-500/30 dark:selection:text-white">
        {/* HERO SECTION - FULL-WIDTH CANVAS STAGE, HALLMARK + DESIGNS.MD */}
        <HeroCleanShowcase />

        <div className="relative px-2.5 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 max-w-6xl xl:max-w-7xl mx-auto">
          <div className="relative">
            {/* CEFR LEVEL-BY-LEVEL NOTEBOOK SECTION */}
            <CefrLevelsSection levelStats={levelStats} />

            {/* DAILY ROUTINE SECTION (POWERED BY USER DAILY ROUTINE MODEL) */}
            <div className="mb-8">
              <DailyRoutineSection />
            </div>

            {/* GRAMMAR WORKBOOK SECTION */}
            <GrammarWorkbookSection />

            {/* STUDY TOOLKIT PILLARS SECTION */}
            <StudyToolkitSection />

            {/* INTERACTIVE QUIZ MODES SECTION */}
            <QuizModesSection />

            {/* LATEST ARTICLES / STUDY GUIDES SECTION */}
            <LatestPostsHome posts={posts} />
          </div>
        </div>
      </div>
    </LenisProvider>
  );
}