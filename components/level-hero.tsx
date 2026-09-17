"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { type Word } from "@/lib/data";
import { mainCategoryLabel } from "@/lib/category";
import { useLearnedWords } from "@/lib/use-learned-words";
import { setSelectedLevel } from "@/lib/level-store";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { ArrowLeft, GraduationCap, Target, Sparkles, CircleDashed } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/stagger";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const LEVEL_RING: Record<string, { from: string; to: string }> = {
  A1: { from: "#34d399", to: "#10b981" },
  A2: { from: "#38bdf8", to: "#3b82f6" },
  B1: { from: "#fbbf24", to: "#f97316" },
  B2: { from: "#fb7185", to: "#ec4899" },
  C1: { from: "#a78bfa", to: "#a855f7" },
  C2: { from: "#e879f9", to: "#ec4899" },
};

interface LevelHeroProps {
  level: string;
  label: string;
  labelBn: string;
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
  labelBn,
  gradient,
  text,
  bg,
  border,
  words,
}: LevelHeroProps) {
  const { learnedIds, loaded } = useLearnedWords();
  const t = useT();
  const learned = words.filter((w) => learnedIds.has(String(w.id))).length;
  const pct = words.length > 0 ? Math.round((learned / words.length) * 100) : 0;
  const remaining = Math.max(0, words.length - learned);
  const category = mainCategoryLabel(words);
  const categories = new Set(words.map((w) => w.category).filter(Boolean)).size;

  return (
    <section className="relative">
      <div className="relative mx-auto max-w-4xl pt-8 pb-6 px-4 sm:px-6 lg:px-0">
        <Link
          href="/vocabulary"
          onClick={() => setSelectedLevel(null)}
          className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 active:text-zinc-600 dark:hover:text-zinc-300 dark:active:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {t("লেভেল তালিকায় ফিরুন", "Back to levels")}
        </Link>

        <StaggerContainer className="relative mt-4">
          <StaggerItem>
            <div className={cn(CARD, "overflow-hidden")}>
              <span
                className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", gradient)}
                aria-hidden
              />

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      text,
                      border,
                      bg
                    )}
                  >
                    {level}
                  </span>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {category}
                  </p>
                </div>
                <h1 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {level}
                  <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
                  {t(labelBn, label)}
                </h1>
              </div>

              <div className="flex items-center gap-4 border-y border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                <div className="relative h-14 w-14 shrink-0">
                  <ProgressRing pct={loaded ? pct : 0} size={56} stroke={5.5} level={level} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {loaded ? `${pct}%` : "…"}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t("এই লেভেলের অগ্রগতি", "Level progress")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {loaded ? (
                      <>
                        {learned}
                        <span className="font-normal text-zinc-400"> / {words.length}</span>
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

              <div className="grid grid-cols-2 overflow-hidden">
                <StatRow
                  icon={GraduationCap}
                  labelEn="Words learned"
                  labelBn="শব্দ শেখা হয়েছে"
                  value={loaded ? `${learned}` : "…"}
                  subEn={`of ${words.length} total`}
                  subBn={`মোট ${words.length}টির মধ্যে`}
                  tint="text-orange-500"
                />
                <StatRow
                  icon={CircleDashed}
                  labelEn="Remaining"
                  labelBn="বাকি আছে"
                  value={loaded ? `${remaining}` : "…"}
                  subEn="words to go"
                  subBn="পড়ে আছে যতটি"
                  tint="text-sky-500"
                />
                <StatRow
                  icon={Target}
                  labelEn="Progress"
                  labelBn="অগ্রগতি"
                  value={loaded ? `${pct}%` : "…"}
                  subEn="of this level"
                  subBn={`${level} লেভেলের`}
                  tint="text-violet-500"
                />
                <StatRow
                  icon={Sparkles}
                  labelEn="Categories"
                  labelBn="বিষয়"
                  value={`${categories}`}
                  subEn="topics in this level"
                  subBn={`${level} লেভেলে যত বিষয়`}
                  tint="text-emerald-500"
                />
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProgressRing({
  pct,
  size,
  stroke,
  level,
}: {
  pct: number;
  size: number;
  stroke: number;
  level: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  const id = `level-ring-${level}`;
  const { from, to } = LEVEL_RING[level.toUpperCase()] ?? LEVEL_RING.A1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none stroke-black/[0.06] dark:stroke-white/[0.08]"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        stroke={`url(#${id})`}
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="fill-none"
      />
    </svg>
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
    <div
      className={cn(
        "flex items-center gap-3 border-l border-t px-5 py-4 border-black/[0.06] dark:border-white/[0.08]",
        "[&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0"
      )}
    >
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