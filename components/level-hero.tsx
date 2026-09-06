"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Word } from "@/lib/data";
import { useLearnedWords } from "@/lib/use-learned-words";
import { cn } from "@/lib/utils";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

const RING_RADIUS = 30;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

interface LevelHeroProps {
  level: string;
  label: string;
  gradient: string;
  text: string;
  bg: string;
  border: string;
  solid: string;
  stroke: string;
  words: Word[];
}

export function LevelHero({
  level,
  label,
  gradient,
  text,
  bg,
  border,
  solid,
  stroke,
  words,
}: LevelHeroProps) {
  const { learnedIds, loaded } = useLearnedWords();
  const learned = words.filter((w) => learnedIds.has(String(w.id))).length;
  const pct = words.length > 0 ? Math.round((learned / words.length) * 100) : 0;

  return (
    <section className="relative">

      <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <Link
          href="/vocabulary"
          className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to levels
        </Link>

        <div className="mt-7 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-up">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                text,
                border,
                bg
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {label} &middot; Oxford 3000
            </span>
            <h1
              className={cn(
                "mt-4 text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent",
                gradient
              )}
            >
              {level}
            </h1>
            <p className="mt-3 max-w-md text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
              Master {words.length} essential English words with Bangla meanings, examples,
              synonyms and antonyms &mdash; one level at a time.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-5 animate-fade-up-1">
            <div className="relative shrink-0">
              <svg viewBox="0 0 72 72" className="h-28 w-28 sm:h-32 sm:w-32 -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="6"
                  className="stroke-zinc-200 dark:stroke-zinc-700/70"
                />
                <motion.circle
                  cx="36"
                  cy="36"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_LENGTH}
                  initial={{ strokeDashoffset: RING_LENGTH }}
                  animate={{ strokeDashoffset: RING_LENGTH * (1 - (loaded ? pct : 0) / 100) }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className={stroke}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black tabular-nums">{loaded ? pct : "…"}%</span>
                <span className="text-[10px] font-medium text-zinc-400">learned</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold leading-none tabular-nums">
                  {loaded ? learned : "·"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">of {words.length} words</p>
              </div>
              <div className="h-1.5 w-36 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800">
                <motion.div
                  className={cn("h-full rounded-full", solid)}
                  initial={{ width: 0 }}
                  animate={{ width: loaded ? `${pct}%` : "0%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <p className="flex items-center gap-1 text-[11px] text-zinc-400">
                <CheckCircle2 className="h-3 w-3" /> keep it going
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}