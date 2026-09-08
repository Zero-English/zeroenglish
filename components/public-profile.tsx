"use client";

import { useMemo } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { ContributionCalendar } from "@/components/contribution-calendar";
import { useT, useNum } from "@/components/language-provider";
import { quizResult, quizResultStats, type QuizResultType } from "@/lib/quiz-result";
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
  Award,
  CalendarDays,
  Clock3,
  ListChecks,
  TrendingUp,
  Languages,
  ArrowLeftRight,
  Shuffle,
  Layers,
  Globe,
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

const QUIZ_META: Record<
  QuizResultType,
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

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ProgressBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn("h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.02] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-xl", color)}>{icon}</div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</div>}
    </StaggerItem>
  );
}

function QuizItem({ index }: { index: number }) {
  const entry = quizResult[index];
  const meta = QUIZ_META[entry.quizType];
  const Icon = meta.icon;
  const t = useT();
  const num = useNum();

  return (
    <StaggerItem className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300/80 dark:hover:border-zinc-700/80 active:scale-[1.01] active:shadow-lg active:border-zinc-300/80 dark:active:border-zinc-700/80">
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
              {formatDate(entry.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {num(entry.win)}%
          </span>
          <span className="text-xs text-zinc-400">{t("জয়ের হার", "win rate")}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t(`${num(entry.numberOfQuestions)}টি প্রশ্ন`, `${entry.numberOfQuestions} Questions`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {num(entry.timePerQuestion)}
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
}: {
  user: PublicProfileUser;
  totalWords: number;
  levelProgress: { level: string; total: number; learned: number }[];
  dailyData: { date: string; count: number }[];
}) {
  const t = useT();
  const num = useNum();
  const isAdmin = user.role === "admin";

  const progress = totalWords > 0 ? Math.round((user.learnedCount / totalWords) * 100) : 0;
  const stats = useMemo(() => quizResultStats(quizResult), []);

  return (
    <StaggerContainer className="space-y-6">
      {/* User card */}
      <StaggerItem className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[1.01] active:shadow-lg active:border-zinc-300 dark:active:border-zinc-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <UserAvatar
              id={user.id}
              name={user.name}
              userName={user.userName}
              image={user.image}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.name || user.userName || "User"}
                </h2>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                    <ShieldCheck className="h-3 w-3" />
                    {t("অ্যাডমিন", "Admin")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {t("ব্যবহারকারী", "User")}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                {user.userName ? `@${user.userName}` : t("Zero English ব্যবহারকারী", "Zero English user")}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <Globe className="h-3.5 w-3.5" />
            {t("পাবলিক প্রোফাইল", "Public Profile")}
          </div>
        </div>
      </StaggerItem>

      {/* Learned word progress */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("শেখা শব্দের অগ্রগতি", "Learned Word Progress")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <StaggerContainer className="contents">
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              label={t("শেখা হয়েছে", "Learned")}
              value={num(user.learnedCount)}
              sub={t(`মোটের ${num(progress)}%`, `${progress}% of total`)}
              color="bg-emerald-100 dark:bg-emerald-900/30"
            />
            <StatCard
              icon={<RefreshCw className="h-5 w-5 text-orange-600" />}
              label={t("শিখছে", "Still Learning")}
              value={num(user.stillLearningCount)}
              color="bg-orange-100 dark:bg-orange-900/30"
            />
            <StatCard
              icon={<BookmarkCheck className="h-5 w-5 text-amber-600" />}
              label={t("বুকমার্ক করা", "Bookmarked")}
              value={num(user.bookmarkedCount)}
              color="bg-amber-100 dark:bg-amber-900/30"
            />
          </StaggerContainer>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("সব মিলিয়ে অগ্রগতি", "Overall Progress")}
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {num(user.learnedCount)}/{num(totalWords)} ({num(progress)}%)
            </span>
          </div>
          <ProgressBar pct={progress} />
        </div>

        {levelProgress.length > 0 && (
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {t("লেভেল অনুযায়ী অগ্রগতি", "Progress by Level")}
              </span>
            </div>
            <div className="space-y-3">
              {levelProgress.map((l) => {
                const pct = l.total > 0 ? Math.round((l.learned / l.total) * 100) : 0;
                const c = LEVEL_GRADIENTS[l.level] ?? "from-zinc-400 to-zinc-500";
                return (
                  <div key={l.level}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold", LEVEL_TEXT_COLORS[l.level])}>{l.level}</span>
                        <span className="text-[11px] text-zinc-400">
                          {num(l.learned)}/{num(l.total)}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{num(pct)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", c)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </StaggerItem>

      {/* Daily progress calendar */}
      <StaggerItem>
        <ContributionCalendar userId={user.id} data={dailyData} />
      </StaggerItem>

      {/* Quiz dummy data */}
      <StaggerItem className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("কুইজের ফলাফল", "Quiz Results")}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {t("ডেমো ডেটা", "Demo data")}
          </span>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
          {t(
            `${num(stats.total)}টি কুইজ · ${num(stats.totalQuestions)}টি প্রশ্নের উত্তর দেওয়া হয়েছে`,
            `${stats.total} quiz${stats.total !== 1 ? "zes" : ""} · ${stats.totalQuestions} questions answered`
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <StaggerContainer className="contents">
            <StatCard
              icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
              label={t("নেওয়া কুইজ", "Quizzes Taken")}
              value={num(stats.total)}
              color="bg-indigo-100 dark:bg-indigo-900/30"
            />
            <StatCard
              icon={<BarChart3 className="h-5 w-5 text-sky-600" />}
              label={t("গড় জয়ের হার", "Avg. Win Rate")}
              value={`${num(stats.avg)}%`}
              color="bg-sky-100 dark:bg-sky-900/30"
            />
            <StatCard
              icon={<Award className="h-5 w-5 text-emerald-600" />}
              label={t("সেরা স্কোর", "Best Score")}
              value={`${num(stats.best)}%`}
              color="bg-emerald-100 dark:bg-emerald-900/30"
            />
          </StaggerContainer>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <StaggerContainer className="contents">
            {quizResult.map((entry, idx) => (
              <QuizItem key={entry.id} index={idx} />
            ))}
          </StaggerContainer>
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}