"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLearnedWords } from "@/lib/use-learned-words";
import { Button } from "@/components/ui/button";
import {
  LibraryBig,
  BookOpenCheck,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  Languages,
  BookMarked,
  GraduationCap,
  ClipboardList,
  PenTool,
  Bookmark,
  Pin,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  FileText,
  Compass,
  ArrowUpRight,
  Check,
  X,
  Volume2,
  CheckSquare,
  Square,
  Loader2,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { LatestPostsHome, type LatestPost } from "@/components/news/latest-posts-home";
import type { LeaderboardRow } from "@/components/leaderboard";
import { isLevelLive, VALID_LEVELS } from "@/lib/level-copy";
import type { LevelStatItem } from "@/lib/data";
import { LenisProvider } from "@/components/lenis-provider";
import { PixelFeatureCard } from "@/components/pixel-feature-card";
import { DailyRoutineSection } from "@/components/daily-routine-section";
import {
  ScrollReveal,
  SketchHighlight,
  WashiTape,
  DoodleUnderline,
  DoodleArrow,
  DoodleStar,
  DoodlePaperClip,
  DoodleSparkle,
} from "@/components/scroll-reveal";

const LEVEL_CONFIG: Record<
  string,
  {
    bg: string;
    darkBg: string;
    border: string;
    text: string;
    highlight: "yellow" | "orange" | "emerald" | "cyan" | "rose";
    tapeColor: "amber" | "neutral" | "orange" | "rose";
    label: string;
    labelBn: string;
    sectionTag: string;
    solid: string;
    rotation: string;
    sampleWords: string[];
  }
> = {
  A1: {
    bg: "bg-[#f4fbf7]",
    darkBg: "dark:bg-emerald-950/25",
    border: "border-emerald-300/80 dark:border-emerald-700/60",
    text: "text-emerald-700 dark:text-emerald-300",
    highlight: "emerald",
    tapeColor: "neutral",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    sectionTag: "NOTE #01",
    solid: "bg-emerald-500",
    rotation: "-rotate-[0.8deg]",
    sampleWords: ["water", "family", "simple"],
  },
  A2: {
    bg: "bg-[#f0f9ff]",
    darkBg: "dark:bg-sky-950/25",
    border: "border-sky-300/80 dark:border-sky-700/60",
    text: "text-sky-700 dark:text-sky-300",
    highlight: "cyan",
    tapeColor: "amber",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    sectionTag: "NOTE #02",
    solid: "bg-sky-500",
    rotation: "rotate-[1deg]",
    sampleWords: ["journey", "decide", "nature"],
  },
  B1: {
    bg: "bg-[#fffdf0]",
    darkBg: "dark:bg-amber-950/25",
    border: "border-amber-300/80 dark:border-amber-700/60",
    text: "text-amber-800 dark:text-amber-300",
    highlight: "yellow",
    tapeColor: "amber",
    label: "Intermediate",
    labelBn: "মাঝারি",
    sectionTag: "NOTE #03",
    solid: "bg-amber-500",
    rotation: "-rotate-[1.2deg]",
    sampleWords: ["achieve", "explore", "balance"],
  },
  B2: {
    bg: "bg-[#fff1f2]",
    darkBg: "dark:bg-rose-950/25",
    border: "border-rose-300/80 dark:border-rose-700/60",
    text: "text-rose-700 dark:text-rose-300",
    highlight: "rose",
    tapeColor: "rose",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    sectionTag: "NOTE #04",
    solid: "bg-rose-500",
    rotation: "rotate-[0.9deg]",
    sampleWords: ["persevere", "resilient", "adapt"],
  },
  C1: {
    bg: "bg-[#faf5ff]",
    darkBg: "dark:bg-purple-950/25",
    border: "border-purple-300/80 dark:border-purple-700/60",
    text: "text-purple-700 dark:text-purple-300",
    highlight: "orange",
    tapeColor: "neutral",
    label: "Advanced",
    labelBn: "উন্নত",
    sectionTag: "NOTE #05",
    solid: "bg-purple-500",
    rotation: "-rotate-[0.7deg]",
    sampleWords: ["eloquent", "ambiguous", "viable"],
  },
  C2: {
    bg: "bg-[#fdf4ff]",
    darkBg: "dark:bg-fuchsia-950/25",
    border: "border-fuchsia-300/80 dark:border-fuchsia-700/60",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    highlight: "rose",
    tapeColor: "neutral",
    label: "Mastery",
    labelBn: "পারদর্শী",
    sectionTag: "NOTE #06",
    solid: "bg-fuchsia-500",
    rotation: "rotate-[1.4deg]",
    sampleWords: ["ephemeral", "ubiquitous", "paradigm"],
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");

const FEATURES = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    num: "01",
    tag: "VOCABULARY",
    titleEn: "Word lists & Flashnotes",
    titleBn: "শব্দতালিকা ও ফ্ল্যাশ-নোট",
    descriptionEn: "5,000+ Oxford words, grouped by CEFR level and topic with pronunciation and examples.",
    descriptionBn: "সব শব্দ CEFR লেভেল ও বিষয় অনুযায়ী সাজানো। যা জানেন আর যা শিখছেন তা আলাদা চিহ্নিত করুন।",
    markerColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300/60",
  },
  {
    href: "/grammar",
    icon: BookMarked,
    num: "02",
    tag: "GRAMMAR",
    titleEn: "Rules & Formula Guides",
    titleBn: "গ্রামার রুলস ও নির্দেশিকা",
    descriptionEn: "Structured rules for Parts of Speech, Tenses, Articles, sentence mechanics & common mistakes.",
    descriptionBn: "পার্টস অব স্পিচ, টেন্স, আর্টিকেল ও বাক্যের নিখুঁত গঠন। বাস্তব উদাহরণ ও ভুলের সহজ ব্যাখ্যা।",
    markerColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/60",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    num: "03",
    tag: "TEST LAB",
    titleEn: "Interactive Quizzes",
    titleBn: "প্রশ্নোত্তর ও কুইজ",
    descriptionEn: "Vocabulary and grammar questions with instant feedback, an explanation for every answer, and saved scores.",
    descriptionBn: "শব্দভাণ্ডার ও ব্যাকরণের প্রশ্ন, সঙ্গে সঙ্গে ফলাফল ও প্রতিটি উত্তরের বিস্তারিত ব্যাখ্যা।",
    markerColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/60",
  },
  {
    href: "/search",
    icon: Search,
    num: "04",
    tag: "SEARCH",
    titleEn: "Smart Dictionary",
    titleBn: "স্মার্ট ডিকশনারি সার্চ",
    descriptionEn: "Look up any word and read its Bangla meaning, definition, sentence examples and synonyms.",
    descriptionBn: "যেকোনো ইংরেজি শব্দ খুঁজে বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও সমার্থক শব্দ একসঙ্গে দেখুন।",
    markerColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/60",
  },
];

const QUIZ_MODES = [
  {
    href: "/quiz/vocabulary",
    icon: Languages,
    tag: "VOCAB PRACTICE",
    titleEn: "Vocabulary Practice",
    titleBn: "শব্দভাণ্ডার অনুশীলন",
    descriptionEn: "Test your word knowledge across all levels with multiple choice.",
    descriptionBn: "সব লেভেলের শব্দ জ্ঞান যাচাই করুন।",
    cardBg: "hover:border-sky-400 dark:hover:border-sky-500",
    badgeColor: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300/70",
  },
  {
    href: "/quiz/grammar",
    icon: BookMarked,
    tag: "GRAMMAR DRILL",
    titleEn: "Grammar Quizzes",
    titleBn: "গ্রামার কুইজ",
    descriptionEn: "Tenses, prepositions, articles and rule-based challenges.",
    descriptionBn: "টেন্স, প্রিপজিশন, আর্টিকেল ও বাক্য গঠন।",
    cardBg: "hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/70",
  },
  {
    href: "/quiz/class",
    icon: GraduationCap,
    tag: "ACADEMIC & JOB",
    titleEn: "Class Based Quizzes",
    titleBn: "শ্রেণি ভিত্তিক কুইজ",
    descriptionEn: "SSC, HSC, IELTS, BCS and university entrance exams.",
    descriptionBn: "SSC, HSC, IELTS, BCS ও বিশ্ববিদ্যালয় ভর্তি।",
    cardBg: "hover:border-amber-400 dark:hover:border-amber-500",
    badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300/70",
  },
  {
    href: "/quiz/exam",
    icon: ClipboardList,
    tag: "TIMED CHALLENGE",
    titleEn: "Scheduled Exams",
    titleBn: "নির্ধারিত পরীক্ষা",
    descriptionEn: "Weekly and biweekly timed exams with real ranking scores.",
    descriptionBn: "সাপ্তাহিক ও দ্বি-সাপ্তাহিক সময়ভিত্তিক পরীক্ষা।",
    cardBg: "hover:border-purple-400 dark:hover:border-purple-500",
    badgeColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300/70",
  },
];

// Grammar Sections Showcase
const GRAMMAR_SHOWCASE = [
  {
    href: "/grammar/parts-of-speech",
    icon: Layers,
    titleEn: "Parts of Speech",
    titleBn: "পদ প্রকরণ (৮ প্রকার পদ)",
    tag: "CORE 01",
    badge: "৮টি ক্যাটাগরি",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
    descriptionEn: "Master the 8 core word classes: Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction & Interjection.",
    descriptionBn: "বাক্যের মূল উপাদান ৮ প্রকার পদ: Noun, Pronoun, Verb, Adjective ইত্যাদির বিস্তারিত নিয়ম ও বাস্তব উদাহরণ।",
    topics: ["Noun (বিশেষ্য)", "Pronoun (সর্বনাম)", "Verb (ক্রিয়া)", "Adjective (বিশেষণ)", "Preposition"],
    cardBg: "bg-[#f4fbf7] dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60",
    tapeColor: "neutral" as const,
    rotation: "-rotate-[0.8deg]",
  },
  {
    href: "/grammar",
    icon: Clock,
    titleEn: "Tenses & Timeline",
    titleBn: "টেন্স ও সময়রেখা (১২টি টেন্স)",
    tag: "CORE 02",
    badge: "১২টি টেন্স",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300",
    descriptionEn: "Complete formula breakdown of all 12 tenses with visual timeline analogies and real-life Bengali translations.",
    descriptionBn: "১২টি টেন্সের সহজ ফর্মুলা, টাইমলাইন ও বাস্তব জীবনে কীভাবে নিখুঁতভাবে বাক্য তৈরি করবেন তার সহজ গাইড।",
    topics: ["Present Simple", "Past Continuous", "Present Perfect", "Future Continuous"],
    cardBg: "bg-[#f0f9ff] dark:bg-sky-950/20 border-sky-300/80 dark:border-sky-800/60",
    tapeColor: "amber" as const,
    rotation: "rotate-[0.9deg]",
  },
  {
    href: "/grammar",
    icon: BookOpenCheck,
    titleEn: "Articles & Determiners",
    titleBn: "আর্টিকেল ও ডিটারমাইনার",
    tag: "CORE 03",
    badge: "A / An / The",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300",
    descriptionEn: "Master exact rules for A, An, The, along with countable/uncountable rules and common trap exceptions.",
    descriptionBn: "A, An, The ব্যবহারের অকাট্য নিয়ম, বিভিন্ন ব্যতিক্রম ও ভর্তি পরীক্ষায় আসা ট্রিকি প্রশ্ন সমাধান।",
    topics: ["Definite Article", "Indefinite Article", "Zero Article", "Quantifiers"],
    cardBg: "bg-[#fffdf0] dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60",
    tapeColor: "amber" as const,
    rotation: "-rotate-[1deg]",
  },
  {
    href: "/grammar",
    icon: FileText,
    titleEn: "Sentence Structure & Mistakes",
    titleBn: "বাক্যের গঠন ও সাধারণ ভুল",
    tag: "CORE 04",
    badge: "কমন মিসটেকস",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300",
    descriptionEn: "Simple, Compound, Complex structures, Subject-Verb agreement, and 50+ common Bengali speaker mistakes.",
    descriptionBn: "Subject-Verb Agreement, ক্লজ ও ফ্রেজ গঠন এবং বাঙালি শিক্ষার্থীদের সচরাচর হওয়া ভুলের সমাধান।",
    topics: ["Subject-Verb Agreement", "Simple, Compound, Complex", "Common Errors"],
    cardBg: "bg-[#faf5ff] dark:bg-purple-950/20 border-purple-300/80 dark:border-purple-800/60",
    tapeColor: "rose" as const,
    rotation: "rotate-[1.1deg]",
  },
];

export function HomeContent({
  levelStats,
  posts,
  leaderboard,
}: {
  levelStats: LevelStatItem[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
  const { learnedIds, loaded } = useLearnedWords();
  const t = useT();
  const countMap = new Map(levelStats.map((s) => [s.level.toUpperCase(), s.count]));
  const totalWords = levelStats.reduce((sum, s) => sum + s.count, 0);

  const displayStats = VALID_LEVELS.map((level) => {
    const total = countMap.get(level) ?? 0;
    return { level, label: LEVEL_CONFIG[level].label, total, learned: 0 };
  });

  const totalLearned = learnedIds.size;
  const overallPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const liveLevelCount = displayStats.filter((s) => isLevelLive(s.total)).length;

  return (
    <LenisProvider>
      <div className="relative min-h-dvh overflow-x-hidden bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5] selection:bg-amber-300 selection:text-zinc-950">
        {/* Tactile notebook paper texture overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-radial from-amber-50/40 via-transparent to-zinc-200/20 dark:from-zinc-900/50 dark:via-zinc-950/80 dark:to-black"
        />

        <div className="relative px-3 sm:px-6 lg:px-8 pt-8 pb-20 max-w-6xl xl:max-w-7xl mx-auto">
          {/* Main Content Container */}
          <div className="relative">
            {/* HERO SECTION - FLUID, RESTRAINED, DESIGNS.MD COMPLIANT */}
            <section className="pt-2 sm:pt-6 pb-12 sm:pb-16 text-center max-w-4xl mx-auto">
              <ScrollReveal direction="up">
                {/* Eyebrow / Status Capsule */}
                <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-[#242423] dark:text-[#f4f4f5] shadow-xs mb-5 sm:mb-6">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>{t("অক্সফোর্ড CEFR মানসম্মত পাঠ্যক্রম", "Oxford 3000™ & 5000™ Vocabulary")}</span>
                  <span className="text-[#242423]/30 dark:text-white/20">·</span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {fmt(totalWords)} {t("শব্দ", "Words")}
                  </span>
                </div>

                {/* Primary Typographic Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5] leading-[1.14] sm:leading-[1.1] max-w-3xl mx-auto">
                  {t(
                    "সহজ নিয়মে ইংরেজি শব্দভাণ্ডার আয়ত্ত করুন",
                    "Master English Vocabulary with Oxford Precision"
                  )}
                </h1>

                {/* Refined Subtitle */}
                <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-[#242423]/65 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                  {t(
                    "প্রাথমিক A1 থেকে সাবলীল C1 পর্যন্ত প্রতিটি শব্দের সঠিক বাংলা অর্থ, উচ্চারণ ও ব্যবহার। ফ্ল্যাশকার্ড ও কুইজে নিজের অগ্রগতি যাচাই করুন।",
                    "Systematic vocabulary progression from A1 beginner to C1 advanced. Powered by contextual Bengali translations, human audio pronunciation, and interactive recall drills."
                  )}
                </p>

                {/* Responsive Action Buttons (DESIGNS.md Section 5: Mobile Optimized) */}
                <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto w-full px-1">
                  {/* Primary CTA */}
                  <a
                    href="#levels"
                    className="w-full sm:w-auto h-12 px-7 flex items-center justify-center gap-2 rounded-full bg-[#1c1c1e] hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#1c1c1e] font-semibold text-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-150"
                  >
                    <span>{t("শেখা শুরু করুন", "Explore Word Lists")}</span>
                    <ArrowRight className="size-4" />
                  </a>

                  {/* Secondary CTAs - 50/50 split on mobile screens, inline pills on desktop */}
                  <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:items-center">
                    <Link
                      href="/words"
                      className="h-11 sm:h-12 px-4 sm:px-5 flex items-center justify-center gap-2 rounded-full border border-black/[0.06] bg-white hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-[#1c1c1e] dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium text-[#242423] dark:text-[#f4f4f5] active:scale-[0.98] transition-all duration-150 shadow-2xs"
                    >
                      <Search className="size-3.5 sm:size-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="truncate">{t("শব্দ খুঁজুন", "Dictionary")}</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      className="h-11 sm:h-12 px-4 sm:px-5 flex items-center justify-center gap-2 rounded-full border border-black/[0.06] bg-white hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-[#1c1c1e] dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium text-[#242423] dark:text-[#f4f4f5] active:scale-[0.98] transition-all duration-150 shadow-2xs"
                    >
                      <GraduationCap className="size-3.5 sm:size-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="truncate">{t("ড্যাশবোর্ড", "Dashboard")}</span>
                    </Link>
                  </div>
                </div>

                {/* 3-Cell Inset Stat Module (Reference 1 from DESIGNS.md) */}
                <div className="mt-8 sm:mt-10 mx-auto max-w-lg rounded-[22px] bg-[#f1f1ef] dark:bg-[#252528] p-2 border border-black/[0.04] dark:border-white/[0.05]">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div className="rounded-[16px] bg-white dark:bg-[#1c1c1e] p-2.5 sm:p-3 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#1c1c1e] dark:text-[#f4f4f5] tabular-nums">
                        {fmt(totalWords)}
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#242423]/55 dark:text-zinc-400 font-medium truncate">
                        {t("মোট শব্দ", "Oxford Words")}
                      </div>
                    </div>
                    <div className="rounded-[16px] bg-white dark:bg-[#1c1c1e] p-2.5 sm:p-3 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-[#1c1c1e] dark:text-[#f4f4f5] tabular-nums">
                        {fmt(liveLevelCount)} CEFR
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#242423]/55 dark:text-zinc-400 font-medium truncate">
                        {t("লেভেল ধাপ", "Skill Levels")}
                      </div>
                    </div>
                    <div className="rounded-[16px] bg-white dark:bg-[#1c1c1e] p-2.5 sm:p-3 shadow-2xs">
                      <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        100%
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#242423]/55 dark:text-zinc-400 font-medium truncate">
                        {t("বিনামূল্যে", "Free & Open")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full-Width Interactive App Preview Stage with PixelFeatureCard */}
                <div className="mt-10 sm:mt-14 w-full">
                  <PixelFeatureCard
                    className="w-full shadow-[0_2px_12px_rgba(0,0,0,0.03),0_24px_48px_-12px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:ring-white/10"
                    score={overallPct > 0 ? overallPct : 88}
                    userName={t("শিক্ষার্থী", "Learner")}
                    greeting={t("শুভ সকাল", "Good morning")}
                  />
                </div>
              </ScrollReveal>
            </section>

            {/* CEFR LEVEL CARDS SECTION - "STICKY NOTES" DESIGN WITH SAMPLE WORDS */}
            <section id="levels" className="py-4 sm:py-8 relative">
              <ScrollReveal direction="up" className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orange-600 dark:text-orange-400 mb-2">
                      <Bookmark className="size-3.5" />
                      <span>{t("লেভেল অনুযায়ী খাতা", "LEVEL-BY-LEVEL NOTEBOOK")}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {t("CEFR লেভেল অনুযায়ী শব্দতালিকা", "Word Lists by CEFR Level")}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                      {t(
                        "প্রাইমারি A1 থেকে অ্যাডভান্সড C1 পর্যন্ত প্রতিটি লেভেলের শব্দ আলাদা নোটবুকে সাজানো। যা শিখেছেন তা রঙিন করে চিহ্নিত করুন।",
                        "Study progressively from A1 Beginner to C1 Advanced. Open any sticky note to start drilling words."
                      )}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <DoodleArrow className="text-amber-500 -scale-y-100" />
                    <span>{t("যেকোনো লেভেলে ক্লিক করুন", "Click card to start")}</span>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayStats.map(({ level, total, learned }, idx) => {
                  const c = LEVEL_CONFIG[level];
                  const inProgress = !isLevelLive(total);
                  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

                  const cardInner = (
                    <div
                      className={cn(
                        "relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between min-h-[220px] paper-dogear",
                        c.bg,
                        c.darkBg,
                        c.border,
                        c.rotation,
                        "hover:rotate-0 hover:scale-[1.02] sticky-shadow group"
                      )}
                    >
                      {/* Washi tape topper */}
                      <WashiTape color={c.tapeColor} />

                      {/* Header row: Stamp tag & CEFR code */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                            {c.sectionTag}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-sm border border-dashed",
                              c.text,
                              c.border
                            )}
                          >
                            {t(c.labelBn, c.label)}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                            {level}
                          </span>
                          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                            {inProgress ? (
                              <span className="text-rose-500 font-bold">
                                {t("খসড়া চলছে", "Drafting")}
                              </span>
                            ) : (
                              `${fmt(total)} words`
                            )}
                          </span>
                        </div>

                        {/* Creative Sample Words Pill Preview */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            {t("নমুনা:", "Ex:")}
                          </span>
                          {c.sampleWords.map((word) => (
                            <span
                              key={word}
                              className="text-[11px] font-mono px-1.5 py-0.5 rounded-xs bg-white/75 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Progress / Status Bottom Section */}
                      <div className="mt-5 pt-3 border-t border-dashed border-zinc-300/70 dark:border-zinc-700/60">
                        {inProgress ? (
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="italic">{t("শীঘ্রই উন্মুক্ত হবে", "Coming soon")}</span>
                            <span className="font-mono text-[10px]">COMING_SOON</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-xs font-mono mb-2">
                              <span className="text-zinc-500 dark:text-zinc-400">
                                {loaded
                                  ? t(`${learned}টি মুখস্থ`, `${learned} mastered`)
                                  : t(`${fmt(total)}টি শব্দ`, `${fmt(total)} total`)}
                              </span>
                              <span className={cn("font-bold", c.text)}>
                                {loaded ? `${pct}%` : "0%"}
                              </span>
                            </div>

                            {/* Hand-drawn style progress bar */}
                            <div className="h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-300/50 dark:border-zinc-700">
                              <div
                                className={cn("h-full rounded-full transition-all duration-700", c.solid)}
                                style={{ width: loaded && pct > 0 ? `${pct}%` : "6%" }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hover Arrow Icon */}
                      {!inProgress && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className={cn("size-4", c.text)} />
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <ScrollReveal key={level} direction="up" delay={0.06 * idx}>
                      {inProgress ? (
                        <div className="opacity-75 cursor-not-allowed" aria-disabled="true">
                          {cardInner}
                        </div>
                      ) : (
                        <Link href={`/vocabulary/${level.toLowerCase()}`} className="block">
                          {cardInner}
                        </Link>
                      )}
                    </ScrollReveal>
                  );
                })}
              </div>
            </section>

            {/* DAILY ROUTINE SECTION (POWERED BY USER DAILY ROUTINE MODEL) */}
            <DailyRoutineSection />

            {/* DEDICATED GRAMMAR WORKBOOK SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2">
                      <BookMarked className="size-3.5" />
                      <span>{t("গ্রামার ওয়ার্কবুক", "GRAMMAR WORKBOOK & LESSONS")}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {t("সহজ বাংলা ব্যাখ্যায় ইংরেজি ব্যাকরণ", "Structured English Grammar Rules")}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                      {t(
                        "পার্টস অব স্পিচ, ১২টি টেন্স, আর্টিকেল ও বাক্যের গঠন—প্রতিটি নিয়মের বাংলা অর্থ, ফর্মুলা ও সাধারণ ভুলের সমাধান।",
                        "Master grammar foundations with rule breakdowns, real sentences, and common mistake explanations."
                      )}
                    </p>
                  </div>

                  <Link
                    href="/grammar"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("সব গ্রামার লেসন খুলুন", "Explore All Grammar")}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GRAMMAR_SHOWCASE.map(({ href, icon: Icon, titleEn, titleBn, tag, badge, badgeColor, descriptionEn, descriptionBn, topics, cardBg, tapeColor, rotation }, i) => (
                  <ScrollReveal key={titleEn} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className={cn(
                        "relative block p-5 rounded-2xl border-2 sticky-shadow hover:scale-[1.02] hover:rotate-0 transition-all duration-300 flex flex-col justify-between min-h-[260px] group paper-dogear",
                        cardBg,
                        rotation
                      )}
                    >
                      <WashiTape color={tapeColor} />

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[10px] text-zinc-400 font-bold tracking-wider">
                            {tag}
                          </span>
                          <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-sm border border-dashed", badgeColor)}>
                            {badge}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Icon className="size-4" />
                          </div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {t(titleBn, titleEn)}
                          </h3>
                        </div>

                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      {/* Topic chips inside the note */}
                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-300/60 dark:border-zinc-700/60">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-white/80 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          <span>{t("রুলস পড়ুন", "Read Rules")}</span>
                          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* THREE ESSENTIAL TOOLS / LEDGER SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-sky-400 mb-2">
                  <Compass className="size-3.5" />
                  <span>{t("স্টাডি টুলকিট", "STUDY TOOLKIT")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("খুঁজুন, শিখুন ও পরীক্ষা দিন", "Four Core Learning Pillars")}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {t("ভোকাবুলারি ও গ্রামার শেখার প্রয়োজনীয় সব টুল এক প্ল্যাটফর্মে।", "Everything needed to master English words and sentence rules.")}
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURES.map(({ href, icon: Icon, num, tag, titleEn, titleBn, descriptionEn, descriptionBn, markerColor }, i) => (
                  <ScrollReveal key={href} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className="group relative block p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border-2 border-zinc-200/90 dark:border-zinc-800 paper-shadow hover:border-orange-400 dark:hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px]"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center border",
                              markerColor
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                            {num} // {tag}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                          <span>{t(titleBn, titleEn)}</span>
                        </h3>

                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
                        <span>{t("ব্রাউজ করুন", "Open Tool")}</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* QUIZ WORKBOOK SECTION */}
            <section className="py-12 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up" className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-600 dark:text-purple-400 mb-2">
                    <BookOpenCheck className="size-3.5" />
                    <span>{t("অনুশীলনী ও পরীক্ষা", "TEST YOUR MEMORY")}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {t("কুইজে নিজেকে যাচাই করুন", "Four Interactive Quiz Modes")}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {t("ভোকাবুলারি, ব্যাকরণ, অ্যাকাডেমিক ও নির্ধারিত টাইমড পরীক্ষা।", "Practice with instant feedback and explanations.")}
                  </p>
                </div>

                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <span>{t("সব কুইজ দেখুন", "View All Quizzes")}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUIZ_MODES.map(({ href, icon: Icon, tag, titleEn, titleBn, descriptionEn, descriptionBn, cardBg, badgeColor }, i) => (
                  <ScrollReveal key={href} direction="up" delay={i * 0.08}>
                    <Link
                      href={href}
                      className={cn(
                        "group block p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border-2 border-zinc-200/80 dark:border-zinc-800 paper-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
                        , cardBg
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center border", badgeColor)}>
                            <Icon className="size-5" />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
                            {tag}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {t(titleBn, titleEn)}
                        </h3>

                        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {t(descriptionBn, descriptionEn)}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
                        <span>{t("শুরু করুন", "Start Drill")}</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* LATEST POSTS / STUDY GAZETTE */}
            <div className="pt-8 pb-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <ScrollReveal direction="up">
                <LatestPostsHome posts={posts} />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </LenisProvider>
  );
}