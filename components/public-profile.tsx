"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { useT } from "@/components/language-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { dbResultToHistoryEntry, type DbQuizResult } from "@/lib/quiz-results-api";
import type { QuizType } from "@/lib/quiz-history-store";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  BookmarkCheck,
  GraduationCap,
  Trophy,
  BarChart3,
  CalendarDays,
  Clock3,
  ListChecks,
  TrendingUp,
  Languages,
  ArrowLeftRight,
  Shuffle,
  Layers,
  Globe,
  Flame,
  type LucideIcon,
} from "lucide-react";

export interface PublicProfileUser {
  id: number;
  name: string | null;
  userName: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  learnedCount: number;
  stillLearningCount: number;
  bookmarkedCount: number;
}

const TILE =
  "relative h-full rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80";

const QUIZZES_PER_PAGE = 5;

const QUIZ_META: Record<
  QuizType,
  { label: string; labelBn: string; icon: LucideIcon; iconColor: string; bg: string; gradient: string }
> = {
  english_to_bangla: {
    label: "English to Bangla",
    labelBn: "ইংরেজি থেকে বাংলা",
    icon: Languages,
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-400 to-sky-500",
  },
  bangla_to_english: {
    label: "Bangla to English",
    labelBn: "বাংলা থেকে ইংরেজি",
    icon: ArrowLeftRight,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    gradient: "from-indigo-400 to-indigo-500",
  },
  synonym: {
    label: "Synonyms",
    labelBn: "সমার্থক শব্দ",
    icon: Shuffle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    gradient: "from-emerald-400 to-teal-500",
  },
  antonym: {
    label: "Antonyms",
    labelBn: "বিপরীত শব্দ",
    icon: Layers,
    iconColor: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    gradient: "from-rose-400 to-pink-500",
  },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  A2: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  B1: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  B2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  C1: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  C2: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

const LEVEL_GRADIENTS: Record<string, string> = {
  A1: "from-emerald-400 to-teal-500",
  A2: "from-sky-400 to-blue-500",
  B1: "from-amber-400 to-orange-500",
  B2: "from-rose-400 to-pink-500",
  C1: "from-violet-400 to-purple-500",
  C2: "from-fuchsia-400 to-pink-500",
};

const LEVEL_TEXT_COLORS: Record<string, string> = {
  A1: "text-emerald-600 dark:text-emerald-400",
  A2: "text-sky-600 dark:text-sky-400",
  B1: "text-amber-600 dark:text-amber-400",
  B2: "text-rose-600 dark:text-rose-400",
  C1: "text-violet-600 dark:text-violet-400",
  C2: "text-fuchsia-600 dark:text-fuchsia-400",
};

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function ProgressRing({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));
  const arc = clamped * 3.6;
  const t = useT();

  return (
    <div
      className="relative h-40 w-40 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800"
      style={{ backgroundImage: `conic-gradient(#10b981 ${arc}deg, transparent 0deg)` }}
    >
      <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-zinc-950">
        <span className="text-3xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
          {clamped}%
        </span>
        <span className="mt-0.5 text-[11px] text-zinc-400">
          {t("সব মিলিয়ে", "overall")}
        </span>
      </div>
    </div>
  );
}

function TileHeader({
  icon,
  title,
  sub,
  iconBg,
  iconTint,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
  iconBg: string;
  iconTint: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
          <span className={iconTint}>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
      </div>
      {sub && <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

function IdentityTile({
  user,
  isAdmin,
}: {
  user: PublicProfileUser;
  isAdmin: boolean;
}) {
  const t = useT();
  const displayName = user.name || user.userName || "User";

  const stats = [
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      tint: "text-emerald-500",
      value: user.learnedCount,
      label: t("শেখা হয়েছে", "Learned"),
    },
    {
      icon: <RefreshCw className="h-4 w-4" />,
      tint: "text-orange-500",
      value: user.stillLearningCount,
      label: t("শিখছে", "Still Learning"),
    },
    {
      icon: <BookmarkCheck className="h-4 w-4" />,
      tint: "text-amber-500",
      value: user.bookmarkedCount,
      label: t("বুকমার্ক করা", "Bookmarked"),
    },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm shadow-sm">
      {/* Cover */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500 sm:h-36">
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md sm:left-6 sm:top-5">
          <Globe className="h-3.5 w-3.5" />
          {t("পাবলিক প্রোফাইল", "Public Profile")}
        </div>
      </div>

      {/* Body */}
      <div className="relative px-4 pb-6 sm:px-6">
        {/* Avatar overlapping the cover */}
        <div className="-mt-12 sm:-mt-16">
          <div className="relative inline-block">
            <div className="absolute -inset-1 rounded-full bg-white dark:bg-zinc-950" />
            <UserAvatar
              id={user.id}
              name={user.name}
              userName={user.userName}
              image={user.image}
              size="xl"
              className="relative ring-4 ring-white shadow-lg shadow-black/10 dark:ring-zinc-950"
            />
          </div>
        </div>

        {/* Name + badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <h1 className="truncate text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {displayName}
          </h1>
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <ShieldCheck className="h-3 w-3" />
              {t("অ্যাডমিন", "Admin")}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {t("ব্যবহারকারী", "User")}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
          {user.userName ? `@${user.userName}` : t("Zero English ব্যবহারকারী", "Zero English user")}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-zinc-400" />
            {t("যোগ দিয়েছেন", "Joined")} {formatJoined(user.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {t("সক্রিয় শিক্ষার্থী", "Active learner")}
          </span>
        </div>

        {/* Word stats */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={s.tint}>{s.icon}</span>
              <span className="text-lg font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                {s.value}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizItem({ entry }: { entry: { quizType: QuizType; date: string; win: string; levels: string[]; numberOfQuestions: number; timePerQuestion: number } }) {
  const meta = QUIZ_META[entry.quizType];
  const Icon = meta.icon;
  const win = parseInt(entry.win, 10);
  const t = useT();

  return (
    <StaggerItem className="relative overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.01] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
      <div className={cn("absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b opacity-60", meta.gradient)} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", meta.bg)}>
            <Icon className={cn("h-5 w-5", meta.iconColor)} />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t(meta.labelBn, meta.label)}
            </h4>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDay(entry.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {win}%
          </span>
          <span className="text-xs text-zinc-400">{t("জয়ের হার", "win rate")}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t(`${entry.numberOfQuestions}টি প্রশ্ন`, `${entry.numberOfQuestions} Questions`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {entry.timePerQuestion}
            {t(" সেকেন্ড / প্রশ্ন", "s / question")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.levels.map((lv) => (
            <span key={lv} className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", LEVEL_COLORS[lv])}>
              {lv}
            </span>
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function PublicProfileView({
  user,
  totalWords,
  levelProgress = [],
  dailyData = [],
  quizResults = [],
}: {
  user: PublicProfileUser;
  totalWords: number;
  levelProgress: { level: string; total: number; learned: number }[];
  dailyData: { date: string; count: number }[];
  quizResults: DbQuizResult[];
}) {
  const t = useT();
  const isAdmin = user.role === "admin";
  const [quizPage, setQuizPage] = useState(1);

  const progress = totalWords > 0 ? Math.round((user.learnedCount / totalWords) * 100) : 0;
  const quizEntries = useMemo(
    () => quizResults.map((r) => dbResultToHistoryEntry(r)),
    [quizResults]
  );
  const stats = useMemo(() => {
    const total = quizEntries.length;
    const totalQuestions = quizEntries.reduce((acc, e) => acc + e.numberOfQuestions, 0);
    const avg =
      total > 0 ? Math.round(quizEntries.reduce((acc, e) => acc + parseInt(e.win, 10), 0) / total) : 0;
    const best = total > 0 ? Math.max(...quizEntries.map((e) => parseInt(e.win, 10))) : 0;
    return { total, totalQuestions, avg, best };
  }, [quizEntries]);

  return (
    <StaggerContainer className="flex flex-col gap-4 sm:gap-5">
      {/* Identity hero */}
      <StaggerItem>
        <IdentityTile user={user} isAdmin={isAdmin} />
      </StaggerItem>

      {/* Organized tabs */}
      <StaggerItem>
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                {t("সারসংক্ষেপ", "Overview")}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1.5">
                <Flame className="h-4 w-4" />
                {t("কার্যকলাপ", "Activity")}
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                {t("কুইজ", "Quizzes")}
                {quizEntries.length > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {quizEntries.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              {/* Word progress */}
              <StaggerItem className="lg:col-span-4">
                <div className={TILE}>
                  <TileHeader
                    icon={<BookOpen className="h-4 w-4" />}
                    title={t("শব্দ অগ্রগতি", "Word Progress")}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    iconTint="text-emerald-600 dark:text-emerald-400"
                  />
                  <div className="flex flex-col items-center justify-center gap-3 pb-2 pt-1">
                    <ProgressRing pct={progress} />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.learnedCount}</span>
                      {" / "}
                      {totalWords} {t("শব্দ", "words")}
                    </p>
                  </div>
                </div>
              </StaggerItem>

              {/* Level progress */}
              <StaggerItem className="lg:col-span-8">
                <div className={TILE}>
                  <TileHeader
                    icon={<TrendingUp className="h-4 w-4" />}
                    title={t("লেভেল অনুযায়ী অগ্রগতি", "Progress by Level")}
                    iconBg="bg-violet-100 dark:bg-violet-900/30"
                    iconTint="text-violet-600 dark:text-violet-400"
                  />
                  {levelProgress.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                      {levelProgress.map((l) => {
                        const pct = l.total > 0 ? Math.round((l.learned / l.total) * 100) : 0;
                        const c = LEVEL_GRADIENTS[l.level] ?? "from-zinc-400 to-zinc-500";
                        return (
                          <div key={l.level}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={cn("inline-flex w-9 justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold", LEVEL_COLORS[l.level])}>
                                  {l.level}
                                </span>
                                <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                                  {l.learned}/{l.total}
                                </span>
                              </div>
                              <span className={cn("text-xs font-bold tabular-nums", LEVEL_TEXT_COLORS[l.level])}>
                                {pct}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", c)}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
                      <TrendingUp className="h-4 w-4" />
                      {t("লেভেল তথ্য উপলব্ধ নেই", "No level data yet")}
                    </div>
                  )}
                </div>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="activity">
            <ContributionCalendar userId={user.id} data={dailyData} />
          </TabsContent>

          <TabsContent value="quizzes">
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              {/* Quiz overview */}
              <StaggerItem className="lg:col-span-4">
                <div className={TILE}>
                  <TileHeader
                    icon={<GraduationCap className="h-4 w-4" />}
                    title={t("কুইজ ওভারভিউ", "Quiz Overview")}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                    iconTint="text-indigo-600 dark:text-indigo-400"
                  />
                  {stats.total > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {t("নেওয়া কুইজ", "Quizzes Taken")}
                        </span>
                        <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {stats.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {t("গড় জয়ের হার", "Avg. Win Rate")}
                        </span>
                        <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {stats.avg}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {t("সেরা স্কোর", "Best Score")}
                        </span>
                        <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {stats.best}%
                        </span>
                      </div>
                      <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {t(
                            `${stats.totalQuestions}টি প্রশ্নের উত্তর দিয়েছেন`,
                            `${stats.totalQuestions} questions answered`
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <Trophy className="h-9 w-9 text-zinc-300 dark:text-zinc-600" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t("এখনো কোনো কুইজ নেননি", "No quizzes taken yet")}
                      </p>
                    </div>
                  )}
                </div>
              </StaggerItem>

              {/* Quiz history */}
              <StaggerItem className="lg:col-span-8">
                <div className={TILE}>
                  <TileHeader
                    icon={<GraduationCap className="h-4 w-4" />}
                    title={t("কুইজের ইতিহাস", "Quiz History")}
                    sub={t(
                      `${stats.total}টি কুইজ · ${stats.totalQuestions}টি প্রশ্নের উত্তর দেওয়া হয়েছে`,
                      `${stats.total} quiz${stats.total !== 1 ? "zes" : ""} · ${stats.totalQuestions} questions answered`
                    )}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                    iconTint="text-indigo-600 dark:text-indigo-400"
                  />
                  {stats.total > 0 ? (() => {
                    const totalPagesQ = Math.max(1, Math.ceil(quizEntries.length / QUIZZES_PER_PAGE));
                    const currentPageQ = Math.min(quizPage, totalPagesQ);
                    const startQ = (currentPageQ - 1) * QUIZZES_PER_PAGE;
                    const pageEntriesQ = quizEntries.slice(startQ, startQ + QUIZZES_PER_PAGE);
                    return (
                      <>
                        <StaggerContainer className="grid grid-cols-1 gap-4">
                          {pageEntriesQ.map((entry, idx) => (
                            <QuizItem key={entry.id ?? `${startQ + idx}`} entry={entry} />
                          ))}
                        </StaggerContainer>
                        <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                          {t(
                            `মোট ${stats.total}টির মধ্যে ${startQ + 1}–${Math.min(startQ + QUIZZES_PER_PAGE, stats.total)} দেখানো হচ্ছে`,
                            `Showing ${startQ + 1}–${Math.min(startQ + QUIZZES_PER_PAGE, stats.total)} of ${stats.total}`
                          )}
                        </p>
                        {totalPagesQ > 1 && (
                          <Pagination>
                            <div className="flex items-center gap-0.5 max-w-full">
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={(e) => { e.preventDefault(); if (currentPageQ > 1) setQuizPage(currentPageQ - 1); }}
                                  className={cn(currentPageQ <= 1 ? "pointer-events-none opacity-50" : "")}
                                />
                              </PaginationItem>
                              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                                <PaginationContent>
                                  {Array.from({ length: totalPagesQ }, (_, i) => i + 1).map((p) => (
                                    <PaginationItem key={p}>
                                      <PaginationLink
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setQuizPage(p); }}
                                        isActive={p === currentPageQ}
                                      >
                                        {p}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                </PaginationContent>
                              </div>
                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(e) => { e.preventDefault(); if (currentPageQ < totalPagesQ) setQuizPage(currentPageQ + 1); }}
                                  className={cn(currentPageQ >= totalPagesQ ? "pointer-events-none opacity-50" : "")}
                                />
                              </PaginationItem>
                            </div>
                          </Pagination>
                        )}
                      </>
                    );
                  })() : (
                    <div className="text-center py-16">
                      <Trophy className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
                        {t("এখনো কোনো কুইজ ইতিহাস নেই।", "No quiz history yet.")}
                      </p>
                      <p className="text-zinc-400 dark:text-zinc-500 text-xs">
                        {t("কুইজ নিলে ফলাফল এখানে দেখা যাবে।", "Results will appear here once they take a quiz.")}
                      </p>
                    </div>
                  )}
                </div>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </StaggerItem>
    </StaggerContainer>
  );
}