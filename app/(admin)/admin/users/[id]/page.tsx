import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import type { ApiUser, UserDetailResponse } from "../types";
import UserActions from "./user-actions";
import DailyProgress from "./daily-progress";
import { UserAvatar } from "@/components/UserAvatar";

const RICH = {
  stillLearning: [2, 5, 9, 14, 20, 28, 35, 41, 50, 58, 63, 72, 80, 91, 100],
  learned: [4, 6, 10, 15, 22, 30, 38, 46, 53, 60, 68, 75, 82, 90, 98],
  quizResult: 78,
  status: "Active" as const,
  joinedAt: "2025-09-15",
  lastActive: "2026-08-30",
  studyStreak: 14,
  totalWordsStudied: 507,
  bio: "Passionate about learning English vocabulary. Focuses on everyday conversational words.",
  recentActivity: [
    { action: "Learned word", date: "2026-08-30", detail: "ubiquitous" },
    { action: "Took quiz", date: "2026-08-29", detail: "Score: 18/20" },
    { action: "Bookmarked word", date: "2026-08-28", detail: "ephemeral" },
    { action: "Completed level", date: "2026-08-25", detail: "A2 Section 4" },
    { action: "Learned word", date: "2026-08-24", detail: "pragmatic" },
  ],
  quizHistory: [
    { quiz: "A2 Vocabulary Test 1", score: 18, total: 20, date: "2026-08-29" },
    { quiz: "A2 Vocabulary Test 2", score: 15, total: 20, date: "2026-08-20" },
    { quiz: "A2 Grammar Quiz", score: 16, total: 20, date: "2026-08-12" },
    { quiz: "A1 Review Test", score: 20, total: 20, date: "2026-07-30" },
  ],
  monthlyProgress: [
    { month: "Apr", wordsLearned: 45, quizAvg: 72 },
    { month: "May", wordsLearned: 62, quizAvg: 75 },
    { month: "Jun", wordsLearned: 78, quizAvg: 78 },
    { month: "Jul", wordsLearned: 90, quizAvg: 80 },
    { month: "Aug", wordsLearned: 67, quizAvg: 78 },
  ],
};

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

async function buildBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function findUser(id: number): Promise<ApiUser | undefined> {
  const baseUrl = await buildBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/user/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const result = (await res.json()) as UserDetailResponse;
  if (!result.success || !result.data) return undefined;
  return result.data;
}

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await findUser(Number(id));
  if (!user) notFound();

  const rich = RICH;

  const stats = [
    { label: "Bookmarked", value: user.bookmarkedCount, icon: Bookmark },
    { label: "Still Learning", value: rich.stillLearning.length, icon: BookOpen },
    { label: "Learned", value: rich.learned.length, icon: GraduationCap },
    { label: "Quiz Result", value: `${rich.quizResult}%`, icon: ClipboardCheck },
  ];

  return (
    <div className="p-4 lg:p-8">
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
                  rich.status === "Active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {rich.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
        <UserActions user={user} status={rich.status} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
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
        <DailyProgress year={2026} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
              ["Status", rich.status],
              ["Total Words Studied", String(rich.totalWordsStudied)],
              ["Joined", formatDay(rich.joinedAt)],
              ["Last Active", formatDay(rich.lastActive)],
              ["Study Streak", `${rich.studyStreak} days`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-5 py-3 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{rich.bio}</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {rich.recentActivity.map((activity, i) => (
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
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Quiz History
            </h2>
          </div>
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
                {rich.quizHistory.map((q, i) => (
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
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Monthly Progress
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {rich.monthlyProgress.map((m, i) => (
              <li key={i} className="px-5 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {m.month}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {m.wordsLearned} words · avg {m.quizAvg}%
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
        </section>
      </div>
    </div>
  );
}
