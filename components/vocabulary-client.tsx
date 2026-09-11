"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useCachedWords } from "@/lib/use-cached-words";
import { setSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { formatCategoryLabel } from "@/lib/category";
import type { WordRef } from "@/types/api";

const RING_RADIUS = 22;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface LevelConfig {
  bg: string;
  border: string;
  text: string;
  gradient: string;
  label: string;
  labelBn: string;
  stroke: string;
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
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
    stroke: "stroke-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
    stroke: "stroke-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    stroke: "stroke-rose-500",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
    stroke: "stroke-violet-500",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
    stroke: "stroke-fuchsia-500",
  },
};

const LEVELS = Object.keys(LEVEL_CARD_CONFIG);

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
  const t = useT();


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

  const stats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of cachedWords) {
      map[w.level] = (map[w.level] ?? 0) + 1;
    }
    return map;
  }, [cachedWords]);

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

  const totalWords = Object.values(stats).reduce((sum, n) => sum + n, 0);
  const totalLearned = wordRefs.filter((ref) => learnedIds.has(String(ref.id))).length;
  const overallPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const loaded = !cacheLoading && learnedLoaded;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <section className="relative px-4 pt-10 pb-6 sm:px-6 lg:px-8">

        <div className="max-w-4xl mx-auto relative">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              {t(categoryLabel, `${categoryLabel} · English ↔ Bangla`)}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {t("শব্দভাণ্ডার", "Vocabulary")}
            </h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
              {t(
                "একটি লেভেল বেছে নিন এর শব্দগুলো দেখা শুরু করতে এবং ফ্লুয়েন্সির পথে যা শিখেছেন তা ট্র্যাক করুন।",
                "Pick a level to start browsing its words and track what you've learned on the way to fluency."
              )}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5 max-w-md animate-fade-up-1">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {cacheLoading ? "· · ·" : totalWords}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t("শব্দ", "Words")}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {cacheLoading ? "· · ·" : categories.length}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t("বিভাগ", "Categories")}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-orange-500 tabular-nums">
                {cacheLoading || !learnedLoaded ? "· · ·" : `${overallPct}%`}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{t("শেখা হয়েছে", "Learned")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t("বিভাগ অনুযায়ী শব্দভাণ্ডার", "Vocabulary by category")}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("একটি বিভাগ ও লেভেলে চাপ দিন এর শব্দগুলো দেখতে।", "Tap a category and level to explore its words.")}
            </p>
          </div>

          {categories.map((group) => {
            const pct = group.total > 0 ? Math.round((group.learned / group.total) * 100) : 0;
            return (
              <div key={group.label}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                      {group.label}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {cacheLoading ? "\u00A0" : t(`${group.total}টি শব্দ · ${group.levels.length}টি লেভেল`, `${group.total} words · ${group.levels.length} levels`)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-orange-500 tabular-nums">
                    {loaded ? `${pct}% ${t("শেখা", "learned")}` : "\u00A0"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
                  {group.levels.map(({ level: lv, config: c, total, learned }, i) => {
                    const levelPct = total > 0 ? Math.round((learned / total) * 100) : 0;
                    const ready = loaded;
                    return (
                      <motion.div
                        key={lv}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
                        className="h-full"
                      >
                        <Link
                          href={`/vocabulary/${lv.toLowerCase()}`}
                          onClick={() => setSelectedLevel(lv.toUpperCase() as Parameters<typeof setSelectedLevel>[0])}
                          className={cn(
                            "group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
                            c.border,
                            c.bg
                          )}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-300",
                              c.gradient
                            )}
                          />
                          <div className="relative flex items-center justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <span
                                  className={cn(
                                    "shrink-0 text-2xl sm:text-3xl font-black bg-gradient-to-br bg-clip-text text-transparent",
                                    c.gradient
                                  )}
                                >
                                  {lv}
                                </span>
                                <span
                                  className={cn(
                                    "min-w-0 truncate text-[11px] font-semibold rounded-full border px-2 py-0.5 whitespace-nowrap",
                                    c.text,
                                    c.border,
                                    c.bg
                                  )}
                                >
                                  {t(c.labelBn, c.label)}
                                </span>
                              </div>
                              <div className="mt-2 space-y-0.5">
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                  {cacheLoading ? "\u00A0" : t(`${total}টি শব্দ`, `${total} words`)}
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                                  {ready ? t(`${learned}টি শেখা`, `${learned} learned`) : "\u00A0"}
                                </p>
                              </div>
                            </div>
                            <div className="relative shrink-0">
                              <svg viewBox="0 0 52 52" className="h-12 w-12 sm:h-16 sm:w-16 -rotate-90">
                                <circle
                                  cx="26"
                                  cy="26"
                                  r={RING_RADIUS}
                                  fill="none"
                                  strokeWidth="4"
                                  className="stroke-zinc-200 dark:stroke-zinc-700/70"
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
                                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 + 0.05 * i }}
                                  className={c.stroke}
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">
                                {ready ? levelPct : "–"}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "relative mt-auto flex items-center gap-1 pt-3 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                              c.text
                            )}
                          >
                            {t(`${lv} লেভেল দেখুন`, `Explore ${lv}`)}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}