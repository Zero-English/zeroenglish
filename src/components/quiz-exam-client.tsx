"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ClipboardList,
  Timer,
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
  type LucideIcon,
} from "lucide-react";
import { Classic } from "@/components/classic";
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
  QuizExamSubmitResponse,
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
    options: shuffleArray(q.options),
  }));
}

async function submitExamResult(args: {
  clientId: string;
  examId: number;
  timeTotalQuiz: number;
  status?: "ABANDONED";
  answers: { questionId: number; selectedOption: string }[];
}): Promise<QuizExamSubmitResponse | null> {
  try {
    const res = await fetch(`/api/v1/quiz-exam/${args.examId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        clientId: args.clientId,
        timeTotalQuiz: args.timeTotalQuiz,
        status: args.status,
        answers: args.answers,
      }),
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as {
      data?: QuizExamSubmitResponse | null;
      success?: boolean;
    };
    if (!body.success || !body.data) {
      return null;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-changed"));
    }
    return body.data;
  } catch {
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
  const examId = state.examId as number;
  const total = state.questions.length;
  const timeTotalQuiz = state.startedAt
    ? Math.round((Date.now() - state.startedAt) / 1000)
    : total * state.timePerQuestion;
  const answers = Object.entries(state.answers).map(([questionId, selectedOption]) => ({
    questionId: Number(questionId),
    selectedOption,
  }));

  void submitExamResult({
    clientId: `ab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    examId,
    timeTotalQuiz,
    status: "ABANDONED",
    answers,
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
  const officialResult = useQuizExamStore((s) => s.officialResult);

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
        officialResult={officialResult}
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
    if (aOpen && !bOpen) return -1;
    if (!aOpen && bOpen) return 1;
    if (aOpen && bOpen) return ac - bc;
    return ao - bo;
  });
}

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

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
        "group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60 transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-300",
          meta.gradient
        )}
      />

      <div className="relative flex items-center justify-between p-5 sm:p-6 pb-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_12px_-2px_rgba(16,24,40,0.2)]",
            meta.gradient
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              isOpen
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOpen ? "bg-emerald-500 animate-pulse" : "bg-sky-400"
              )}
            />
            {isOpen ? t("খোলা আছে (Live)", "Live / Open") : t("আসন্ন (Upcoming)", "Upcoming")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
            <Timer className="h-3 w-3" />
            {Math.floor(exam.timePerQuestion)}s / {t("প্রশ্ন", "q")}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 sm:px-6 pb-5">
        <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {exam.title}
        </h3>
        <p className={cn("text-xs sm:text-sm font-medium mt-0.5", meta.text)}>
          {t(meta.labelBn, meta.label)}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300">
            <ListChecks className="h-3 w-3 text-orange-500" />
            {exam.questionCount} {t("প্রশ্ন", "questions")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300">
            {exam.levels.join(", ")}
          </span>
        </div>

        <div
          className={cn(
            "mt-4 rounded-xl border px-3 py-2 flex items-center gap-2 text-xs",
            isOpen
              ? "bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
              : "bg-sky-50/70 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800"
          )}
        >
          {isOpen ? (
            <Hourglass className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <CalendarClock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          )}
          <span
            className={cn(
              "font-semibold",
              isOpen ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"
            )}
          >
            {isOpen ? t("শেষ হতে বাকি:", "Closes in:") : t("শুরু হতে বাকি:", "Opens in:")}
          </span>
          <span
            className={cn(
              "ml-auto font-bold tabular-nums",
              isOpen ? "text-amber-800 dark:text-amber-200" : "text-sky-800 dark:text-sky-200"
            )}
          >
            {formatCountdown(msLeft)}
          </span>
        </div>

        <div className="mt-4 pt-2">
          <Button
            onClick={() => void onStart(exam)}
            disabled={loading || !isOpen}
            size="lg"
            className={cn(
              "w-full h-11 text-sm font-semibold shadow-md transition-all cursor-pointer",
              isOpen
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            )}
          >
            {loading
              ? t("লোড হচ্ছে...", "Loading...")
              : isOpen
                ? t("পরীক্ষা শুরু করুন", "Start Exam")
                : t("নির্ধারিত সময়ে শুরু হবে", "Scheduled")}
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
        answers: {},
        incorrectAnswers: [],
        officialResult: null,
        submitClientId: null,
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
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t("কুইজ পরীক্ষা", "Quiz Exams")}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {t(
                  "সাপ্তাহিক ও নির্ধারিত সময়সূচীর লাইভ পরীক্ষায় অংশ নিন এবং আপনার দক্ষতা যাচাই করুন।",
                  "Join live scheduled tests, timed drills, and test your vocabulary mastery."
                )}
              </p>
            </div>
            {exams && exams.length > 0 && (
              <span className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 tabular-nums">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                {t(`${exams.length}টি পরীক্ষা`, `${exams.length} exams`)}
              </span>
            )}
          </div>

          {exams === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-zinc-200/60 dark:bg-zinc-800/40 animate-pulse h-56"
                />
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className={cn(CARD, "p-8 sm:p-10 text-center")}>
              <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                <Clock3 className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
                {t("বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই", "No exams are scheduled right now")}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {t(
                  "নির্ধারিত পরীক্ষা আসন্ন হলে সেগুলো এখানে কাউন্টডাউনসহ দেখা যাবে।",
                  "Upcoming scheduled exams will appear here with a live countdown."
                )}
              </p>
              <Link href="/quiz" className="inline-flex mt-6">
                <Button variant="outline" className="border-black/[0.08] dark:border-white/[0.1] cursor-pointer">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
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
                  className="w-full gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-700 text-white shadow-lg shadow-orange-500/20 cursor-pointer"
                  onClick={() => void handleAuthAction()}
                  disabled={authBusy}
                >
                  {authBusy ? (
                    <Classic className="h-4 w-4" />
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
                    className="w-full cursor-pointer"
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
    </div>
  );
}

function ExamQuizView({
  question,
  currentIndex,
  totalQuestions,
  timeLeft,
  selectedAnswer,
  isAnswered,
}: {
  question: QuizExamTakeQuestion;
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
}) {
  const t = useT();
  const speak = useSpeak();
  const [exitOpen, setExitOpen] = useState(false);
  const timePerQuestion = useQuizExamStore((s) => s.timePerQuestion);
  const answeredCount = useQuizExamStore((s) => Object.keys(s.answers).length);

  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const letters = ["A", "B", "C", "D", "E", "F"];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    useQuizExamStore.setState({
      selectedAnswer: option,
      isAnswered: true,
      answers: { ...useQuizExamStore.getState().answers, [question.id]: option },
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

    useQuizExamStore.setState({
      isAnswered: true,
      selectedAnswer: null,
    });
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
    <div className="relative min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className={cn(CARD, "p-5 sm:p-7 relative overflow-hidden")}>
          {/* Top HUD */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
              {t("প্রশ্ন", "Question")} {currentIndex + 1} / {totalQuestions}
            </span>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                  timeLeft <= 5
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300 animate-pulse"
                    : timeLeft <= 10
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300"
                )}
              >
                <Timer className="h-3 w-3" />
                {timeLeft}s
              </span>

              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 tabular-nums">
                {t("উত্তর:", "Answered:")} {answeredCount}
              </span>

              <button
                onClick={() => setExitOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={t("পরীক্ষা থেকে বেরিয়ে যান", "Exit exam")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-full mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-violet-500 to-purple-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {question.questionText}
              </h2>
              <button
                onClick={() => speak(question.questionText)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-black/[0.04] dark:bg-white/[0.06] transition-colors cursor-pointer"
                title={t("উচ্চারণ শুনুন", "Pronounce")}
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              const isSelected = isAnswered && option === selectedAnswer;

              const optionStyle = isSelected
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-200 ring-1 ring-violet-500"
                : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]";

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default",
                    optionStyle
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                      isSelected
                        ? "bg-violet-500 text-white"
                        : "bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300"
                    )}
                  >
                    {letters[i] ?? ""}
                  </span>

                  <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {isAnswered && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleNext}
                size="lg"
                className="px-8 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 cursor-pointer"
              >
                {currentIndex >= totalQuestions - 1
                  ? t("ফলাফল দেখুন", "See Results")
                  : t("পরের প্রশ্ন", "Next Question")}
              </Button>
            </div>
          )}
        </div>
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
  officialResult,
  score,
  total,
  incorrectAnswers,
}: {
  examId: number | null;
  officialResult: QuizExamSubmitResponse | null;
  score: number;
  total: number;
  incorrectAnswers: QuizExamIncorrectAnswer[];
}) {
  const t = useT();
  const { path, hydrated } = useAuthPath();
  const addHistoryEntry = useQuizExamHistoryStore((s) => s.addEntry);
  const percentage =
    officialResult != null
      ? officialResult.scoreInPercent
      : total > 0
        ? Math.round((score / total) * 100)
        : 0;

  const [saveState, setSaveState] = useState<"saving" | "saved" | "error">("saving");
  const attemptingRef = useRef(false);

  const record = useCallback(async () => {
    if (attemptingRef.current) return;
    if (useQuizExamStore.getState().resultsRecorded) {
      setSaveState("saved");
      return;
    }
    if (examId == null) {
      setSaveState("error");
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
      const answers = Object.entries(state.answers).map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }));
      let clientId = state.submitClientId;
      if (!clientId) {
        clientId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        useQuizExamStore.setState({ submitClientId: clientId });
      }
      const official = await submitExamResult({
        clientId,
        examId,
        timeTotalQuiz,
        answers,
      });
      if (!official) {
        setSaveState("error");
        return;
      }
      useQuizExamStore.setState({
        score: official.correctAnswers,
        incorrectAnswers: official.review,
        officialResult: official,
        resultsRecorded: true,
      });
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await incrementQuizzesDone(dateStr, path);
      await addCorrectAnswers(dateStr, official.correctAnswers, path);
      const entry: QuizExamHistoryEntry = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        examId,
        title: state.examTitle ?? "Quiz Exam",
        mode: state.examMode ?? "PRACTICE",
        date: dateStr,
        win: `${official.scoreInPercent}%`,
        levels,
        numberOfQuestions: total,
        timePerQuestion,
        createdAt: Date.now(),
        synced: true,
        dbId: official.id,
        status: official.status,
        isFirstAttempt: official.isFirstAttempt,
      };
      addHistoryEntry(entry);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("progress-changed"));
        window.dispatchEvent(new Event("activity-changed"));
      }
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      attemptingRef.current = false;
    }
  }, [examId, total, path, addHistoryEntry]);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => void record(), 0);
    return () => window.clearTimeout(id);
  }, [hydrated, record]);

  let resultColor: string;
  let resultLabel: string;
  if (percentage >= 90) {
    resultColor = "text-emerald-500";
    resultLabel = t("চমৎকার ফলাফল!", "Outstanding Exam Result!");
  } else if (percentage >= 70) {
    resultColor = "text-sky-500";
    resultLabel = t("দারুণ দক্ষতা!", "Great Performance!");
  } else if (percentage >= 50) {
    resultColor = "text-amber-500";
    resultLabel = t("ভালো চেষ্টা!", "Good Effort!");
  } else {
    resultColor = "text-rose-500";
    resultLabel = t("আরও প্রস্তুতি নিন!", "Needs Improvement!");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className={cn(CARD, "p-6 sm:p-8 space-y-6")}>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("পরীক্ষা সমাপ্ত!", "Exam Completed!")}
            </h1>
            <p className={cn("text-base sm:text-lg font-bold mt-1", resultColor)}>
              {resultLabel}
            </p>
          </div>

          {/* Score Box */}
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-6 text-center">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
              {percentage}%
            </div>
            <p className="mt-2 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {score}
              </span>{" "}
              {t("টির মধ্যে সঠিক", "correct out of")}{" "}
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                {total}
              </span>{" "}
              {t("টি প্রশ্ন", "questions")}
            </p>
          </div>

          {/* Missed questions review */}
          {incorrectAnswers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t(
                  `সঠিক নয় এমন প্রশ্ন (${incorrectAnswers.length})`,
                  `Questions to Review (${incorrectAnswers.length})`
                )}
              </h3>
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {incorrectAnswers.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-950/40 p-3.5 text-xs space-y-1.5"
                  >
                    <Link
                      href={`/quiz/question/${item.questionId}`}
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {item.questionText}
                    </Link>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.correctAnswer != null && (
                        <span className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-medium">
                          {t("সঠিক:", "Correct:")} {item.correctAnswer}
                        </span>
                      )}
                      {item.correctAnswer == null && (
                        <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">
                          {t("পরীক্ষা শেষে প্রকাশ করা হবে", "Revealed after exam")}
                        </span>
                      )}
                      {item.userAnswer != null && (
                        <span className="rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 font-medium">
                          {t("আপনার উত্তর:", "Your answer:")} {item.userAnswer}
                        </span>
                      )}
                      {item.userAnswer == null && (
                        <span className="rounded-md bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 font-medium">
                          {t("উত্তর দেওয়া হয়নি", "Unanswered")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Status & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {saveState === "saving" && (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Classic className="h-4 w-4" />
                {t("সংরক্ষণ করা হচ্ছে...", "Saving your result...")}
              </div>
            )}

            {saveState === "error" && (
              <Button
                onClick={() => void record()}
                className="w-full sm:w-auto px-6 bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
              >
                {t("আবার সংরক্ষণ করুন", "Retry saving")}
              </Button>
            )}

            {saveState === "saved" && (
              <>
                <Button
                  onClick={() => resetQuizExamState()}
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {t("পরীক্ষার তালিকায় ফিরুন", "Back to Exam List")}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
                >
                  <Link href="/quiz">
                    {t("কুইজ মেনু", "Quiz Hub")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}