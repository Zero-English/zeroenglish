"use client";

import Link from "next/link";
import type { Word } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { Button } from "@/components/ui/button";
import { LibraryBig, BookOpenCheck, Search, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<
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

const FEATURES = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    title: "Vocabulary",
    description: "Browse all 3000 words, filter by level, and track what you've learned.",
    iconClass: "text-orange-500 bg-orange-100 dark:bg-orange-950/60",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    title: "Daily Quiz",
    description: "Test yourself with quick quizzes and build a daily learning streak.",
    iconClass: "text-sky-500 bg-sky-100 dark:bg-sky-950/60",
  },
  {
    href: "/search",
    icon: Search,
    title: "Search",
    description: "Look up any word instantly — meaning, definition, and examples in one place.",
    iconClass: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60",
  },
];

export function HomeContent({ words }: { words: Word[] }) {
  const { learnedIds, loaded } = useLearnedWords();

  const levelStats = LEVELS.map((level) => {
    const items = words.filter((w) => w.level === level);
    const learned = items.filter((w) => learnedIds.has(`${w.id}|${w.word}`)).length;
    return { level, label: LEVEL_CONFIG[level].label, total: items.length, learned };
  });

  const totalLearned = levelStats.reduce((sum, s) => sum + s.learned, 0);
  const overallPct = words.length > 0 ? Math.round((totalLearned / words.length) * 100) : 0;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-14 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              Oxford 3000 &middot; English &harr; Bangla
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Master English,
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                word by word.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-8">
              The complete Oxford 3000 word list with Bangla meanings. Pick your level,
              learn new words, and track your progress every day.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Button
                asChild
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
              >
                <Link href="/vocabulary">
                  Start Learning
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium"
              >
                <Link href="/quiz">Take a Quiz</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {words.length}
                </p>
                <p className="text-xs text-zinc-400">Words</p>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {LEVELS.length}
                </p>
                <p className="text-xs text-zinc-400">Levels</p>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-2.5">
                <p className="text-2xl font-bold text-orange-500 tabular-nums">
                  {loaded ? `${overallPct}%` : "· · ·"}
                </p>
                <p className="text-xs text-zinc-400">Learned</p>
              </div>
            </div>
          </section>

          <section className="mb-14">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Pick your level
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Each level covers the words you need to move forward.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {levelStats.map(({ level, label, total, learned }) => {
                const c = LEVEL_CONFIG[level];
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
                        <span className={cn("text-xs font-medium", c.text)}>{label}</span>
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
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Everything you need
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Three simple tools to keep you learning.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {FEATURES.map(({ href, icon: Icon, title, description, iconClass }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      iconClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}