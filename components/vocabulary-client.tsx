"use client";

import Link from "next/link";
import type { Word } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { cn } from "@/lib/utils";

const LEVEL_CARD_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; gradient: string; label: string; solid: string }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    solid: "bg-emerald-500",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    solid: "bg-sky-500",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    solid: "bg-amber-500",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    solid: "bg-rose-500",
  },
};

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export function VocabularyClient({ words }: { words: Word[] }) {
  const { learnedIds, loaded } = useLearnedWords();

  const levelStats = LEVELS.map((level) => {
    const items = words.filter((w) => w.level === level);
    const learned = items.filter((w) => learnedIds.has(`${w.id}|${w.word}`)).length;
    return { level, total: items.length, learned };
  });

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Vocabulary
              </h1>
              <span className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Oxford 3000
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pick a level to start browsing its words.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {levelStats.map(({ level, total, learned }) => {
              const c = LEVEL_CARD_CONFIG[level];
              const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
              return (
                <Link
                  key={level}
                  href={`/${level.toLowerCase()}`}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
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
                  <div className="relative flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          "text-3xl sm:text-4xl font-black bg-gradient-to-br bg-clip-text text-transparent",
                          c.gradient
                        )}
                      >
                        {level}
                      </span>
                      <span className={cn("text-xs font-medium", c.text)}>{c.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {total} words
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">
                          {loaded ? `${learned} learned` : `\u00A0`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                        {loaded ? (
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", c.solid)}
                            style={{ width: `${pct}%` }}
                          />
                        ) : (
                          <div className="h-full w-1/3 rounded-full bg-zinc-300/70 dark:bg-zinc-700 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}