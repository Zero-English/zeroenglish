import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  Clock,
  FileQuestion,
  ListOrdered,
  Megaphone,
  Users,
} from "lucide-react";
import { getQuizExamById } from "@/services/quiz-exam.service";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { PublishToggle } from "./publish-toggle";
import { examModeLabelMap } from "../../_data/exams";
import { difficultyLabelMap, quizTypeLabelMap } from "../../_data/quizzes";

export const metadata: Metadata = {
  title: "Exam Detail | Admin — Zero English",
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function scoreBadgeClass(percent: number): string {
  if (percent >= 80)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  if (percent >= 60)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
  return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400";
}

function quizTypeLabel(name: string): string {
  return quizTypeLabelMap[name as keyof typeof quizTypeLabelMap] ?? name;
}

export default async function SingleExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const examId = Number(id);
  if (Number.isNaN(examId)) notFound();

  const result = await getQuizExamById(examId);
  if (!result.success || !result.data) notFound();

  const exam = result.data;

  const avgScore =
    exam.results.length > 0
      ? Math.round(
          exam.results.reduce((sum, r) => sum + r.scoreInPercent, 0) /
            exam.results.length
        )
      : null;

  const stats = [
    {
      label: "Questions",
      value: String(exam.questionCount),
      icon: FileQuestion,
    },
    {
      label: "Time / Question",
      value: `${exam.timePerQuestion}s`,
      icon: Clock,
    },
    {
      label: "Results",
      value: String(exam.results.length),
      icon: Users,
    },
    {
      label: "Avg. Score",
      value: avgScore !== null ? `${avgScore}%` : "—",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <Link
        href="/admin/exams"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exams
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {exam.title}
            </h1>
            <Badge variant="primary">{examModeLabelMap[exam.mode]}</Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                exam.resultsPublished
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              <Megaphone className="h-3 w-3" />
              {exam.resultsPublished ? "Results published" : "Results hidden"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>Created {formatDate(exam.createdAt)}</span>
            <span>Updated {formatDate(exam.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PublishToggle examId={exam.id} published={exam.resultsPublished} />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Configuration
            </h2>
          </div>
          <dl className="divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Mode</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {examModeLabelMap[exam.mode]}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Levels</dt>
              <dd className="flex flex-wrap gap-1">
                {exam.levels.length === 0 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  exam.levels.map((level) => (
                    <Badge key={level} variant="level">
                      {level}
                    </Badge>
                  ))
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">
                Questions
              </dt>
              <dd className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                <ListOrdered className="h-3.5 w-3.5 text-gray-400" />
                {exam.linkedQuestionCount} linked
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">
                Time / Question
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {exam.timePerQuestion}s
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Schedule</dt>
              <dd>
                {exam.scheduleEnabled ? (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {formatDate(exam.scheduledOpeningTime)} →{" "}
                      {formatDate(exam.scheduledClosingTime)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    Always open
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Linked Questions
            </h2>
          </div>
          {exam.questions.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
              No questions linked to this exam.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white dark:bg-gray-900">
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Question</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Difficulty</th>
                    <th className="px-4 py-2.5 font-medium">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.questions.map((q) => (
                    <tr
                      key={q.id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="px-4 py-2.5 text-gray-400">{q.id}</td>
                      <td className="max-w-xs px-4 py-2.5">
                        <p className="line-clamp-2 font-medium text-gray-900 dark:text-white">
                          {q.questionText}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="category">
                          {quizTypeLabel(q.quizType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="difficulty">
                          {difficultyLabelMap[q.difficultyLevel]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          {q.answer}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Results
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {exam.results.length} submission
            {exam.results.length === 1 ? "" : "s"}
          </span>
        </div>
        {!exam.resultsPublished && exam.results.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
            Results are hidden from users until you publish them.
          </div>
        )}
        {exam.results.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
            No results recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Quiz</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {exam.results.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          id={r.user.id}
                          name={r.user.name}
                          userName={r.user.user_name}
                          image={r.user.image}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {r.user.name || r.user.user_name}
                          </p>
                          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                            {r.user.email.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {quizTypeLabel(r.quizType)}
                        </span>
                        {r.levels.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {r.levels.map((level) => (
                              <Badge key={level} variant="level">
                                {level}
                              </Badge>
                            ))}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${scoreBadgeClass(
                            r.scoreInPercent
                          )}`}
                        >
                          {r.scoreInPercent}%
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {r.correctAnswers}/{r.questionCount} correct
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                      {r.timeTotalQuiz}s
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}