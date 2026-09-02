import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark, BookOpen, GraduationCap, ClipboardCheck, Hash } from "lucide-react";
import { dummyUsers, getUserById } from "../../_data/users";
import UserActions from "./user-actions";

export const metadata: Metadata = {
  title: "User Detail | Admin — Zero English",
};

export function generateStaticParams() {
  return dummyUsers.map((user) => ({ id: String(user.id) }));
}

export default async function SingleUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserById(Number(id));
  if (!user) notFound();

  const stats = [
    { label: "Bookmarked", value: user.bookmarked.length, icon: Bookmark },
    { label: "Still Learning", value: user.stillLearning.length, icon: BookOpen },
    { label: "Learned", value: user.learned.length, icon: GraduationCap },
    { label: "Quiz Result", value: `${user.quizResult}%`, icon: ClipboardCheck },
  ];

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${user.avatarColor}`}
          >
            {user.name.charAt(0)}
          </span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.name}
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
                  user.status === "Active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {user.status}
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

      <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-5 py-4">
          <Hash className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Vocabulary IDs
          </h2>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-3">
          <VocabGroup
            title="Learned"
            badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
            ids={user.learned}
          />
          <VocabGroup
            title="Still Learning"
            badgeColor="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            ids={user.stillLearning}
          />
          <VocabGroup
            title="Bookmarked"
            badgeColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
            ids={user.bookmarked}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
          </div>
          <dl className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ["Name", user.name],
              ["Email", user.email],
              ["Role", user.role],
              ["Status", user.status],
              ["Total Words Studied", String(user.totalWordsStudied)],
              ["Joined", user.joinedAt],
              ["Last Active", user.lastActive],
              ["Study Streak", `${user.studyStreak} days`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-5 py-3 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium capitalize text-gray-900 dark:text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.bio}</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {user.recentActivity.map((activity, i) => (
              <li key={i} className="flex items-start justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">{activity.detail}</p>
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
                {user.quizHistory.map((q, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{q.quiz}</td>
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
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{q.date}</td>
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
            {user.monthlyProgress.map((m, i) => (
              <li key={i} className="px-5 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{m.month}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {m.wordsLearned} words · avg {m.quizAvg}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.round((m.wordsLearned / 250) * 100))}%`,
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

function VocabGroup({
  title,
  badgeColor,
  ids,
}: {
  title: string;
  badgeColor: string;
  ids: number[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}
        >
          {ids.length} words
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span
            key={id}
            className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {id}
          </span>
        ))}
      </div>
    </div>
  );
}
