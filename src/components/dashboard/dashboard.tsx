"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Flame,
  GraduationCap,
  LibraryBig,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, useT } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import {
  useLastLearned,
  type LastLearnedEntry,
} from "@/lib/last-learned-store";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { requestGoogleLogin } from "@/lib/login-required";
import { LatestPosts, type LatestPost } from "@/components/news/latest-posts";
import { DailyRoutineSection } from "@/components/daily-routine-section";
import type { LevelStatItem } from "@/lib/data";

// DESIGNS.md Surface & Geometry Tokens (Clean, Calm, Restrained)
const CARD =
  "rounded-[24px] sm:rounded-[26px] border border-black/[0.06] bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e]";

const INSET = "rounded-[18px] bg-[#f1f1ef] p-4 sm:p-5 dark:bg-[#252528]";

const BTN_PRIMARY =
  "inline-flex h-10 sm:h-11 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-full bg-[#1c1c1e] px-5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-[0.98] dark:bg-white dark:text-[#1c1c1e] dark:hover:bg-zinc-200";

const BTN_SECONDARY =
  "inline-flex h-10 sm:h-11 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 text-xs sm:text-sm font-semibold text-[#242423] shadow-2xs transition-all duration-150 hover:bg-zinc-50 active:scale-[0.98] dark:border-white/[0.1] dark:bg-[#1c1c1e] dark:text-[#f4f4f5] dark:hover:bg-[#2c2c30]";

const LEVEL_META: Record<
  string,
  {
    text: string;
    solid: string;
    bg: string;
    labelEn: string;
    labelBn: string;
  }
> = {
  A1: {
    text: "text-emerald-700 dark:text-emerald-300",
    solid: "bg-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    labelEn: "Beginner",
    labelBn: "শিক্ষানবিস",
  },
  A2: {
    text: "text-sky-700 dark:text-sky-300",
    solid: "bg-sky-500",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    labelEn: "Elementary",
    labelBn: "প্রাথমিক",
  },
  B1: {
    text: "text-amber-700 dark:text-amber-300",
    solid: "bg-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    labelEn: "Intermediate",
    labelBn: "মাঝারি",
  },
  B2: {
    text: "text-rose-700 dark:text-rose-300",
    solid: "bg-rose-500",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    labelEn: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
  },
  C1: {
    text: "text-violet-700 dark:text-violet-300",
    solid: "bg-violet-500",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    labelEn: "Advanced",
    labelBn: "উন্নত",
  },
  C2: {
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    solid: "bg-fuchsia-500",
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
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
    descriptionEn: "Oxford A1-C1 levels",
    descriptionBn: "লেভেল অনুযায়ী শব্দ",
    iconTint: "text-amber-600 dark:text-amber-400",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    titleEn: "Quiz Lab",
    titleBn: "কুইজ ল্যাব",
    descriptionEn: "Practice & recall drills",
    descriptionBn: "পরীক্ষা ও অনুশীলন",
    iconTint: "text-sky-600 dark:text-sky-400",
  },
  {
    href: "/profile",
    icon: Activity,
    titleEn: "Progress",
    titleBn: "অগ্রগতি",
    descriptionEn: "Activity & milestones",
    descriptionBn: "কার্যকলাপ ও অর্জন",
    iconTint: "text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/search",
    icon: Search,
    titleEn: "Dictionary",
    titleBn: "অনুসন্ধান",
    descriptionEn: "Look up any word",
    descriptionBn: "যেকোনো শব্দ খুঁজুন",
    iconTint: "text-violet-600 dark:text-violet-400",
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
  levelStats = [],
  posts,
}: {
  levelStats?: LevelStatItem[];
  posts: LatestPost[];
}) {
  const t = useT();
  const { lang } = useLanguage();
  const userName = useAuthStore((s) => s.userName);
  const { learnedIds, loaded: learnedLoaded } = useLearnedWords();
  const { entry: lastLearned, hydrated: lastLearnedHydrated } =
    useLastLearned();
  const {
    todayLearned,
    streak,
    dailyGoal,
    loaded: goalLoaded,
  } = useDailyGoal();

  const greeting = getGreeting();
  const totalLearned = learnedIds.size;
  const totalWords = levelStats.reduce((sum, s) => sum + s.count, 0) || 5000;
  const overallPct =
    totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const goalPct =
    dailyGoal > 0
      ? Math.min(100, Math.round((todayLearned / dailyGoal) * 100))
      : 0;

  const dateLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
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
    <div className="relative min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5]">
      <div className="relative px-3 py-5 sm:px-6 sm:py-8 lg:px-8 max-w-6xl mx-auto">
        <StaggerContainer>
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* Left Rail: Clean Overview Card (App Hero Left) */}
            <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-6 lg:self-start">
              <StaggerItem>
                <div className={cn(CARD, "space-y-3.5")}>
                  {/* Sunken Inset Header */}
                  <div className={cn(INSET, "space-y-4")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-[#242423]/45 dark:text-zinc-400 truncate">
                          {dateLabel}
                        </p>
                        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5] truncate">
                          {greetingFull}
                        </h1>
                      </div>

                      {/* Clean Streak Pill */}
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#242423] shadow-2xs dark:bg-[#1c1c1e] dark:text-[#f4f4f5]">
                        <Flame className="size-3.5 text-amber-500 fill-amber-500" />
                        <span>{statsReady ? `${streak}d` : "…"}</span>
                      </span>
                    </div>

                    {/* Overall Progress Row */}
                    <div className="flex items-center gap-3.5 rounded-[14px] bg-white p-3 shadow-2xs dark:bg-[#1c1c1e]">
                      <div className="relative size-12 shrink-0">
                        <ProgressRing
                          pct={ready ? overallPct : 0}
                          size={48}
                          stroke={5}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-bold tabular-nums text-[#1c1c1e] dark:text-zinc-100">
                            {ready ? `${overallPct}%` : "…"}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[#242423]/55 dark:text-zinc-400">
                          {t("সামগ্রিক অগ্রগতি", "Overall progress")}
                        </p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums text-[#1c1c1e] dark:text-zinc-100">
                          {ready ? (
                            <>
                              {totalLearned.toLocaleString()}
                              <span className="font-normal text-[#242423]/45 dark:text-zinc-500">
                                {" "}
                                / {totalWords.toLocaleString()}{" "}
                                {t("শব্দ", "words")}
                              </span>
                            </>
                          ) : (
                            "…"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2x2 Sunken Metric Tiles */}
                  <div className="grid grid-cols-2 gap-2">
                    <StatTile
                      icon={GraduationCap}
                      labelEn="Learned"
                      labelBn="শেখা শব্দ"
                      value={ready ? `${totalLearned}` : "…"}
                      subEn={`of ${totalWords}`}
                      subBn={`মোট ${totalWords}`}
                      tint="text-amber-600 dark:text-amber-400"
                    />
                    <StatTile
                      icon={Sparkles}
                      labelEn="Today"
                      labelBn="আজকের শব্দ"
                      value={statsReady ? `${todayLearned}` : "…"}
                      subEn={dailyGoal > 0 ? `goal ${dailyGoal}` : "no goal"}
                      subBn={
                        dailyGoal > 0 ? `লক্ষ্য ${dailyGoal}` : "লক্ষ্য নেই"
                      }
                      tint="text-sky-600 dark:text-sky-400"
                    />
                    <StatTile
                      icon={Flame}
                      labelEn="Streak"
                      labelBn="ধারাবাহিকতা"
                      value={statsReady ? `${streak}d` : "…"}
                      subEn="days in a row"
                      subBn="টানা দিন"
                      tint="text-orange-600 dark:text-orange-400"
                    />
                    <StatTile
                      icon={Target}
                      labelEn="Daily goal"
                      labelBn="দৈনিক লক্ষ্য"
                      value={statsReady ? `${goalPct}%` : "…"}
                      subEn={`${todayLearned}/${dailyGoal} words`}
                      subBn={`${todayLearned}/${dailyGoal} শব্দ`}
                      tint="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </StaggerItem>

              {/* Minimal Daily Routine Tracker (Left Side) */}
              <StaggerItem>
                <DailyRoutineSection />
              </StaggerItem>
            </div>

            {/* Right Rail: Action Modules & Navigation */}
            <div className="space-y-4 sm:space-y-5">
              <StaggerItem>
                <div className={cn(CARD, "space-y-3.5")}>
                  {/* Module 1: Daily Practice Blitz */}
                  <div
                    className={cn(
                      INSET,
                      "flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-white text-amber-600 shadow-2xs dark:bg-[#1c1c1e] dark:text-amber-400">
                          <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                        </span>
                        <h2 className="text-[15px] sm:text-base font-bold tracking-tight text-[#1c1c1e] dark:text-zinc-100">
                          {t(
                            "ব্যক্তিগত দৈনিক অনুশীলন",
                            "Personalized Daily Practice",
                          )}
                        </h2>
                      </div>
                      <p className="mt-1.5 text-xs sm:text-[13px] text-[#242423]/60 dark:text-zinc-400">
                        {t(
                          "১০টি প্রশ্ন · ২০ সেকেন্ড · প্রতিদিন ১ বার আপনার স্ট্রিক বাড়াতে",
                          "10 questions · 20s blitz · Protect & grow your daily streak",
                        )}
                      </p>
                    </div>

                    <Link
                      href="/quiz/daily"
                      onClick={(e) => {
                        if (requestGoogleLogin()) {
                          e.preventDefault();
                        }
                      }}
                      className={BTN_PRIMARY}
                    >
                      <Flame className="size-3.5 text-amber-400 fill-amber-400" />
                      <span>{t("অনুশীলন শুরু করুন", "Daily Practice")}</span>
                    </Link>
                  </div>

                  {/* Module 2: Continue Learning with Liquid Progress */}
                  <div className="rounded-[18px] sm:rounded-[20px] bg-[#242423]/[0.03] p-4 sm:p-5 dark:bg-white/[0.04] flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <ContinueLearningContent
                      lastLearned={lastLearnedHydrated ? lastLearned : null}
                      loaded={learnedLoaded}
                      learnedIds={learnedIds}
                      levelStats={levelStats}
                    />
                  </div>

                  {/* Module 3: Quiz Challenge */}
                  <div className="rounded-[18px] sm:rounded-[20px] bg-[#242423]/[0.03] p-4 sm:p-5 dark:bg-white/[0.04] flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-[15px] sm:text-base font-semibold tracking-tight text-[#1c1c1e] dark:text-zinc-100">
                        {t("কুইজ চ্যালেঞ্জ", "Quiz Challenge")}
                      </h2>
                      <p className="mt-1 text-xs sm:text-[13px] text-[#242423]/55 dark:text-zinc-400">
                        {t(
                          "শব্দভাণ্ডার ও গ্রামার পরীক্ষা করে দক্ষতা যাচাই করুন",
                          "Test vocabulary & grammar to build your streak",
                        )}
                      </p>
                    </div>
                    <Link href="/quiz" className={BTN_SECONDARY}>
                      <BookOpenCheck className="size-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{t("কুইজ দিন", "Take a Quiz")}</span>
                    </Link>
                  </div>

                  {/* Module 4: 4-Column Utility Grid (DESIGNS.md 4.2) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    {ACTION_CARDS.map(
                      ({
                        href,
                        icon: Icon,
                        titleEn,
                        titleBn,
                        descriptionEn,
                        descriptionBn,
                        iconTint,
                      }) => (
                        <Link
                          key={href}
                          href={href}
                          className="group flex flex-col justify-between rounded-[16px] sm:rounded-[18px] bg-[#242423]/[0.04] p-3.5 transition-all duration-150 hover:bg-[#242423]/[0.07] active:scale-[0.97] dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                        >
                          <div className="flex items-start justify-between">
                            <span className="flex size-8 items-center justify-center rounded-[10px] bg-white shadow-2xs dark:bg-[#1c1c1e]">
                              <Icon className={cn("size-4", iconTint)} />
                            </span>
                            <ArrowUpRight className="size-3.5 text-[#242423]/35 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500" />
                          </div>
                          <div className="mt-3 min-w-0">
                            <h3 className="truncate text-xs sm:text-[13px] font-semibold text-[#1c1c1e] dark:text-zinc-100">
                              {t(titleBn, titleEn)}
                            </h3>
                            <p className="mt-0.5 truncate text-[11px] text-[#242423]/55 dark:text-zinc-400">
                              {t(descriptionBn, descriptionEn)}
                            </p>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
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
  const colorFrom = from ?? "#10b981";
  const colorTo = to ?? "#059669";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
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
  levelStats,
}: {
  lastLearned: LastLearnedEntry | null;
  loaded: boolean;
  learnedIds: Set<string>;
  levelStats: LevelStatItem[];
}) {
  const t = useT();

  const targetLevel = lastLearned?.level ?? "A1";
  const meta = LEVEL_META[targetLevel] ?? LEVEL_META.A1;
  const countMap = new Map(
    levelStats.map((s) => [s.level.toUpperCase(), s.count]),
  );
  const levelTotal = countMap.get(targetLevel.toUpperCase()) || 1000;
  const learned = learnedIds.size;
  const pct =
    levelTotal > 0
      ? Math.min(100, Math.round((learned / levelTotal) * 100))
      : 0;
  const href = `/vocabulary/${targetLevel.toLowerCase()}`;

  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] sm:text-base font-semibold tracking-tight text-[#1c1c1e] dark:text-zinc-100">
            {t("শেখা চালিয়ে যান", "Continue Learning")}
          </h2>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums",
              meta.bg,
              meta.text,
            )}
          >
            {targetLevel}
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-[13px] text-[#242423]/55 dark:text-zinc-400">
          {lastLearned
            ? t(
                `লেভেল ${targetLevel} · পৃষ্ঠা ${lastLearned.page}`,
                `Level ${targetLevel} · Page ${lastLearned.page}`,
              )
            : t(
                "একটি লেভেল বেছে নিয়ে শেখা শুরু করুন।",
                "Pick a level and start learning.",
              )}
        </p>

        {/* Liquid Progress Track (DESIGNS.md 4.4) */}
        <div className="mt-3 flex items-center gap-3 max-w-sm">
          <div className="relative h-1.5 flex-1 rounded-full bg-[#242423]/10 dark:bg-white/10 overflow-hidden">
            {loaded ? (
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-full transition-all duration-500",
                  meta.solid,
                )}
                style={{ width: `${pct}%` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ transform: "translateX(600%)" }}
                />
              </div>
            ) : (
              <div className="h-full w-1/3 rounded-full bg-zinc-300/70 dark:bg-zinc-700 animate-pulse" />
            )}
          </div>
          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#242423]/60 dark:text-zinc-400">
            {loaded ? `${learned}/${levelTotal}` : "\u00A0"}
          </span>
        </div>
      </div>

      <Link href={href} className={BTN_SECONDARY}>
        <span>
          {lastLearned
            ? t("চালিয়ে যান", "Continue")
            : t("শেখা শুরু করুন", "Start Learning")}
        </span>
        <ArrowRight className="size-3.5" />
      </Link>
    </>
  );
}

function StatTile({
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
    <div className="rounded-[16px] bg-[#242423]/[0.03] p-3.5 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-medium text-[#242423]/55 dark:text-zinc-400">
          {t(labelBn, labelEn)}
        </p>
        <Icon className={cn("size-3.5 shrink-0", tint)} />
      </div>
      <p className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight tabular-nums text-[#1c1c1e] dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-[#242423]/45 dark:text-zinc-500">
        {t(subBn, subEn)}
      </p>
    </div>
  );
}
