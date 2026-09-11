"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ClipboardList,
  Timer,
  Check,
  X,
  Volume2,
  Sparkles,
  CalendarClock,
  Hourglass,
  Clock3,
  ListChecks,
  GraduationCap,
  Trophy,
  ArrowLeft,
  Link2,
  LogIn,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useQuizExamStore, resetQuizExamState } from "@/lib/quiz-exam-store";
import { incrementQuizzesDone, addCorrectAnswers } from "@/lib/db";
import { useAuthPath, useAuthStore, useAuthStatus } from "@/lib/auth-store";
import { isOffline } from "@/lib/is-online";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  useQuizExamHistoryStore,
  type QuizExamHistoryEntry,
} from "@/lib/quiz-exam-history-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  QuizExamPublicItem,
  QuizExamTakeData,
  QuizExamTakeQuestion,
  QuizExamIncorrectAnswer,
} from "@/types/quiz-exam";

const MODE_META: Record<
  string,
  { label: string; labelBn: string; icon: LucideIcon; gradient: string; text: string; bg: string; border: string }
> = {
  PRACTICE: {
    label: "Practice Exam",
    labelBn: "প্র্যাকটিস পরীক্ষা",
    icon: GraduationCap,
    gradient: "from-sky-500 to-blue-500",
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
  },
  WEEKLY: {
    label: "Weekly Exam",
    labelBn: "সাপ্তাহিক পরীক্ষা",
    icon: Trophy,
    gradient: "from-emerald-500 to-teal-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  BIWEEKLY: {
    label: "Biweekly Exam",
    labelBn: "দ্বি-সাপ্তাহিক পরীক্ষা",
    icon: ClipboardList,
    gradient: "from-violet-500 to-purple-500",
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
  },
};

const EXAM_MODE_ENUM: Record<string, string> = {
  PRACTICE: "PRACTICE",
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
};

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className ?? "h-4 w-4"} aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

function requestQuizFullscreen(): void {
  if (
    typeof document !== "undefined" &&
    document.fullscreenEnabled &&
    !document.fullscreenElement
  ) {
    void document.documentElement.requestFullscreen().catch(() => {
      // Fullscreen may be blocked without a user gesture; ignore.
    });
  }
}

function exitQuizFullscreen(): void {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    void document.exitFullscreen().catch(() => {
      // Ignore exit fullscreen errors.
    });
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function toTakeQuestions(exam: QuizExamTakeData): QuizExamTakeQuestion[] {
  return exam.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    difficultyLevel: q.difficultyLevel,
    options: shuffleArray([
      { text: q.answer, correct: true },
      ...shuffleArray(q.options.filter((o) => o !== q.answer)).map((o) => ({
        text: o,
        correct: false,
      })),
    ]),
  }));
}

async function saveExamResultToDb(args: {
  userId: number | null;
  clientId: string;
  examId: number | null;
  title: string;
  mode: string;
  score: number;
  total: number;
  percentage: number;
  levels: string[];
  timePerQuestion: number;
  timeTotalQuiz: number;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  status?: "ABANDONED";
}): Promise<number | null> {
  if (!args.userId) return null;
  try {
    const res = await fetch("/api/v1/quiz/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        clientId: args.clientId,
        examId: args.examId,
        title: args.title,
        mode: EXAM_MODE_ENUM[args.mode] ?? "PRACTICE",
        quizType: "ENGLISH_TO_BANGLA",
        questionCount: args.total,
        levels: args.levels,
        timePerQuestion: args.timePerQuestion,
        timeTotalQuiz: args.timeTotalQuiz,
        scheduleEnabled: true,
        scheduledOpeningTime: args.scheduledOpeningTime ?? undefined,
        scheduledClosingTime: args.scheduledClosingTime ?? undefined,
        correctAnswers: args.score,
        scoreInPercent: args.percentage,
        totalScore: args.score,
        status: args.status,
      }),
    });
    if (!res.ok) {
      // non-fatal; the result is already stored in localStorage
      return null;
    }
    const body = (await res.json()) as { data?: { id?: number } | null; success?: boolean };
    if (!body.success) return null;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-changed"));
    }
    return typeof body.data?.id === "number" ? body.data.id : null;
  } catch {
    // non-fatal; the result is already stored in localStorage
    return null;
  }
}

function recordExamAbandon(): void {
  const st = useQuizExamStore.getState();
  const userId = useAuthStore.getState().userId;
  if (
    !userId ||
    !st.examId ||
    st.step !== "quiz" ||
    st.resultsRecorded ||
    st.abandonRecorded
  ) {
    return;
  }

  useQuizExamStore.setState({ abandonRecorded: true });

  const state = useQuizExamStore.getState();
  const total = state.questions.length;
  const timeTotalQuiz = state.startedAt
    ? Math.round((Date.now() - state.startedAt) / 1000)
    : total * state.timePerQuestion;

  void saveExamResultToDb({
    userId,
    clientId: `ab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    examId: state.examId,
    title: state.examTitle ?? "Quiz Exam",
    mode: state.examMode ?? "PRACTICE",
    score: state.score,
    total,
    percentage: total > 0 ? Math.round((state.score / total) * 100) : 0,
    levels: state.levels,
    timePerQuestion: state.timePerQuestion,
    timeTotalQuiz,
    scheduledOpeningTime: state.scheduledOpeningTime,
    scheduledClosingTime: state.scheduledClosingTime,
    status: "ABANDONED",
  });
}

function useNowMs(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, ms);
  const secs = Math.ceil(total / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function QuizExamClient() {
  const step = useQuizExamStore((s) => s.step);
  const examId = useQuizExamStore((s) => s.examId);
  const questions = useQuizExamStore((s) => s.questions);
  const currentIndex = useQuizExamStore((s) => s.currentIndex);
  const score = useQuizExamStore((s) => s.score);
  const selectedAnswer = useQuizExamStore((s) => s.selectedAnswer);
  const isAnswered = useQuizExamStore((s) => s.isAnswered);
  const timeLeft = useQuizExamStore((s) => s.timeLeft);
  const incorrectAnswers = useQuizExamStore((s) => s.incorrectAnswers);

  const setQuizChromeHidden = useQuizChrome((s) => s.setHidden);
  useEffect(() => {
    const active = step === "quiz";
    setQuizChromeHidden(active);
    if (active) {
      requestQuizFullscreen();
    } else {
      exitQuizFullscreen();
    }
    return () => setQuizChromeHidden(false);
  }, [step, setQuizChromeHidden]);

  if (step === "list") {
    return <ExamListView />;
  }

  if (step === "quiz") {
    const q = questions[currentIndex];
    if (!q) {
      return <ExamListView />;
    }
    return (
      <ExamQuizView
        question={q}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        score={score}
        timeLeft={timeLeft}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
      />
    );
  }

  if (step === "results") {
    return (
      <ExamResultsView
        examId={examId}
        score={score}
        total={questions.length}
        incorrectAnswers={incorrectAnswers}
      />
    );
  }

  return <ExamListView />;
}

function sortExams(exams: QuizExamPublicItem[]): QuizExamPublicItem[] {
  const now = Date.now();
  return [...exams].sort((a, b) => {
    const ao = new Date(a.scheduledOpeningTime ?? "").getTime();
    const ac = new Date(a.scheduledClosingTime ?? "").getTime();
    const bo = new Date(b.scheduledOpeningTime ?? "").getTime();
    const bc = new Date(b.scheduledClosingTime ?? "").getTime();
    const aOpen = Number.isFinite(ao) && Number.isFinite(ac) && now >= ao && now < ac;
    const bOpen = Number.isFinite(bo) && Number.isFinite(bc) && now >= bo && now < bc;
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    return (aOpen ? ac : ao) - (bOpen ? bc : bo);
  });
}

function ExamCardItem({
  exam,
  index,
  loading,
  onStart,
}: {
  exam: QuizExamPublicItem;
  index: number;
  loading: boolean;
  onStart: (exam: QuizExamPublicItem) => void;
}) {
  const t = useT();
  const now = useNowMs();

  const meta = MODE_META[exam.mode] ?? MODE_META.PRACTICE;
  const Icon = meta.icon;

  const opening = new Date(exam.scheduledOpeningTime ?? "").getTime();
  const closing = new Date(exam.scheduledClosingTime ?? "").getTime();
  const isOpen = Number.isFinite(opening) && Number.isFinite(closing) && now >= opening && now < closing;
  const countdownTarget = isOpen ? closing : opening;
  const msLeft = Number.isFinite(countdownTarget) ? countdownTarget - now : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.99]",
        meta.border,
        meta.bg
      )}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="relative flex items-center justify-between p-6 pb-4">
        <div className={cn("flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-black/10", meta.gradient)}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
              isOpen
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOpen ? "bg-emerald-500 animate-pulse" : "bg-sky-400"
              )}
            />
            {isOpen ? t("খোলা আছে", "Open") : t("আসন্ন", "Upcoming")}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold", meta.bg, meta.text)}>
            <Timer className="h-3 w-3" />
            {Math.floor(exam.timePerQuestion)}s / {t("প্রশ্ন", "question")}
          </span>
        </div>
      </div>

      <div className="relative flex-1 px-6 pb-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {exam.title}
        </h3>
        <p className={cn("text-sm font-medium mt-1", meta.text)}>
          {t(meta.labelBn, meta.label)}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            <ListChecks className="h-3 w-3" />
            {exam.questionCount} {t("প্রশ্ন", "questions")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            {exam.levels.join(", ")}
          </span>
        </div>

        <div
          className={cn(
            "mt-4 rounded-2xl border px-3 py-2.5 flex items-center gap-2",
            isOpen
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
              : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900"
          )}
        >
          {isOpen ? (
            <Hourglass className="h-4 w-4 text-amber-500" />
          ) : (
            <CalendarClock className="h-4 w-4 text-sky-500" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              isOpen ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"
            )}
          >
            {isOpen
              ? t("শেষ হতে বাকি:", "Closes in:")
              : t("শুরু হতে বাকি:", "Opens in:")}
          </span>
          <span
            className={cn(
              "ml-auto text-sm font-bold tabular-nums",
              isOpen ? "text-amber-800 dark:text-amber-200" : "text-sky-800 dark:text-sky-200"
            )}
          >
            {formatCountdown(msLeft)}
          </span>
        </div>

        <div className="mt-5">
          <Button
            onClick={() => void onStart(exam)}
            disabled={loading || !isOpen}
            size="lg"
            className="w-full px-8"
          >
            {loading
              ? t("লোড হচ্ছে...", "Loading...")
              : isOpen
                ? t("পরীক্ষা শুরু করুন", "Start Exam")
                : t("নির্ধারিত", "Scheduled")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExamListView() {
  const t = useT();
  const [exams, setExams] = useState<QuizExamPublicItem[] | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { status, hydrated } = useAuthStatus();
  const [authPrompt, setAuthPrompt] = useState<"login" | "bind" | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/quiz-exam/scheduled", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setExams([]);
          return;
        }
        const body = (await res.json()) as {
          data?: QuizExamPublicItem[];
          success?: boolean;
        };
        if (!cancelled) {
          setExams(body.success && Array.isArray(body.data) ? sortExams(body.data) : []);
        }
      } catch {
        if (!cancelled) setExams([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Identity adoption after the OAuth round-trip (login or guest bind) is
  // handled globally by SessionAdopter; the auth prompt below is only shown
  // while the store is still "none"/"guest", so it disappears automatically
  // once the identity reaches "google".
  const promptOpen =
    authPrompt !== null && (status === "none" || status === "guest");

  const handleAuthAction = async () => {
    if (authBusy) return;
    setAuthBusy(true);
    try {
      if (authPrompt === "bind") {
        const armRes = await fetch("/api/v1/auth/bind/begin", {
          method: "POST",
        });
        if (!armRes.ok) {
          toast.error(
            t(
              "সাইন-ইন শুরু করা যায়নি। আবার চেষ্টা করুন।",
              "Could not start sign-in. Please try again."
            )
          );
          return;
        }
      }
      const { signIn } = await import("next-auth/react");
      await signIn("google", {
        redirect: false,
        callbackUrl: "/quiz/exam",
      });
    } catch {
      toast.error(
        t("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", "Something went wrong. Please try again.")
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleStart = async (exam: QuizExamPublicItem) => {
    if (hydrated && status === "none") {
      setAuthPrompt("login");
      return;
    }
    if (hydrated && status === "guest") {
      setAuthPrompt("bind");
      return;
    }
    if (isOffline()) {
      toast.error(
        t(
          "পরীক্ষা দেওয়ার জন্য ইন্টারনেট সংযোগ প্রয়োজন।",
          "An internet connection is required to take the exam."
        )
      );
      return;
    }
    setLoadingId(exam.id);
    try {
      const res = await fetch(`/api/v1/quiz-exam/${exam.id}/take`, {
        cache: "no-store",
      });
      const body = (await res.json()) as {
        data?: QuizExamTakeData | null;
        message?: string;
        success?: boolean;
      };
      if (!res.ok || !body.success || !body.data) {
        toast.error(body.message ?? t("পরীক্ষা শুরু করা যায়নি", "Couldn't start the exam"));
        return;
      }
      const questions = toTakeQuestions(body.data);
      useQuizExamStore.setState({
        step: "quiz",
        examId: body.data.id,
        examTitle: body.data.title,
        examMode: body.data.mode,
        levels: body.data.levels,
        timePerQuestion: body.data.timePerQuestion,
        scheduledOpeningTime: body.data.scheduledOpeningTime,
        scheduledClosingTime: body.data.scheduledClosingTime,
        questions,
        currentIndex: 0,
        score: 0,
        selectedAnswer: null,
        isAnswered: false,
        incorrectAnswers: [],
        resultsRecorded: false,
        abandonRecorded: false,
        startedAt: 0,
        timeLeft: 0,
        deadlineAt: null,
      });
    } catch {
      toast.error(t("পরীক্ষা শুরু করা যায়নি", "Couldn't start the exam"));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-4xl">
        <div className="animate-fade-up text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t("নির্ধারিত পরীক্ষা", "Scheduled Exams")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            {t("কুইজ পরীক্ষা", "Quiz Exams")}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {t(
              "খোলা ও আসন্ন পরীক্ষাগুলো দেখুন, শেষ হবার আগেই সেগুলো নিন।",
              "See open and upcoming exams, and take them before they close."
            )}
          </p>
        </div>

        {exams === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40 animate-pulse h-56"
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center animate-fade-up">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
              <Clock3 className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {t("বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই", "No exams are scheduled right now")}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {t(
                "নির্ধারিত পরীক্ষা আসন্ন হলে সেগুলো এখানে কাউন্টডাউনসহ দেখা যাবে।",
                "Upcoming scheduled exams will appear here with a countdown."
              )}
            </p>
            <Link href="/quiz" className="inline-flex mt-6">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                {t("কুইজে ফিরে যান", "Back to Quiz")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {(exams ?? []).map((exam, i) => (
              <ExamCardItem
                key={exam.id}
                exam={exam}
                index={i}
                loading={loadingId === exam.id}
                onStart={(e) => void handleStart(e)}
              />
            ))}
          </div>
        )}
      </div>

      <Drawer open={promptOpen} onOpenChange={(open) => { if (!open) setAuthPrompt(null); }}>
        <DrawerContent className="mx-auto max-w-lg rounded-t-3xl">
          <div className="px-6 pb-8 pt-2">
            <div className="mb-5 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-orange-500/30">
                {authPrompt === "bind" ? (
                  <Link2 className="h-6 w-6" />
                ) : (
                  <LogIn className="h-6 w-6" />
                )}
              </div>
            </div>
            <DrawerTitle className="text-center text-base font-bold sm:text-lg">
              {authPrompt === "bind"
                ? t("অতিথি অ্যাকাউন্ট যুক্ত করুন", "Bind your guest account")
                : t("পরীক্ষা দেওয়ার জন্য সাইন-ইন দরকার", "Sign in to take the exam")}
            </DrawerTitle>
            <DrawerDescription className="mt-1.5 text-center text-xs sm:text-sm leading-relaxed">
              {authPrompt === "bind"
                ? t(
                    "পরীক্ষায় অংশ নেওয়ার আগে আপনার Google অ্যাকাউন্ট যুক্ত করতে হবে। আপনার অতিথি অগ্রগতি স্বয়ংক্রিয়ভাবে নতুন অ্যাকাউন্টে সিঙ্ক হবে।",
                    "You need to link a Google account before taking the exam. Your guest progress will be synced to the new account automatically."
                  )
                : t(
                    "পরীক্ষায় অংশ নেওয়ার জন্য একটি Google অ্যাকাউন্ট দিয়ে সাইন-ইন করতে হবে।",
                    "You need to sign in with a Google account to take the exam."
                  )}
            </DrawerDescription>
            <div className="mt-5 space-y-2">
              <Button
                size="lg"
                className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
                onClick={() => void handleAuthAction()}
                disabled={authBusy}
              >
                {authBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {authPrompt === "bind"
                  ? t("Google অ্যাকাউন্ট যুক্ত করুন", "Link Google account")
                  : t("Google দিয়ে চালিয়ে যান", "Continue with Google")}
              </Button>
              <DrawerClose asChild>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full"
                  disabled={authBusy}
                >
                  {t("পরে যুক্ত করুন", "Maybe later")}
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function ExamQuizView({
  question,
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  selectedAnswer,
  isAnswered,
}: {
  question: QuizExamTakeQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
}) {
  const t = useT();
  const speak = useSpeak();
  const [exitOpen, setExitOpen] = useState(false);
  const timePerQuestion = useQuizExamStore((s) => s.timePerQuestion);

  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const letters = ["A", "B", "C", "D", "E", "F"];

  const isAnsweredRef = useRef(false);
  const questionsRef = useRef<QuizExamTakeQuestion[]>([]);
  const currentIndexRef = useRef(0);
  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);
  useEffect(() => {
    questionsRef.current = useQuizExamStore.getState().questions;
  }, [question]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleOptionClick = (option: { text: string; correct: boolean }) => {
    if (isAnswered) return;
    useQuizExamStore.setState({
      selectedAnswer: option.text,
      isAnswered: true,
      score: score + (option.correct ? 1 : 0),
      incorrectAnswers: [
        ...useQuizExamStore.getState().incorrectAnswers,
        ...(option.correct
          ? []
          : [
              {
                questionId: question.id,
                questionText: question.questionText,
                correctAnswer: question.options.find((o) => o.correct)?.text ?? "",
                userAnswer: option.text,
              },
            ]),
      ],
    });
  };

  const handleNext = () => {
    if (currentIndex >= totalQuestions - 1) {
      useQuizExamStore.setState({ step: "results" });
    } else {
      useQuizExamStore.setState({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        timeLeft: timePerQuestion,
        deadlineAt: Date.now() + timePerQuestion * 1000,
      });
    }
  };

  useEffect(() => {
    if (isAnswered || timeLeft < 0) return;

    const now = Date.now();
    const current = useQuizExamStore.getState();
    let deadline = current.deadlineAt;
    if (deadline == null) {
      deadline = now + timePerQuestion * 1000;
      useQuizExamStore.setState({
        startedAt: current.startedAt || now,
        timeLeft: timePerQuestion,
        deadlineAt: deadline,
      });
    }

    useQuizExamStore.setState({
      timeLeft: Math.max(0, Math.ceil((deadline - now) / 1000)),
    });

    const timer = setInterval(() => {
      useQuizExamStore.setState({
        timeLeft: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, currentIndex, timePerQuestion]);

  useEffect(() => {
    const st = useQuizExamStore.getState();
    if (st.isAnswered || st.deadlineAt == null || st.timeLeft !== 0) return;

    const q = questionsRef.current[currentIndexRef.current];
    if (q) {
      useQuizExamStore.setState((prev) => ({
        isAnswered: true,
        selectedAnswer: null,
        score: prev.score,
        incorrectAnswers: [
          ...prev.incorrectAnswers,
          {
            questionId: q.id,
            questionText: q.questionText,
            correctAnswer: q.options.find((o) => o.correct)?.text ?? "",
            userAnswer: "Time's up!",
          },
        ],
      }));
    }
  }, [timeLeft, isAnswered]);

  useEffect(() => {
    const handleHide = () => {
      const st = useQuizExamStore.getState();
      if (st.step === "quiz" && !st.resultsRecorded && !st.abandonRecorded) {
        recordExamAbandon();
      }
    };
    window.addEventListener("pagehide", handleHide);
    window.addEventListener("beforeunload", handleHide);
    return () => {
      window.removeEventListener("pagehide", handleHide);
      window.removeEventListener("beforeunload", handleHide);
    };
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden px-6 py-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("প্রশ্ন", "Question")} {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
            <Timer className="h-4 w-4 text-amber-500" />
            {timeLeft}s
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {t("স্কোর", "Score")}{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{score}</span>
          </span>
          <button
            onClick={() => setExitOpen(true)}
            className="p-2 -m-2 rounded-xl text-zinc-400 hover:text-red-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            title={t("পরীক্ষা থেকে বেরিয়ে যান", "Exit exam")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-violet-500 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-500 dark:text-zinc-400">
              {t("বহুনির্বাচনী প্রশ্ন", "Multiple Choice")}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight inline-flex items-center gap-3 justify-center text-center mb-8">
            <span>{question.questionText}</span>
            <button
              onClick={() => speak(question.questionText)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
            >
              <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </h2>
        </div>

        <div className="space-y-2.5 pt-4">
          {question.options.map((option, i) => {
            const isCorrectOption = option.correct;
            const isWrongPick = isAnswered && option.text === selectedAnswer && !isCorrectOption;

            let optionStyle =
              "border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/60";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30";
              } else if (isWrongPick) {
                optionStyle =
                  "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-400/30";
              } else {
                optionStyle =
                  "border-zinc-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-950/30 opacity-50";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <span
                  className={cn(
                    "flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                    isAnswered
                      ? isCorrectOption
                        ? "bg-emerald-500 text-white"
                        : isWrongPick
                        ? "bg-red-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {isAnswered && (isCorrectOption || isWrongPick) ? (
                    isCorrectOption ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )
                  ) : (
                    letters[i] ?? ""
                  )}
                </span>

                <span
                  className={cn(
                    "flex-1 text-sm sm:text-base leading-relaxed",
                    isCorrectOption && isAnswered
                      ? "text-emerald-800 dark:text-emerald-200 font-medium"
                      : isWrongPick
                      ? "text-red-800 dark:text-red-200 font-medium"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-7 flex justify-center animate-fade-up">
            <Button onClick={handleNext} size="lg" className="px-10">
              {currentIndex >= totalQuestions - 1
                ? t("ফলাফল দেখুন", "See Results")
                : t("পরের প্রশ্ন", "Next Question")}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        variant="warning"
        title={t("পরীক্ষাটি ছেড়ে যাবেন?", "Exit the exam?")}
        description={t(
          "আপনার অগ্রগতি সংরক্ষিত হবে না। আপনি কি নিশ্চিতভাবে প্রস্থান করতে চান?",
          "Your progress won't be saved. Are you sure you want to exit?"
        )}
        confirmText={t("প্রস্থান করুন", "Exit")}
        cancelText={t("চালিয়ে যান", "Keep going")}
        onConfirm={() => {
          if (useQuizExamStore.getState().step === "quiz") {
            recordExamAbandon();
          }
          resetQuizExamState();
        }}
      />
    </div>
  );
}

function ExamResultsView({
  examId,
  score,
  total,
  incorrectAnswers,
}: {
  examId: number | null;
  score: number;
  total: number;
  incorrectAnswers: QuizExamIncorrectAnswer[];
}) {
  const t = useT();
  const { path, hydrated } = useAuthPath();
  const userId = useAuthStore((s) => s.userId);
  const addHistoryEntry = useQuizExamHistoryStore((s) => s.addEntry);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const [saveState, setSaveState] = useState<"saving" | "saved" | "error">("saving");
  const attemptingRef = useRef(false);

  // Exam results live in the database, so the upload is mandatory: the attempt
  // is finalized only after the POST succeeds (retry is offered otherwise).
  const record = useCallback(async () => {
    if (attemptingRef.current) return;
    if (useQuizExamStore.getState().resultsRecorded) {
      setSaveState("saved");
      return;
    }
    attemptingRef.current = true;
    setSaveState("saving");
    const state = useQuizExamStore.getState();
    const levels = state.levels;
    const timePerQuestion = state.timePerQuestion;
    const timeTotalQuiz = state.startedAt
      ? Math.round((Date.now() - state.startedAt) / 1000)
      : total * timePerQuestion;
    try {
      const dbId = await saveExamResultToDb({
        userId,
        clientId:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        examId: examId ?? null,
        title: state.examTitle ?? "Quiz Exam",
        mode: state.examMode ?? "PRACTICE",
        score,
        total,
        percentage,
        levels,
        timePerQuestion,
        timeTotalQuiz,
        scheduledOpeningTime: state.scheduledOpeningTime,
        scheduledClosingTime: state.scheduledClosingTime,
      });
      if (dbId == null) {
        setSaveState("error");
        return;
      }
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await incrementQuizzesDone(dateStr, path);
      await addCorrectAnswers(dateStr, score, path);
      const entry: QuizExamHistoryEntry = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        examId: examId ?? 0,
        title: state.examTitle ?? "Quiz Exam",
        mode: state.examMode ?? "PRACTICE",
        date: dateStr,
        win: `${percentage}%`,
        levels,
        numberOfQuestions: total,
        timePerQuestion,
        createdAt: Date.now(),
        synced: true,
        dbId,
      };
      addHistoryEntry(entry);
      useQuizExamStore.setState({ resultsRecorded: true });
      setSaveState("saved");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("progress-changed"));
        window.dispatchEvent(new Event("activity-changed"));
      }
    } catch {
      setSaveState("error");
    } finally {
      attemptingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, score, total, percentage, path]);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => void record(), 0);
    return () => window.clearTimeout(id);
  }, [hydrated, record]);

  let resultColor: string;
  let resultLabel: string;
  if (percentage >= 90) {
    resultColor = "text-emerald-500";
    resultLabel = t("চমৎকার!", "Excellent!");
  } else if (percentage >= 70) {
    resultColor = "text-sky-500";
    resultLabel = t("দারুণ হয়েছে!", "Great Job!");
  } else if (percentage >= 50) {
    resultColor = "text-amber-500";
    resultLabel = t("ভালো চেষ্টা!", "Good Effort!");
  } else {
    resultColor = "text-rose-500";
    resultLabel = t("অনুশীলন চালিয়ে যান!", "Keep Practicing!");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-up text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            {t("পরীক্ষা শেষ!", "Exam Complete!")}
          </h1>
          <p className={`text-2xl font-bold mt-2 ${resultColor}`}>
            {resultLabel}
          </p>
        </div>

        <div className="animate-fade-up-1 mb-10">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-8 text-center">
            <div className="text-6xl sm:text-7xl font-black bg-gradient-to-br from-zinc-700 to-zinc-400 dark:from-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent mb-2">
              {percentage}%
            </div>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {score}
              </span>{" "}
              {t("টির মধ্যে সঠিক", "correct out of")}{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {total}
              </span>{" "}
              {t("প্রশ্ন", "questions")}
            </p>
          </div>
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="animate-fade-up-2 mb-10">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
              {t(
                `সঠিক নয় এমন প্রশ্ন (${incorrectAnswers.length})`,
                `Questions to Review (${incorrectAnswers.length})`
              )}
            </h3>
            <div className="space-y-3">
              {incorrectAnswers.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-4 sm:p-5"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {item.questionText}
                    </span>
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    <p className="text-emerald-600 dark:text-emerald-400">
                      {t("সঠিক:", "Correct:")} {item.correctAnswer}
                    </p>
                    {item.userAnswer !== "Time's up!" && (
                      <p className="text-red-500 dark:text-red-400">
                        {t("আপনার উত্তর:", "Your answer:")} {item.userAnswer}
                      </p>
                    )}
                    {item.userAnswer === "Time's up!" && (
                      <p className="text-amber-500 dark:text-amber-400">
                        {t("সময় শেষ হয়ে গেছে", "Time ran out")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-up-3 flex flex-col sm:flex-row gap-3 justify-center">
          {saveState === "saving" && (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t(
                "ফলাফল ডেটাবেসে সংরক্ষণ করা হচ্ছে...",
                "Saving your result to the database..."
              )}
            </div>
          )}

          {saveState === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Loader2 className="h-4 w-4" />
                {t(
                  "ফলাফল সংরক্ষণ করা যায়নি। ইন্টারনেট সংযোগ সংরক্ষণের জন্য প্রয়োজন।",
                  "Your result couldn't be saved. An internet connection is required to save exam results."
                )}
              </p>
              <Button size="lg" className="px-8" onClick={() => void record()}>
                {t("আবার চেষ্টা করুন", "Retry")}
              </Button>
            </div>
          )}

          {saveState === "saved" && (
            <>
              <Button
                onClick={() => resetQuizExamState()}
                size="lg"
                className="px-8"
              >
                {t("পরীক্ষার তালিকায় ফিরুন", "Back to Exam List")}
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  {t("হোমে ফিরে যান", "Back to Home")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}