"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
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
import type { LeaderboardRow } from "@/components/leaderboard";
import { TopLearners } from "@/components/top-learners";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const BTN_PRIMARY =
  "shrink-0 gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)] transition-colors";

const BTN_VIOLET =
  "shrink-0 gap-2 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors";

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
    iconClass: "text-orange-500 bg-orange-500/10",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    titleEn: "Quiz",
    titleBn: "কুইজ",
    descriptionEn: "Test yourself and grow your streak",
    descriptionBn: "নিজেকে পরীক্ষা করুন এবং ধারা বাড়ান",
    iconClass: "text-sky-500 bg-sky-500/10",
  },
  {
    href: "/profile",
    icon: Activity,
    titleEn: "Progress",
    titleBn: "অগ্রগতি",
    descriptionEn: "See your activity and achievements",
    descriptionBn: "আপনার কার্যকলাপ এবং অর্জন দেখুন",
    iconClass: "text-emerald-500 bg-emerald-500/10",
  },
  {
    href: "/search",
    icon: Search,
    titleEn: "Search",
    titleBn: "অনুসন্ধান",
    descriptionEn: "Look up any word instantly",
    descriptionBn: "যেকোনো শব্দ তাৎক্ষণিক খুঁজুন",
    iconClass: "text-violet-500 bg-violet-500/10",
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

export function Dashboard({
  words,
  posts,
  leaderboard,
}: {
  words: Word[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
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

  const firstName = userName;
  const greetingFull = firstName
    ? t(`${greeting.bn}, ${firstName}`, `${greeting.en}, ${firstName}`)
    : t(greeting.bn, greeting.en);

  const ready = learnedLoaded;
  const statsReady = ready && goalLoaded;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* <div className="fixed inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-10%,#ffffff_0%,#f5f5f7_45%,#ececf0_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_-10%,#18181b_0%,#101012_45%,#09090b_100%)]" /> */}

      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-6xl">
          <div className="grid md:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Left rail: overview */}
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 lg:self-start">
              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      {dateLabel}
                    </p>
                    <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {greetingFull}
                    </h1>
                  </div>

                  <div className="flex items-center gap-4 border-y border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4">
                    <div className="relative h-14 w-14 shrink-0">
                      <ProgressRing pct={ready ? overallPct : 0} size={56} stroke={5.5} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
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

                  <div className="grid grid-cols-2 overflow-hidden">
                    <StatRow
                      icon={GraduationCap}
                      labelEn="Words learned"
                      labelBn="শব্দ শেখা হয়েছে"
                      value={ready ? `${totalLearned}` : "…"}
                      subEn={`of ${totalWords} total`}
                      subBn={`মোট ${totalWords}টির মধ্যে`}
                      tint="text-orange-500"
                    />
                    <StatRow
                      icon={Sparkles}
                      labelEn="Today's words"
                      labelBn="আজ শেখা শব্দ"
                      value={statsReady ? `${todayLearned}` : "…"}
                      subEn={dailyGoal > 0 ? `daily goal ${dailyGoal}` : "set a daily goal"}
                      subBn={
                        dailyGoal > 0 ? `দৈনিক লক্ষ্য ${dailyGoal}` : "দৈনিক লক্ষ্য নির্ধারণ করুন"
                      }
                      tint="text-sky-500"
                    />
                    <StatRow
                      icon={Flame}
                      labelEn="Day streak"
                      labelBn="দিনের ধারা"
                      value={statsReady ? `${streak}` : "…"}
                      subEn="days in a row"
                      subBn="টানা কত দিন"
                      tint="text-amber-500"
                    />
                    <StatRow
                      icon={Target}
                      labelEn="Daily goal"
                      labelBn="দৈনিক লক্ষ্য"
                      value={statsReady ? `${goalPct}%` : "…"}
                      subEn={`${todayLearned} of ${dailyGoal} words`}
                      subBn={`${dailyGoal}টির মধ্যে ${todayLearned}টি`}
                      tint="text-emerald-500"
                    />
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem className="hidden lg:block">
                <TopLearners rows={leaderboard} showHeader />
              </StaggerItem>
            </div>

            {/* Main column */}
            <div className="space-y-4 sm:space-y-6">
              <StaggerItem>
                <div className={cn(CARD, "overflow-hidden")}>
                  {/* Quiz challenge */}
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {t("কুইজ চ্যালেঞ্জ", "Quiz Challenge")}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {t("নিজেকে পরীক্ষা করুন আর ধারা বাড়ান", "Test yourself and grow your streak")}
                      </p>
                    </div>
                    <Button
                      asChild
                      className={cn(BTN_VIOLET, "self-start sm:self-auto")}
                    >
                      <Link href="/quiz">
                        <BookOpenCheck className="size-4" />
                        {t("কুইজ দিন", "Take a Quiz")}
                      </Link>
                    </Button>
                  </div>

                  {/* Continue learning */}
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <ContinueLearningContent
                      lastLearned={lastLearnedHydrated ? lastLearned : null}
                      loaded={learnedLoaded}
                      learnedIds={learnedIds}
                      words={words}
                    />
                  </div>

                  {/* Explore dock tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {ACTION_CARDS.map(
                      ({ href, icon: Icon, titleEn, titleBn, descriptionEn, descriptionBn, iconClass }) => (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "group flex flex-col gap-3 p-5 sm:p-6 transition-colors",
                            "border-l border-t border-black/[0.06] dark:border-white/[0.08]",
                            "[&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0",
                            "hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
                              iconClass
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {t(titleBn, titleEn)}
                            </h3>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {t(descriptionBn, descriptionEn)}
                            </p>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem className="lg:hidden">
                <TopLearners rows={leaderboard} showHeader />
              </StaggerItem>

              <StaggerItem>
                <LatestPosts posts={posts} />
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
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
        className="fill-none stroke-black/[0.06] dark:stroke-white/[0.08]"
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

function ContinueLearningContent({
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
    <>
      <div className="min-w-0 flex-1">
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
          <div className="h-1.5 flex-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] overflow-hidden">
            {loaded ? (
              <div
                className={cn("h-full rounded-full transition-all duration-500", meta.solid)}
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
        className={cn(BTN_PRIMARY, "self-start sm:self-auto")}
      >
        <Link href={href}>
          {lastLearned ? t("চালিয়ে যান", "Continue") : t("শেখা শুরু করুন", "Start Learning")}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </>
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