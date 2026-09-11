"use client";

import { useEffect, useRef, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import { useT, useNum } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useQuizExamStore, resetQuizExamState } from "@/lib/quiz-exam-store";
import { incrementQuizzesDone, addCorrectAnswers } from "@/lib/db";
import { useAuthPath, useAuthStore } from "@/lib/auth-store";
import {
  useQuizExamHistoryStore,
  type QuizExamHistoryEntry,
} from "@/lib/quiz-exam-history-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  QuizExamPublicItem,
  QuizExamTakeData,
  QuizExamTakeQuestion,
  QuizExamFinalResult,
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

function toTakeQuestions(exam: QuizExamTakeData): QuizExamTakeQuestion[] {
  return exam.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    difficultyLevel: q.difficultyLevel,
    options: q.options,
  }));
}

async function submitExamAnswers(): Promise<{
  success: boolean;
  result?: QuizExamFinalResult;
}> {
  const st = useQuizExamStore.getState();
  if (!st.examId) return { success: false };

  const clientId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `exam-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const timeTotalQuiz = st.startedAt
    ? Math.round((Date.now() - st.startedAt) / 1000)
    : st.questions.length * st.timePerQuestion;

  const answers = Object.entries(st.answers)
    .map(([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption,
    }))
    .filter((a) => Number.isFinite(a.questionId));

  try {
    const res = await fetch(`/api/v1/quiz-exam/${st.examId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, timeTotalQuiz, answers }),
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: QuizExamFinalResult | null;
    };
    if (!res.ok || !json.success || !json.data) return { success: false };
    useQuizExamStore.setState({
      finalResult: json.data,
      resultsRecorded: false,
      abandonRecorded: true,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-changed"));
    }
    return { success: true, result: json.data };
  } catch {
    return { success: false };
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

  const timeTotalQuiz = st.startedAt
    ? Math.round((Date.now() - st.startedAt) / 1000)
    : st.questions.length * st.timePerQuestion;

  const answers = Object.entries(st.answers).map(
    ([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption,
    })
  );

  // Best-effort, fire-and-forget: the server marks the attempt ABANDONED
  // (never the official first attempt) and grades whatever was answered.
  void fetch(`/api/v1/quiz-exam/${st.examId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      clientId: `ab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      status: "ABANDONED",
      timeTotalQuiz,
      answers,
    }),
  }).catch(() => {
    // non-fatal; the abandon record is best-effort
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

function formatCountdown(ms: number, num: (n: number) => string): string {
  const total = Math.max(0, ms);
  const secs = Math.ceil(total / 1000);
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  if (days > 0) return `${num(days)}d ${num(hours)}h ${num(minutes)}m`;
  if (hours > 0) return `${num(hours)}h ${num(minutes)}m ${num(seconds)}s`;
  if (minutes > 0) return `${num(minutes)}m ${num(seconds)}s`;
  return `${num(seconds)}s`;
}

export function QuizExamClient() {
  const step = useQuizExamStore((s) => s.step);
  const questions = useQuizExamStore((s) => s.questions);
  const currentIndex = useQuizExamStore((s) => s.currentIndex);
  const selectedAnswer = useQuizExamStore((s) => s.selectedAnswer);
  const isAnswered = useQuizExamStore((s) => s.isAnswered);
  const timeLeft = useQuizExamStore((s) => s.timeLeft);

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
    return <ExamResultsView />;
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
  const num = useNum();
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
            {num(Math.floor(exam.timePerQuestion))}s / {t("প্রশ্ন", "question")}
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
            {num(exam.questionCount)} {t("প্রশ্ন", "questions")}
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
            {formatCountdown(msLeft, num)}
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

  const handleStart = async (exam: QuizExamPublicItem) => {
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
        answers: {},
        finalResult: null,
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
  const num = useNum();
  const speak = useSpeak();
  const [exitOpen, setExitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // The client never learns which option is correct (answers are only graded
  // server-side on submission), so it only records the user's selection.
  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    useQuizExamStore.setState({
      selectedAnswer: option,
      isAnswered: true,
      answers: { ...useQuizExamStore.getState().answers, [question.id]: option },
    });
  };

  const handleNext = async () => {
    if (currentIndex >= totalQuestions - 1) {
      setSubmitting(true);
      const { success } = await submitExamAnswers();
      setSubmitting(false);
      if (success) {
        useQuizExamStore.setState({ step: "results" });
      } else {
        toast.error(t("ফলাফল জমা দেওয়া যায়নি", "Couldn't submit your answers"));
      }
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
      // Timeout: mark the question as answered-but-skipped. It is graded as
      // unanswered (incorrect) server-side; nothing else happens here.
      useQuizExamStore.setState({
        isAnswered: true,
        selectedAnswer: null,
      });
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
            {t("প্রশ্ন", "Question")} {num(currentIndex + 1)} / {num(totalQuestions)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
            <Timer className="h-4 w-4 text-amber-500" />
            {timeLeft}s
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
            // The client never knows the correct answer (grading happens
            // server-side), so it only highlights the user's own selection.
            const isPicked = isAnswered && option === selectedAnswer;

            let optionStyle =
              "border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/60";

            if (isAnswered) {
              optionStyle = isPicked
                ? "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-400/30"
                : "border-zinc-200 dark:border-zinc-700 bg-white/40 dark:bg-zinc-950/30 opacity-50";
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
                      ? isPicked
                        ? "bg-violet-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {isAnswered && isPicked ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    letters[i] ?? ""
                  )}
                </span>

                <span
                  className={cn(
                    "flex-1 text-sm sm:text-base leading-relaxed",
                    isPicked
                      ? "text-violet-800 dark:text-violet-200 font-medium"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-7 flex justify-center animate-fade-up">
            <Button
              onClick={handleNext}
              size="lg"
              className="px-10"
              disabled={submitting}
            >
              {submitting
                ? t("জমা দেওয়া হচ্ছে…", "Submitting…")
                : currentIndex >= totalQuestions - 1
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

function ExamResultsView() {
  const t = useT();
  const num = useNum();
  const { path, hydrated } = useAuthPath();
  const addHistoryEntry = useQuizExamHistoryStore((s) => s.addEntry);
  const updateHistoryEntry = useQuizExamHistoryStore((s) => s.updateEntry);
  const finalResult = useQuizExamStore((s) => s.finalResult);

  useEffect(() => {
    if (!hydrated || !finalResult || useQuizExamStore.getState().resultsRecorded) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    incrementQuizzesDone(dateStr, path);
    addCorrectAnswers(dateStr, finalResult.correctAnswers, path);

    const state = useQuizExamStore.getState();
    const levels = state.levels;
    const timePerQuestion = state.timePerQuestion;
    const entry: QuizExamHistoryEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      examId: state.examId ?? 0,
      title: state.examTitle ?? "Quiz Exam",
      mode: state.examMode ?? "PRACTICE",
      date: dateStr,
      win: `${finalResult.scoreInPercent}%`,
      levels,
      numberOfQuestions: finalResult.questionCount,
      timePerQuestion,
      createdAt: Date.now(),
    };
    addHistoryEntry(entry);
    // The server already persisted this attempt; the history entry references
    // the server record so it does not need a separate sync request.
    updateHistoryEntry(entry.id, { synced: true, dbId: finalResult.id });
    useQuizExamStore.setState({ resultsRecorded: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, finalResult]);

  if (!finalResult) {
    return null;
  }

  const total = finalResult.questionCount;
  const score = finalResult.correctAnswers;
  const percentage = finalResult.scoreInPercent;

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
              {num(percentage)}%
            </div>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {num(score)}
              </span>{" "}
              {t("টির মধ্যে সঠিক", "correct out of")}{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {num(total)}
              </span>{" "}
              {t("প্রশ্ন", "questions")}
            </p>
          </div>
        </div>

        {finalResult.review.length > 0 && (
          <div className="animate-fade-up-2 mb-10">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
              {t(
                `সঠিক নয় এমন প্রশ্ন (${num(finalResult.review.length)})`,
                `Questions to Review (${finalResult.review.length})`
              )}
            </h3>
            <div className="space-y-3">
              {finalResult.review.map((item, i) => (
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
                    {item.userAnswer !== null ? (
                      <p className="text-red-500 dark:text-red-400">
                        {t("আপনার উত্তর:", "Your answer:")} {item.userAnswer}
                      </p>
                    ) : (
                      <p className="text-amber-500 dark:text-amber-400">
                        {t("উত্তর দেওয়া হয়নি", "Not answered")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-up-3 flex flex-col sm:flex-row gap-3 justify-center">
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
        </div>
      </div>
    </div>
  );
}