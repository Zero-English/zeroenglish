import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Clock,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Building,
  School,
  Activity,
  CheckCircle2,
  ExternalLink,
  Flame,
  Award,
} from "lucide-react";
import type { ApiUser } from "../types";
import UserActions from "./user-actions";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileActivityChart } from "@/components/profile-activity-chart";
import { LanguageProvider } from "@/components/language-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getCombinedExamResultsByUser } from "@/services/quiz-result.service";
import { getUserById, getUserDailyActivity } from "@/services/user.service";
import prisma from "@/utils/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "User Detail | Admin — Zero English",
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDay(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function findUser(id: number): Promise<ApiUser | undefined> {
  const result = await getUserById(id);
  if (!result.success || !result.data) return undefined;
  return result.data as unknown as ApiUser;
}

const QUIZ_MODE_LABELS: Record<string, string> = {
  PRACTICE: "Practice Quiz",
  WEEKLY: "Weekly Quiz",
  BIWEEKLY: "Biweekly Quiz",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function deriveStatus(updatedAt: string | null | undefined): "Active" | "Inactive" {
  const ACTIVITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  if (!updatedAt) return "Inactive";
  return new Date(updatedAt).getTime() > Date.now() - ACTIVITY_WINDOW_MS
    ? "Active"
    : "Inactive";
}

async function fetchUserData(userId: number) {
  const [combinedExamResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes] =
    await Promise.all([
      getCombinedExamResultsByUser(userId),
      getUserDailyActivity(userId),
      prisma.userWord.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          updatedAt: true,
          word: { select: { word: true, level: true, meaningBn: true } },
        },
      }),
      prisma.userBookmark.findMany({
        where: { userId },
        orderBy: { bookmarkedAt: "desc" },
        take: 10,
        select: {
          bookmarkedAt: true,
          word: { select: { word: true, level: true } },
        },
      }),
      prisma.combinedExamResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          correctAnswers: true,
          scoreInPercent: true,
          title: true,
          mode: true,
          questionCount: true,
        },
      }),
    ]);

  return { combinedExamResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes };
}

function quizLabel(
  exam?: {
    title?: string;
    mode?: string;
  } | null
): string {
  if (!exam) return "Quiz";
  return (
    exam.title ||
    (exam.mode ? QUIZ_MODE_LABELS[exam.mode] || exam.mode : "Quiz")
  );
}

function buildQuizHistory(combinedExamResults: Awaited<ReturnType<typeof fetchUserData>>["combinedExamResults"]) {
  if (!combinedExamResults.success || !combinedExamResults.data) return [];
  return combinedExamResults.data.map((r) => ({
    id: r.id,
    quiz: `${r.title}`,
    mode: r.mode,
    score: r.correctAnswers,
    scorePercent: r.scoreInPercent,
    total: r.questionCount ?? 1,
    date: fmtDate(new Date(r.createdAt)),
  }));
}

function buildMonthlyProgress(
  combinedExamResults: Awaited<ReturnType<typeof fetchUserData>>["combinedExamResults"],
  dailyActivity: Awaited<ReturnType<typeof fetchUserData>>["dailyActivity"]
) {
  const monthlyWords: Record<string, number> = {};
  if (dailyActivity.success && dailyActivity.data?.daily) {
    for (const day of dailyActivity.data.daily) {
      if (day.count > 0) {
        const d = new Date(day.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthlyWords[key] = (monthlyWords[key] ?? 0) + day.count;
      }
    }
  }

  const monthlyQuizzes: Record<string, { total: number; count: number }> = {};
  if (combinedExamResults.success && combinedExamResults.data) {
    for (const r of combinedExamResults.data) {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyQuizzes[key]) monthlyQuizzes[key] = { total: 0, count: 0 };
      monthlyQuizzes[key].total += r.scoreInPercent;
      monthlyQuizzes[key].count += 1;
    }
  }

  const allKeys = new Set([...Object.keys(monthlyWords), ...Object.keys(monthlyQuizzes)]);
  const entries = [...allKeys]
    .map((key) => {
      const [yearStr, monthStr] = key.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      return { key, year, month };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .slice(-6);

  return entries.map((e) => ({
    month: `${MONTH_NAMES[e.month]} ${e.year}`,
    wordsLearned: monthlyWords[e.key] ?? 0,
    quizAvg:
      monthlyQuizzes[e.key] && monthlyQuizzes[e.key].count > 0
        ? Math.round(monthlyQuizzes[e.key].total / monthlyQuizzes[e.key].count)
        : 0,
  }));
}

function buildRecentActivity(
  recentWords: Awaited<ReturnType<typeof fetchUserData>>["recentWords"],
  recentBookmarks: Awaited<ReturnType<typeof fetchUserData>>["recentBookmarks"],
  recentQuizzes: Awaited<ReturnType<typeof fetchUserData>>["recentQuizzes"]
) {
  const events: {
    type: "word" | "bookmark" | "quiz";
    action: string;
    date: string;
    detail: string;
    extra?: string;
    sortKey: Date;
  }[] = [];

  for (const w of recentWords) {
    events.push({
      type: "word",
      action: "Learned word",
      date: fmtDate(new Date(w.updatedAt)),
      detail: w.word.word,
      extra: w.word.level,
      sortKey: new Date(w.updatedAt),
    });
  }

  for (const b of recentBookmarks) {
    events.push({
      type: "bookmark",
      action: "Bookmarked word",
      date: fmtDate(new Date(b.bookmarkedAt)),
      detail: b.word.word,
      extra: b.word.level,
      sortKey: new Date(b.bookmarkedAt),
    });
  }

  for (const q of recentQuizzes) {
    events.push({
      type: "quiz",
      action: "Completed quiz",
      date: fmtDate(new Date(q.createdAt)),
      detail: quizLabel(q),
      extra: `${q.correctAnswers}/${q.questionCount ?? 1} (${q.scoreInPercent}%)`,
      sortKey: new Date(q.createdAt),
    });
  }

  return events
    .sort((a, b) => b.sortKey.getTime() - a.sortKey.getTime())
    .slice(0, 8);
}

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await findUser(Number(id));
  if (!user) notFound();

  const userId = Number(id);
  const { combinedExamResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes } =
    await fetchUserData(userId);

  const quizHistory = buildQuizHistory(combinedExamResults);
  const monthlyProgress = buildMonthlyProgress(combinedExamResults, dailyActivity);
  const recentActivity = buildRecentActivity(recentWords, recentBookmarks, recentQuizzes);

  const avgQuizScore =
    combinedExamResults.success && combinedExamResults.data && combinedExamResults.data.length > 0
      ? Math.round(
          combinedExamResults.data.reduce((sum, r) => sum + r.scoreInPercent, 0) /
            combinedExamResults.data.length
        )
      : null;

  const studyStreak = dailyActivity.success ? dailyActivity.data?.streak ?? 0 : 0;
  const lastActive = user.updated_at;
  const status = deriveStatus(lastActive);

  const stats = [
    {
      label: "Learned Words",
      value: user.learnedWordCount,
      icon: GraduationCap,
      description: "Mastered vocabulary",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Still Learning",
      value: user.stillLearningCount,
      icon: BookOpen,
      description: "Words in progress",
      iconColor: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-50 dark:bg-sky-950/40",
    },
    {
      label: "Bookmarks",
      value: user.bookmarkedCount,
      icon: Bookmark,
      description: "Saved for review",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Avg Quiz Score",
      value: avgQuizScore !== null ? `${avgQuizScore}%` : "—",
      icon: ClipboardCheck,
      description: `${quizHistory.length} quiz${quizHistory.length !== 1 ? "zes" : ""} taken`,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Study Streak",
      value: `${studyStreak}d`,
      icon: Flame,
      description: "Consecutive active days",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Users Directory
        </Link>
        <span className="text-xs text-muted-foreground">
          User ID: <span className="font-mono font-medium text-foreground">#{user.id}</span>
        </span>
      </div>

      {/* User Header Profile Card */}
      <Card className="overflow-hidden border-border bg-card shadow-xs">
        <div className="h-20 sm:h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50" />
        <CardContent className="relative px-5 sm:px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-4">
              <div className="relative inline-block shrink-0">
                <div className="ring-4 ring-card rounded-full overflow-hidden shadow-md">
                  <UserAvatar
                    id={user.id}
                    name={user.name}
                    userName={user.user_name}
                    image={user.image}
                    size="xl"
                  />
                </div>
                <span
                  className={cn(
                    "absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card",
                    status === "Active" ? "bg-emerald-500" : "bg-zinc-400"
                  )}
                  title={`Status: ${status}`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {user.name || user.user_name}
                  </h1>
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "default"
                        : user.role === "contributor"
                          ? "category"
                          : "outline"
                    }
                    className="capitalize text-xs font-semibold"
                  >
                    {user.role === "admin" && <ShieldCheck className="size-3 mr-0.5" />}
                    {user.role}
                  </Badge>
                  <Badge
                    variant={status === "Active" ? "pos" : "ghost"}
                    className="text-[11px]"
                  >
                    {status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>@{user.user_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                  {user.emailVerified && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <UserActions user={user} />
          </div>

          <Separator className="my-4" />

          {/* Quick Meta Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">Joined</p>
                <p className="font-medium text-foreground">{formatDay(user.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">Last Active</p>
                <p className="font-medium text-foreground">{formatDay(lastActive)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">Institution</p>
                <p className="font-medium text-foreground truncate max-w-[140px]">{user.institutionName || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">Class / Grade</p>
                <p className="font-medium text-foreground truncate max-w-[140px]">{user.class || "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-KPI Bento Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <div className={cn("p-2 rounded-lg shrink-0", stat.iconBg, stat.iconColor)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Tabbed Information Architecture */}
      <Tabs defaultValue="overview" className="w-full space-y-5">
        <TabsList className="grid grid-cols-4 w-full max-w-md h-9 p-1 bg-muted/70 rounded-lg">
          <TabsTrigger value="overview" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            Profile
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            Quizzes ({quizHistory.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">
            Activity
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
          {/* Realtime Activity Heatmap Chart */}
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Activity className="h-4 w-4 text-primary" />
                    Learning Activity & Daily Analytics
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Realtime vocabulary study and quiz contribution tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <LanguageProvider>
                <ProfileActivityChart userId={user.id} />
              </LanguageProvider>
            </CardContent>
          </Card>

          {/* 2-Column Bento: Monthly Progress + Recent Activity Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Monthly Learning Trajectory
                </CardTitle>
                <CardDescription className="text-xs">
                  Words learned and quiz averages over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {monthlyProgress.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No monthly progress records available yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {monthlyProgress.map((m, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{m.month}</span>
                          <span className="text-muted-foreground tabular-nums font-medium">
                            {m.wordsLearned} words {m.quizAvg > 0 ? `· ${m.quizAvg}% avg quiz` : ""}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((m.wordsLearned / 200) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs flex flex-col justify-between">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Latest Action Feed
                </CardTitle>
                <CardDescription className="text-xs">
                  Recent actions performed by this user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {recentActivity.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No recent events recorded.
                  </p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {recentActivity.slice(0, 5).map((act, i) => (
                      <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            act.type === "word" ? "bg-emerald-500" : act.type === "bookmark" ? "bg-amber-500" : "bg-indigo-500"
                          )} />
                          <div className="truncate">
                            <span className="font-medium text-foreground">{act.action}: </span>
                            <span className="text-muted-foreground font-mono">{act.detail}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground/70">{act.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: PROFILE DETAILS */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Detailed Metadata Card */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  Full Account Profile & Attributes
                </CardTitle>
                <CardDescription className="text-xs">
                  Core identity, credentials, and academic classification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border/60 text-xs">
                  {[
                    ["Full Name", user.name || "—"],
                    ["Username", `@${user.user_name}`],
                    ["Email Address", user.email],
                    ["Email Verified", user.emailVerified ? formatDate(user.emailVerified) : "Unverified"],
                    ["Assigned Role", user.role],
                    ["Account Status", status],
                    ["Institution / College", user.institutionName || "—"],
                    ["Class / Division", user.class || "—"],
                    ["Gender Identity", user.gender === "NOT_SET" ? "Not set" : user.gender || "—"],
                    ["Registration Date", formatDay(user.created_at)],
                    ["Last Active Timestamp", formatDate(lastActive)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                      <dt className="text-muted-foreground font-medium">{label}</dt>
                      <dd className="font-semibold text-foreground text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Bio & Social Links */}
            <div className="space-y-5">
              <Card className="shadow-xs">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-sm font-semibold">User Biography</CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-xs text-muted-foreground">
                  {user.bio ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{user.bio}</p>
                  ) : (
                    <p className="italic text-muted-foreground/60">No personal bio provided.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xs">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    Social Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-xs">
                  {user.socialLinks && user.socialLinks.length > 0 ? (
                    <div className="space-y-2">
                      {user.socialLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/80 text-foreground font-medium transition-colors truncate"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground/60 italic">No social links linked.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: QUIZZES */}
        <TabsContent value="quizzes" className="space-y-5 focus-visible:outline-none">
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                Examination & Quiz History
              </CardTitle>
              <CardDescription className="text-xs">
                Complete log of tests and practice quizzes taken by this learner
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {quizHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">No quiz attempts recorded</p>
                  <p className="text-xs text-muted-foreground mt-1">This user hasn&apos;t completed any quizzes or exams yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider">
                        <th className="px-5 py-3">Quiz Title</th>
                        <th className="px-5 py-3">Type / Mode</th>
                        <th className="px-5 py-3">Score</th>
                        <th className="px-5 py-3">Result (%)</th>
                        <th className="px-5 py-3">Date Taken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {quizHistory.map((q) => (
                        <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-foreground">{q.quiz}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline" className="text-[10px] font-medium">
                              {q.mode || "Practice"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-foreground font-semibold">
                            {q.score} / {q.total}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                q.scorePercent >= 80
                                  ? "pos"
                                  : q.scorePercent >= 60
                                    ? "category"
                                    : "destructive"
                              }
                              className="text-[11px] font-bold"
                            >
                              {q.scorePercent}%
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{q.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: ACTIVITY */}
        <TabsContent value="activity" className="space-y-5 focus-visible:outline-none">
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Comprehensive Activity Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed timeline of recently learned words, bookmarks, and completed exams
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">No recent actions</p>
                  <p className="text-xs text-muted-foreground mt-1">Activity logs will populate as the user learns and takes quizzes.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {recentActivity.map((event, idx) => (
                    <div key={idx} className="relative flex items-start justify-between gap-4">
                      <span className={cn(
                        "absolute -left-6 top-1 h-3 w-3 rounded-full ring-4 ring-card",
                        event.type === "word" ? "bg-emerald-500" : event.type === "bookmark" ? "bg-amber-500" : "bg-indigo-500"
                      )} />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{event.action}</p>
                          {event.extra && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                              {event.extra}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{event.detail}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{event.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
