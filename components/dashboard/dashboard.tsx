"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Flame,
  GraduationCap,
  LibraryBig,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Word } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useLanguage, useT } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import { useLastLearned, type LastLearnedEntry } from "@/lib/last-learned-store";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { LatestPosts, type LatestPost } from "@/components/news/latest-posts";

const LEVEL_META: Record<
  string,
  {
    text: string;
    solid: string;
    gradient: string;
    bg: string;
    border: string;
    labelEn: string;
    labelBn: string;
  }
> = {
  A1: {
    text: "text-emerald-700 dark:text-emerald-300",
    solid: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    labelEn: "Beginner",
    labelBn: "শিক্ষানবিস",
  },
  A2: {
    text: "text-sky-700 dark:text-sky-300",
    solid: "bg-sky-500",
    gradient: "from-sky-500 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    labelEn: "Elementary",
    labelBn: "প্রাথমিক",
  },
  B1: {
    text: "text-amber-700 dark:text-amber-300",
    solid: "bg-amber-500",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    labelEn: "Intermediate",
    labelBn: "মাঝারি",
  },
  B2: {
    text: "text-rose-700 dark:text-rose-300",
    solid: "bg-rose-500",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    labelEn: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
  },
  C1: {
    text: "text-violet-700 dark:text-violet-300",
    solid: "bg-violet-500",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    labelEn: "Advanced",
    labelBn: "উন্নত",
  },
  C2: {
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    solid: "bg-fuchsia-500",
    gradient: "from-fuchsia-500 to-pink-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    labelEn: "Mastery",
    labelBn: "পারদর্শী",
  },
};

const ACTION_CARDS = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    titleEn: "Vocabulary",
    titleBn: "শব্দভাণ্ডার",
    descriptionEn: "Browse words by level and keep learning",
    descriptionBn: "লেভেল অনুযায়ী শব্দ ব্রাউজ করুন এবং শেখা চালিয়ে যান",
    iconClass: "text-orange-500 bg-orange-100 dark:bg-orange-950/60",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    titleEn: "Quiz",
    titleBn: "কুইজ",
    descriptionEn: "Test yourself and grow your streak",
    descriptionBn: "নিজেকে পরীক্ষা করুন এবং ধারা বাড়ান",
    iconClass: "text-sky-500 bg-sky-100 dark:bg-sky-950/60",
  },
  {
    href: "/profile",
    icon: Activity,
    titleEn: "Progress",
    titleBn: "অগ্রগতি",
    descriptionEn: "See your activity and achievements",
    descriptionBn: "আপনার কার্যকলাপ এবং অর্জন দেখুন",
    iconClass: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60",
  },
  {
    href: "/search",
    icon: Search,
    titleEn: "Search",
    titleBn: "অনুসন্ধান",
    descriptionEn: "Look up any word instantly",
    descriptionBn: "যেকোনো শব্দ তাৎক্ষণিক খুঁজুন",
    iconClass: "text-violet-500 bg-violet-100 dark:bg-violet-950/60",
  },
];

interface GreetingText {
  bn: string;
  en: string;
}

function getGreeting(): GreetingText {
  const h = new Date().getHours();
  if (h < 5 || h >= 21) return { bn: "শুভ রাত্রি", en: "Good night" };
  if (h < 12) return { bn: "শুভ সকাল", en: "Good morning" };
  if (h < 17) return { bn: "শুভ বিকাল", en: "Good afternoon" };
  return { bn: "শুভ সন্ধ্যা", en: "Good evening" };
}

export function Dashboard({ words, posts }: { words: Word[]; posts: LatestPost[] }) {
  const t = useT();
  const { lang } = useLanguage();
  const userName = useAuthStore((s) => s.userName);
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const { entry: lastLearned, hydrated: lastLearnedHydrated } = useLastLearned();
  const { todayLearned, streak, dailyGoal, loaded: goalLoaded } = useDailyGoal();

  const greeting = getGreeting();
  const totalLearned = learnedIds.size;
  const totalWords = words.length;
  const overallPct = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const goalPct =
    dailyGoal > 0 ? Math.min(100, Math.round((todayLearned / dailyGoal) * 100)) : 0;

  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return new Date().toDateString();
    }
  }, [lang]);

  const firstName = userName?.trim().split(/\s+/)[0] ?? null;
  const greetingFull = firstName
    ? t(`${greeting.bn}, ${firstName}`, `${greeting.en}, ${firstName}`)
    : t(greeting.bn, greeting.en);

  const ready = learnedLoaded;
  const statsReady = ready && goalLoaded;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          {/* Header: greeting + overall progress */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/70 dark:border-orange-800/60 bg-orange-50/80 dark:bg-orange-950/40 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-300">
                <Sparkles className="h-3.5 w-3.5" />
                {t("আপনার শেখার ড্যাশবোর্ড", "Your learning dashboard")}
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {greetingFull}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{dateLabel}</p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-4 sm:px-5 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
              <div className="relative h-20 w-20 shrink-0">
                <ProgressRing pct={ready ? overallPct : 0} size={80} stroke={7} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {ready ? `${overallPct}%` : "…"}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t("সামগ্রিক অগ্রগতি", "Overall progress")}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {ready ? (
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
          </header>

          {/* Continue learning */}
          <ContinueLearningCard
            lastLearned={lastLearnedHydrated ? lastLearned : null}
            loaded={learnedLoaded}
            learnedIds={learnedIds}
            words={words}
          />

          {/* Daily stats */}
          <section>
            <SectionHeading
              icon={Target}
              iconClass="text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60"
              titleEn="Daily activity"
              titleBn="দৈনিক কার্যকলাপ"
              descriptionEn="Keep your learning streak alive today"
              descriptionBn="আজ আপনার শেখার ধারা ধরে রাখুন"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile
                icon={GraduationCap}
                labelEn="Words learned"
                labelBn="শব্দ শেখা হয়েছে"
                value={ready ? `${totalLearned}` : "…"}
                subEn={`of ${totalWords} total`}
                subBn={`মোট ${totalWords}টির মধ্যে`}
                iconClass="text-orange-500 bg-orange-100 dark:bg-orange-950/60"
              />
              <StatTile
                icon={Sparkles}
                labelEn="Today's words"
                labelBn="আজ শেখা শব্দ"
                value={statsReady ? `${todayLearned}` : "…"}
                subEn={dailyGoal > 0 ? `daily goal ${dailyGoal}` : "set a daily goal"}
                subBn={
                  dailyGoal > 0 ? `দৈনিক লক্ষ্য ${dailyGoal}` : "দৈনিক লক্ষ্য নির্ধারণ করুন"
                }
                iconClass="text-sky-500 bg-sky-100 dark:bg-sky-950/60"
              />
              <StatTile
                icon={Flame}
                labelEn="Day streak"
                labelBn="দিনের ধারা"
                value={statsReady ? `${streak}` : "…"}
                subEn="days in a row"
                subBn="টানা কত দিন"
                iconClass="text-amber-500 bg-amber-100 dark:bg-amber-950/60"
              />
              <StatTile
                icon={Target}
                labelEn="Daily goal"
                labelBn="দৈনিক লক্ষ্য"
                value={statsReady ? `${goalPct}%` : "…"}
                subEn={`${todayLearned} of ${dailyGoal} words`}
                subBn={`${dailyGoal}টির মধ্যে ${todayLearned}টি`}
                iconClass="text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60"
              />
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <SectionHeading
              icon={Sparkles}
              iconClass="text-orange-500 bg-orange-100 dark:bg-orange-950/60"
              titleEn="Explore"
              titleBn="এক্সপ্লোর করুন"
              descriptionEn="Everything you need to keep learning, in one place"
              descriptionBn="শেখা চালিয়ে যেতে প্রয়োজনীয় সব কিছু এক জায়গায়"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {ACTION_CARDS.map(
                ({ href, icon: Icon, titleEn, titleBn, descriptionEn, descriptionBn, iconClass }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/30 hover:-translate-y-0.5 hover:border-zinc-300/80 dark:hover:border-zinc-700/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", iconClass)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-400 transition-all group-hover:border-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {t(titleBn, titleEn)}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-1">
                      {t(descriptionBn, descriptionEn)}
                    </p>
                  </Link>
                )
              )}
            </div>
          </section>

          <LatestPosts posts={posts} />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  iconClass,
  titleEn,
  titleBn,
  descriptionEn,
  descriptionBn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
}) {
  const t = useT();

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconClass)}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t(titleBn, titleEn)}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t(descriptionBn, descriptionEn)}</p>
      </div>
    </div>
  );
}

function ProgressRing({
  pct,
  size,
  stroke,
  gradientId,
  from,
  to,
}: {
  pct: number;
  size: number;
  stroke: number;
  gradientId?: string;
  from?: string;
  to?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;
  const id = gradientId ?? "dashboard-ring-gradient";
  const colorFrom = from ?? "#f97316";
  const colorTo = to ?? "#e11d48";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none stroke-zinc-200/80 dark:stroke-zinc-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        stroke={`url(#${id})`}
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="fill-none transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function ContinueLearningCard({
  lastLearned,
  loaded,
  learnedIds,
  words,
}: {
  lastLearned: LastLearnedEntry | null;
  loaded: boolean;
  learnedIds: Set<string>;
  words: Word[];
}) {
  const t = useT();

  const targetLevel = lastLearned?.level ?? "A1";
  const meta = LEVEL_META[targetLevel] ?? LEVEL_META.A1;
  const levelWords = words.filter((w) => w.level === targetLevel);
  const learned = levelWords.filter((w) => learnedIds.has(String(w.id))).length;
  const pct = levelWords.length > 0 ? Math.round((learned / levelWords.length) * 100) : 0;
  const levelPath = `/vocabulary/${targetLevel.toLowerCase()}`;
  const href =
    lastLearned && lastLearned.page > 1 ? `${levelPath}/${lastLearned.page}` : levelPath;

  return (
    <section>
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("শেখা চালিয়ে যান", "Continue Learning")}
              </h2>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.bg, meta.text)}>
                {targetLevel}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {lastLearned
                ? t(
                    `লেভেল ${targetLevel} · পৃষ্ঠা ${lastLearned.page}`,
                    `Level ${targetLevel} · Page ${lastLearned.page}`
                  )
                : t("একটি লেভেল বেছে নিয়ে শেখা শুরু করুন।", "Pick a level and start learning.")}
            </p>
            <div className="mt-3 flex items-center gap-3 max-w-sm">
              <div className="h-2 flex-1 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                {loaded ? (
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", meta.gradient)}
                    style={{ width: `${pct}%` }}
                  />
                ) : (
                  <div className="h-full w-1/3 rounded-full bg-zinc-300/70 dark:bg-zinc-700 animate-pulse" />
                )}
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                {loaded ? `${learned}/${levelWords.length}` : "\u00A0"}
              </span>
            </div>
          </div>

          <Button
            asChild
            className="shrink-0 gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 h-10 text-sm font-medium shadow-lg shadow-orange-500/20"
          >
            <Link href={href}>
              {lastLearned ? t("চালিয়ে যান", "Continue") : t("শেখা শুরু করুন", "Start Learning")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StatTile({
  icon: Icon,
  labelEn,
  labelBn,
  value,
  subEn,
  subBn,
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelBn: string;
  value: string;
  subEn: string;
  subBn: string;
  iconClass: string;
}) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconClass)}>
        <Icon className="size-4.5" />
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(labelBn, labelEn)}</p>
      <p className="mt-0.5 text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{t(subBn, subEn)}</p>
    </div>
  );
}