"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpenCheck, Flame, Gauge, Layers, LibraryBig, Sparkles, Target } from "lucide-react";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useCachedWords } from "@/lib/use-cached-words";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { setSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { formatCategoryLabel } from "@/lib/category";
import type { WordRef } from "@/types/api";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

const RING_RADIUS = 22;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

interface LevelConfig {
  bg: string;
  border: string;
  text: string;
  gradient: string;
  label: string;
  labelBn: string;
  stroke: string;
  dot: string;
  hoverBg: string;
}

const LEVEL_CARD_CONFIG: Record<string, LevelConfig> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    stroke: "stroke-emerald-500",
    dot: "bg-emerald-500",
    hoverBg:
      "hover:bg-emerald-50/60 active:bg-emerald-50/60 dark:hover:bg-emerald-950/30 dark:active:bg-emerald-950/30",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    stroke: "stroke-sky-500",
    dot: "bg-sky-500",
    hoverBg:
      "hover:bg-sky-50/60 active:bg-sky-50/60 dark:hover:bg-sky-950/30 dark:active:bg-sky-950/30",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
    stroke: "stroke-amber-500",
    dot: "bg-amber-500",
    hoverBg:
      "hover:bg-amber-50/60 active:bg-amber-50/60 dark:hover:bg-amber-950/30 dark:active:bg-amber-950/30",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    stroke: "stroke-rose-500",
    dot: "bg-rose-500",
    hoverBg:
      "hover:bg-rose-50/60 active:bg-rose-50/60 dark:hover:bg-rose-950/30 dark:active:bg-rose-950/30",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
    stroke: "stroke-violet-500",
    dot: "bg-violet-500",
    hoverBg:
      "hover:bg-violet-50/60 active:bg-violet-50/60 dark:hover:bg-violet-950/30 dark:active:bg-violet-950/30",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
    stroke: "stroke-fuchsia-500",
    dot: "bg-fuchsia-500",
    hoverBg:
      "hover:bg-fuchsia-50/60 active:bg-fuchsia-50/60 dark:hover:bg-fuchsia-950/30 dark:active:bg-fuchsia-950/30",
  },
};

const LEVELS = Object.keys(LEVEL_CARD_CONFIG);

const CATEGORY_STYLES = [
  {
    chip: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  {
    chip: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300",
    text: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  {
    chip: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  {
    chip: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  {
    chip: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300",
    text: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  {
    chip: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-300",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    dot: "bg-fuchsia-500",
  },
];

interface LevelStatRow {
  level: string;
  config: LevelConfig;
  total: number;
  learned: number;
}

interface CategoryGroup {
  label: string;
  total: number;
  learned: number;
  levels: LevelStatRow[];
}

export function VocabularyClient() {
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const { words: cachedWords, loading: cacheLoading } = useCachedWords();
  const { todayLearned, streak, dailyGoal, loaded: goalLoaded } = useDailyGoal();
  const t = useT();

  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todayLearned / dailyGoal) * 100)) : 0;

  const wordRefs = useMemo<WordRef[]>(
    () =>
      cachedWords.map((w) => ({
        id: w.id,
        word: w.word,
        level: w.level,
        category: w.category,
      })),
    [cachedWords]
  );

  const categoryLabel = useMemo(() => {
    const cats = new Set(wordRefs.map((r) => r.category || "Oxford5000"));
    if (cats.has("Oxford3000") || cats.has("Oxford5000")) return "Oxford 5000";
    if (wordRefs.length === 0) return "Oxford 5000";
    const counts = new Map<string, number>();
    for (const ref of wordRefs) {
      const cat = ref.category || "Oxford5000";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    return dominant ? formatCategoryLabel(dominant) : "Oxford 5000";
  }, [wordRefs]);

  const categories = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, { label: string; total: number; learned: number; levels: LevelStatRow[] }>();
    for (const ref of wordRefs) {
      const cat = ref.category || "Oxford 5000";
      const entry = map.get(cat) ?? {
        label: formatCategoryLabel(cat),
        total: 0,
        learned: 0,
        levels: LEVELS.map((lv) => ({
          level: lv,
          config: LEVEL_CARD_CONFIG[lv],
          total: 0,
          learned: 0,
        })),
      };
      entry.total++;
      if (learnedIds.has(String(ref.id))) entry.learned++;
      const levelRow = entry.levels.find((l) => l.level === ref.level);
      if (levelRow) {
        levelRow.total++;
        if (learnedIds.has(String(ref.id))) levelRow.learned++;
      }
      map.set(cat, entry);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .map((entry) => ({
        ...entry,
        levels: entry.levels.filter((l) => l.total > 0),
      }));
  }, [wordRefs, learnedIds]);

  const totalWords = wordRefs.length;
  const totalLearned = wordRefs.filter((ref) => learnedIds.has(String(ref.id))).length;
  const overallPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const levelCount = new Set(wordRefs.map((r) => r.level || "A1")).size;
  const loaded = !cacheLoading && learnedLoaded;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* <div className="fixed inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-10%,#ffffff_0%,#f5f5f7_45%,#ececf0_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_-10%,#18181b_0%,#101012_45%,#09090b_100%)]" /> */}

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Left rail: overview */}
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 lg:self-start">
              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="p-5 sm:p-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      {t(categoryLabel, `${categoryLabel} · English ↔ Bangla`)}
                    </div>
                    <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("শব্দভাণ্ডার", "Vocabulary")}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {t(
                        "একটি লেভেল বেছে নিন এর শব্দগুলো দেখা শুরু করতে এবং ফ্লুয়েন্সির পথে যা শিখেছেন তা ট্র্যাক করুন।",
                        "Pick a level to start browsing its words and track what you've learned on the way to fluency."
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-y border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                    <div className="relative h-14 w-14 shrink-0">
                      <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
                        <circle
                          cx="26"
                          cy="26"
                          r={RING_RADIUS}
                          fill="none"
                          strokeWidth="5"
                          className="stroke-black/[0.06] dark:stroke-white/[0.08]"
                        />
                        <motion.circle
                          cx="26"
                          cy="26"
                          r={RING_RADIUS}
                          fill="none"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={RING_LENGTH}
                          initial={{ strokeDashoffset: RING_LENGTH }}
                          animate={{ strokeDashoffset: RING_LENGTH * (1 - (loaded ? overallPct : 0) / 100) }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="stroke-orange-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {loaded ? `${overallPct}%` : "…"}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {t("সামগ্রিক অগ্রগতি", "Overall progress")}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {loaded ? (
                          <>
                            {totalLearned}
                            <span className="font-normal text-zinc-400"> / {totalWords}</span>
                          </>
                        ) : (
                          "…"
                        )}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        {t("শব্দ শেখা হয়েছে", "words learned")}
                      </p>
                    </div>
                  </div>

                  <StaggerContainer className="grid grid-cols-2 overflow-hidden">
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={LibraryBig}
                        labelEn="Words"
                        labelBn="শব্দ"
                        value={cacheLoading ? "…" : `${totalWords}`}
                        subEn="across all categories"
                        subBn="সব বিভাগ মিলিয়ে"
                        tint="text-orange-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Layers}
                        labelEn="Categories"
                        labelBn="বিভাগ"
                        value={cacheLoading ? "…" : `${categories.length}`}
                        subEn="word groups"
                        subBn="শব্দের দল"
                        tint="text-sky-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Gauge}
                        labelEn="Levels"
                        labelBn="লেভেল"
                        value={cacheLoading ? "…" : `${levelCount}`}
                        subEn="active levels"
                        subBn="সক্রিয় লেভেল"
                        tint="text-amber-500"
                      />
                    </StaggerItem>
                    <StaggerItem className="border-l border-t border-black/[0.06] dark:border-white/[0.08] [&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0">
                      <StatRow
                        icon={Sparkles}
                        labelEn="Learned"
                        labelBn="শেখা হয়েছে"
                        value={cacheLoading || !learnedLoaded ? "…" : `${overallPct}%`}
                        subEn={`${totalLearned} / ${totalWords}`}
                        subBn={`${totalLearned} / ${totalWords}`}
                        tint="text-emerald-500"
                      />
                    </StaggerItem>
                  </StaggerContainer>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(ICON_CHIP, "text-violet-500")}>
                        <BookOpenCheck className="size-4.5" />
                      </div>
                      <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {t("কুইজ চ্যালেঞ্জ", "Quiz Challenge")}
                      </h2>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {t(
                        "নিজেকে পরীক্ষা করুন আর শেখার ধারা বাড়ান।",
                        "Test yourself and grow your learning streak."
                      )}
                    </p>
                    <Link
                      href="/quiz/vocabulary"
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-medium text-white shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors hover:bg-violet-600 active:bg-violet-600"
                    >
                      <BookOpenCheck className="size-4" />
                      {t("কুইজ দিন", "Take a Quiz")}
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                    <div className={cn(ICON_CHIP, "text-emerald-500")}>
                      <Target className="size-4.5" />
                    </div>
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("দৈনিক লক্ষ্য", "Daily goal")}
                    </h2>
                  </div>

                  <div className="flex divide-x divide-black/[0.06] dark:divide-white/[0.08]">
                    <div className="flex-1 px-5 py-4">
                      <p className="text-lg font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                        {goalLoaded ? `${todayLearned}` : "…"}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        {t("আজ শেখা", "Learned today")}
                      </p>
                    </div>
                    <div className="flex-1 px-5 py-4">
                      <p className="flex items-center gap-1 text-lg font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                        <Flame className="h-4 w-4 text-amber-500" />
                        {goalLoaded ? `${streak}` : "…"}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        {t("দিনের ধারা", "Day streak")}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                      <span>{goalLoaded ? t(`${todayLearned}/${dailyGoal} টি`, `${todayLearned}/${dailyGoal}`) : "\u00A0"}</span>
                      <span>{goalLoaded ? `${goalPct}%` : "\u00A0"}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${goalPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>

            {/* Main column: vocabulary by category */}
            <div className="space-y-4 sm:space-y-6">
              <StaggerItem>
                <section>
                  <div className="mb-4 px-1">
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t("বিভাগ অনুযায়ী শব্দভাণ্ডার", "Vocabulary by category")}
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t(
                        "একটি বিভাগ ও লেভেলে চাপ দিন এর শব্দগুলো দেখতে।",
                        "Tap a category and level to explore its words."
                      )}
                    </p>
                  </div>

                  <StaggerContainer className="space-y-4 sm:space-y-6">
                    {categories.map((group, gi) => {
                      const pct = group.total > 0 ? Math.round((group.learned / group.total) * 100) : 0;
                      const s = CATEGORY_STYLES[gi % CATEGORY_STYLES.length];
                      return (
                        <StaggerItem key={group.label}>
                          <div className={cn(CARD, "overflow-hidden")}>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                              <div className="flex items-center gap-2 min-w-0">
                                {/* <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} /> */}
                                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", s.chip)}>
                                  {group.label}
                                </span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                  {cacheLoading ? "\u00A0" : t(`${group.total}টি শব্দ · ${group.levels.length}টি লেভেল`, `${group.total} words · ${group.levels.length} levels`)}
                                </span>
                              </div>
                              <span className={cn("text-xs font-semibold tabular-nums", s.text)}>
                                {loaded ? `${pct}% ${t("শেখা", "learned")}` : "\u00A0"}
                              </span>
                            </div>

                            <StaggerContainer className="flex flex-col">
                              {group.levels.map(({ level: lv, config: c, total, learned }, li) => {
                                const levelPct = total > 0 ? Math.round((learned / total) * 100) : 0;
                                const ready = loaded;
                                return (
                                  <StaggerItem
                                    key={lv}
                                    className={li > 0 ? "border-t border-black/[0.06] dark:border-white/[0.08]" : ""}
                                  >
                                    <Link
                                      href={`/vocabulary/${lv.toLowerCase()}`}
                                      onClick={() => setSelectedLevel(lv.toUpperCase() as Parameters<typeof setSelectedLevel>[0])}
                                      className={cn(
                                        "group flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 transition-colors",
                                        c.hoverBg
                                      )}
                                    >
{/* <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", c.dot)} /> */}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                      <span className={c.text}>{lv}</span>
                                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                                      {t(c.labelBn, c.label)}
                                    </p>
                                        <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                                          {cacheLoading
                                            ? "\u00A0"
                                            : t(`${total}টি শব্দ · ${learned}টি শেখা`, `${total} words · ${learned} learned`)}
                                        </p>
                                      </div>
                                      <div className="relative hidden h-11 w-11 shrink-0 sm:block">
                                        <svg viewBox="0 0 52 52" className="h-11 w-11 -rotate-90">
                                          <circle
                                            cx="26"
                                            cy="26"
                                            r={RING_RADIUS}
                                            fill="none"
                                            strokeWidth="4"
                                            className="stroke-black/[0.06] dark:stroke-white/[0.08]"
                                          />
                                          <motion.circle
                                            cx="26"
                                            cy="26"
                                            r={RING_RADIUS}
                                            fill="none"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={RING_LENGTH}
                                            initial={{ strokeDashoffset: RING_LENGTH }}
                                            animate={{ strokeDashoffset: RING_LENGTH * (1 - (ready ? levelPct : 0) / 100) }}
                                            transition={{ duration: 0.9, ease: "easeOut" }}
                                            className={c.stroke}
                                          />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">
                                          {ready ? levelPct : "–"}
                                        </span>
                                      </div>
                                      <span className={cn("shrink-0 text-xs font-semibold tabular-nums sm:hidden", c.text)}>
                                        {ready ? `${levelPct}%` : "–"}
                                      </span>
                                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-orange-500 group-active:translate-x-0.5 group-active:text-orange-500" />
</Link>
                              </StaggerItem>
                            );
                          })}
                        </StaggerContainer>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </section>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  labelEn,
  labelBn,
  value,
  subEn,
  subBn,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelBn: string;
  value: string;
  subEn: string;
  subBn: string;
  tint: string;
}) {
  const t = useT();

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className={cn(ICON_CHIP, tint)}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {t(labelBn, labelEn)}
        </p>
        <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
          {value}
        </p>
        <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
          {t(subBn, subEn)}
        </p>
      </div>
    </div>
  );
}