"use client";

import Link from "next/link";
import { useCachedWords } from "@/lib/use-cached-words";
import { LevelHero } from "@/components/level-hero";
import { LevelWordsClient } from "@/components/level-words-client";
import { useT } from "@/components/language-provider";
import { ArrowLeft, RefreshCw } from "lucide-react";
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
}

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

function LoadingScreen() {
  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="mx-auto max-w-4xl">
        <div className="space-y-4">
          <div className="h-5 w-32 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 animate-pulse" />
          <div className="h-16 w-56 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="mt-10 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="max-w-md mx-auto text-center mt-24">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {t("সংযোগ পাওয়া যাচ্ছে না", "You're offline")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          {t(
            "এই শব্দভাণ্ডারটি এখনও ডাউনলোড হয়নি। প্রথমে অনলাইনে বেতার-শব্দভাণ্ডার পৃষ্ঠাটি খুলুন, তারপর আবার চেষ্টা করুন।",
            "This vocabulary hasn't been downloaded yet. Open the vocabulary page once while online to download it, then try again."
          )}
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("আবার চেষ্টা করুন", "Try again")}
        </Button>
      </div>
    </div>
  );
}

export function LevelPageContent({ level }: LevelPageContentProps) {
  const { words, loading, error, refresh, getWordsByLevel } = useCachedWords();

  const upper = level.toUpperCase();
  const valid = VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number]);
  const allWords = valid ? getWordsByLevel(upper) : [];
  const config = valid
    ? levelConfig[upper as (typeof VALID_LEVELS)[number]]
    : null;

  if (!valid) return <NotFoundScreen />;

  if (!loading && error === "offline" && words.length === 0) {
    return <OfflineScreen onRetry={refresh} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (words.length === 0 || allWords.length === 0) {
    return <NotFoundScreen />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <LevelHero
        level={upper}
        label={config!.label}
        labelBn={config!.labelBn}
        gradient={config!.gradient}
        text={config!.text}
        bg={config!.bg}
        border={config!.border}
        solid={config!.solid}
        stroke={config!.stroke}
        words={allWords}
      />

      <div className="relative px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <LevelWordsClient words={allWords} gradient={config!.gradient} level={upper} />
        </div>
      </div>
    </div>
  );
}