import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import type { ApiUser } from "../types";
import UserActions from "./user-actions";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileActivityChart } from "@/components/profile-activity-chart";
import { LanguageProvider } from "@/components/language-provider";
import { getQuizResultsByUser } from "@/services/quiz-result.service";
import { getUserById, getUserDailyActivity } from "@/services/user.service";
import prisma from "@/utils/prisma";

export const metadata: Metadata = {
  title: "User Detail | Admin — Zero English",
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDay(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
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
  const [quizResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes] =
    await Promise.all([
      getQuizResultsByUser(userId),
      getUserDailyActivity(userId),
      prisma.userWord.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          updatedAt: true,
          word: { select: { word: true, level: true } },
        },
      }),
      prisma.userBookmark.findMany({
        where: { userId },
        orderBy: { bookmarkedAt: "desc" },
        take: 5,
        select: {
          bookmarkedAt: true,
          word: { select: { word: true } },
        },
      }),
      prisma.quizResults.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          createdAt: true,
          correctAnswers: true,
          scoreInPercent: true,
          title: true,
          mode: true,
          questionCount: true,
        },
      }),
    ]);

  return { quizResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes };
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

function buildQuizHistory(quizResults: Awaited<ReturnType<typeof fetchUserData>>["quizResults"]) {
  if (!quizResults.success || !quizResults.data) return [];
  return quizResults.data.map((r) => ({
    quiz: `${r.title}`,
    score: r.correctAnswers,
    total: r.questionCount ?? 1,
    date: fmtDate(new Date(r.createdAt)),
  }));
}

function buildMonthlyProgress(
  quizResults: Awaited<ReturnType<typeof fetchUserData>>["quizResults"],
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
  if (quizResults.success && quizResults.data) {
    for (const r of quizResults.data) {
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
  const events: { action: string; date: string; detail: string; sortKey: Date }[] = [];

  for (const w of recentWords) {
    events.push({
      action: "Learned word",
      date: fmtDate(new Date(w.updatedAt)),
      detail: `${w.word.word} (${w.word.level})`,
      sortKey: new Date(w.updatedAt),
    });
  }

  for (const b of recentBookmarks) {
    events.push({
      action: "Bookmarked word",
      date: fmtDate(new Date(b.bookmarkedAt)),
      detail: b.word.word,
      sortKey: new Date(b.bookmarkedAt),
    });
  }

  for (const q of recentQuizzes) {
    events.push({
      action: "Took quiz",
      date: fmtDate(new Date(q.createdAt)),
      detail: `${quizLabel(q)} — ${q.correctAnswers}/${q.questionCount ?? 1}`,
      sortKey: new Date(q.createdAt),
    });
  }

  return events
    .sort((a, b) => b.sortKey.getTime() - a.sortKey.getTime())
    .slice(0, 5);
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
  const { quizResults, dailyActivity, recentWords, recentBookmarks, recentQuizzes } =
    await fetchUserData(userId);

  const quizHistory = buildQuizHistory(quizResults);
  const monthlyProgress = buildMonthlyProgress(quizResults, dailyActivity);
  const recentActivity = buildRecentActivity(recentWords, recentBookmarks, recentQuizzes);

  const avgQuizScore =
    quizResults.success && quizResults.data && quizResults.data.length > 0
      ? Math.round(
          quizResults.data.reduce((sum, r) => sum + r.scoreInPercent, 0) /
            quizResults.data.length
        )
      : null;

  const studyStreak = dailyActivity.success ? dailyActivity.data?.streak ?? 0 : 0;
  const lastActive = user.updated_at;
  const status = deriveStatus(lastActive);

  const stats = [
    { label: "Bookmarked", value: user.bookmarkedCount, icon: Bookmark },
    { label: "Still Learning", value: user.stillLearningCount, icon: BookOpen },
    { label: "Learned", value: user.learnedWordCount, icon: GraduationCap },
    {
      label: "Avg Quiz Score",
      value: avgQuizScore !== null ? `${avgQuizScore}%` : "—",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="p-3 lg:p-4">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            id={user.id}
            name={user.name}
            userName={user.user_name}
            image={user.image}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.name || user.user_name}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  status === "Active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
        <UserActions user={user} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-8">
        <LanguageProvider>
          <ProfileActivityChart userId={user.id} />
        </LanguageProvider>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
          </div>
          <dl className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ["Name", user.name || "—"],
              ["Username", user.user_name],
              ["Email", user.email],
              [
                "Email Verified",
                user.emailVerified ? formatDate(user.emailVerified) : "No",
              ],
              ["Role", user.role],
              ["Status", status],
              ["Total Words Studied", String(user.learnedWordCount)],
              ["Joined", formatDay(user.created_at)],
              ["Last Active", formatDay(lastActive)],
              ["Study Streak", `${studyStreak} days`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-5 py-3 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
              No recent activity.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentActivity.map((activity, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between px-5 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="shrink-0 pl-4 text-xs text-gray-400 dark:text-gray-500">
                    {activity.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Quiz History
            </h2>
          </div>
          {quizHistory.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
              No quizzes taken yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-3 font-medium">Quiz</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizHistory.map((q, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="px-5 py-3 text-gray-900 dark:text-white">
                        {q.quiz}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            q.score / q.total >= 0.8
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : q.score / q.total >= 0.6
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                          }`}
                        >
                          {q.score}/{q.total}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {q.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Monthly Progress
            </h2>
          </div>
          {monthlyProgress.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
              No progress data yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {monthlyProgress.map((m, i) => (
                <li key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {m.month}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {m.wordsLearned} words
                      {m.quizAvg > 0 ? ` · avg ${m.quizAvg}%` : ""}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((m.wordsLearned / 250) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
