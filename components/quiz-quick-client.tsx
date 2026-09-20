"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useAuthStore } from "@/lib/auth-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { requestLogin } from "@/lib/login-required";
import { QuizBackLink } from "@/components/quiz-back-link";
import {
  Zap,
  Check,
  X,
  RotateCcw,
  Timer,
  ListOrdered,
  Sparkles,
  ArrowRight,
  CircleAlert,
} from "lucide-react";

export interface QuickQuizQuestion {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: string;
  answer: string;
  explanation?: string;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Phase = "intro" | "loading" | "error" | "empty" | "quiz" | "results";

interface PlayOption {
  text: string;
  correct: boolean;
}

interface PlayQuestion {
  id: number;
  questionText: string;
  difficultyLevel: string;
  quizType: string;
  options: PlayOption[];
}

interface IncorrectRecord {
  question: QuickQuizQuestion;
  correctAnswer: string;
  userAnswer: string;
}

const QUICK_QUANTITY = 20;
const QUICK_TIME_PER_QUESTION = 20;

// Quick quiz questions carry a difficulty (EASY/MEDIUM/HARD). Map each
// difficulty to the CEFR band it represents so results can live in the same
// QuizResults table as every other practice mode.
const DIFFICULTY_TO_LEVEL: Record<Difficulty, string> = {
  EASY: "A1",
  MEDIUM: "B1",
  HARD: "C1",
};

const QUICK_STYLE = {
  gradient: "from-rose-500 to-pink-500",
  bg: "bg-rose-50 dark:bg-rose-950/40",
  border: "border-rose-200 dark:border-rose-800",
  text: "text-rose-700 dark:text-rose-300",
} as const;

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function newClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `qq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function toPlayQuestion(q: QuickQuizQuestion): PlayQuestion {
  return {
    id: q.id,
    questionText: q.questionText,
    difficultyLevel: q.difficultyLevel,
    quizType: q.quizType,
    options: shuffleArray([
      { text: q.answer, correct: true },
      ...shuffleArray(q.options.filter((o) => o !== q.answer)).map((o) => ({
        text: o,
        correct: false,
      })),
    ]),
  };
}

async function saveQuickQuizResultToDb(args: {
  userId: number | null;
  clientId: string;
  questionCount: number;
  levels: string[];
  timePerQuestion: number;
  timeTotalQuiz: number;
  correctAnswers: number;
  scoreInPercent: number;
  totalScore: number;
  correctQuestionIds: number[];
  incorrectQuestionIds: number[];
}): Promise<boolean> {
  if (args.userId == null) return false;
  try {
    const res = await fetch("/api/v1/quiz/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        clientId: args.clientId,
        title: "Quick Quiz",
        mode: "PRACTICE",
        quizType: "MIXED",
        questionCount: args.questionCount,
        levels: args.levels,
        timePerQuestion: args.timePerQuestion,
        timeTotalQuiz: args.timeTotalQuiz,
        scheduleEnabled: false,
        correctAnswers: args.correctAnswers,
        scoreInPercent: args.scoreInPercent,
        totalScore: args.totalScore,
        correctQuestionIds: args.correctQuestionIds,
        incorrectQuestionIds: args.incorrectQuestionIds,
      }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { success?: boolean };
    if (!body.success) return false;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("activity-changed"));
    }
    return true;
  } catch {
    // non-fatal; the practice session is already complete on screen
    return false;
  }
}

export function QuickQuizClient() {
  const t = useT();
  const userId = useAuthStore((s) => s.userId);

  const [phase, setPhase] = useState<Phase>("intro");

  // Quiz runtime
  const [quizQuestions, setQuizQuestions] = useState<PlayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectRecord[]>([]);
  const [exitOpen, setExitOpen] = useState(false);

  const isAnsweredRef = useRef(false);
  const quizQuestionsRef = useRef<PlayQuestion[]>([]);
  const currentIndexRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const correctQuestionIdsRef = useRef<number[]>([]);

  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);
  useEffect(() => {
    quizQuestionsRef.current = quizQuestions;
  }, [quizQuestions]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const setQuizChromeHidden = useQuizChrome((s) => s.setHidden);
  useEffect(() => {
    const active = phase === "quiz";
    setQuizChromeHidden(active);
    if (active) {
      requestQuizFullscreen();
    } else {
      exitQuizFullscreen();
    }
    return () => setQuizChromeHidden(false);
  }, [phase, setQuizChromeHidden]);

  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    if (starting) return;
    if (requestLogin()) return;
    setStarting(true);
    setPhase("loading");
    try {
      const res = await fetch(
        `/api/v1/quiz/quick?limit=${QUICK_QUANTITY}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as {
        data?: QuickQuizQuestion[];
        success?: boolean;
      };
      if (!res.ok || !json.success || !Array.isArray(json.data)) {
        setPhase("error");
        return;
      }
      const picked = shuffleArray(json.data).slice(0, QUICK_QUANTITY);
      if (picked.length === 0) {
        setPhase("empty");
        return;
      }
      const playQuestions = picked.map((q) => toPlayQuestion(q));
      const now = Date.now();
      setQuizQuestions(playQuestions);
      setCurrentIndex(0);
      setScore(0);
      setIncorrectAnswers([]);
      correctQuestionIdsRef.current = [];
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(QUICK_TIME_PER_QUESTION);
      setDeadlineAt(now + QUICK_TIME_PER_QUESTION * 1000);
      startedAtRef.current = now;
      setPhase("quiz");
      requestQuizFullscreen();
    } catch {
      setPhase("error");
    } finally {
      setStarting(false);
    }
  }, [starting]);

  function handleOptionClick(option: PlayOption) {
    if (isAnsweredRef.current) return;
    setIsAnswered(true);
    setSelectedAnswer(option.text);
    if (option.correct) {
      setScore((s) => s + 1);
      const q = quizQuestionsRef.current[currentIndexRef.current];
      if (q) correctQuestionIdsRef.current.push(q.id);
    } else {
      const idx = currentIndexRef.current;
      const q = quizQuestionsRef.current[idx];
      if (q) {
        const source: QuickQuizQuestion = {
          id: q.id,
          quizType: q.quizType,
          questionText: q.questionText,
          difficultyLevel: q.difficultyLevel,
          options: q.options.map((o) => o.text),
          answer: q.options.find((o) => o.correct)?.text ?? "",
        };
        setIncorrectAnswers((prev) => [
          ...prev,
          {
            question: source,
            correctAnswer: source.answer,
            userAnswer: option.text,
          },
        ]);
      }
    }
  }

  function handleNext() {
    if (currentIndex >= quizQuestions.length - 1) {
      setDeadlineAt(null);
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(QUICK_TIME_PER_QUESTION);
      setDeadlineAt(Date.now() + QUICK_TIME_PER_QUESTION * 1000);
    }
  }

  function handleRestart() {
    setQuizQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(0);
    setDeadlineAt(null);
    setIncorrectAnswers([]);
    startedAtRef.current = null;
    setPhase("intro");
  }

  // Countdown timer (one deadline per question).
  useEffect(() => {
    if (phase !== "quiz" || isAnswered || timeLeft < 0) return;
    const deadline = deadlineAt;
    if (deadline == null) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isAnswered, currentIndex]);

  // A question that hits zero without an answer is marked wrong.
  useEffect(() => {
    if (phase === "quiz" && !isAnsweredRef.current && timeLeft === 0) {
      const idx = currentIndexRef.current;
      const q = quizQuestionsRef.current[idx];
      if (q) {
        const source: QuickQuizQuestion = {
          id: q.id,
          quizType: q.quizType,
          questionText: q.questionText,
          difficultyLevel: q.difficultyLevel,
          options: q.options.map((o) => o.text),
          answer: q.options.find((o) => o.correct)?.text ?? "",
        };
        setIsAnswered(true);
        setSelectedAnswer(null);
        setIncorrectAnswers((prev) => [
          ...prev,
          {
            question: source,
            correctAnswer: source.answer,
            userAnswer: "Time's up!",
          },
        ]);
      } else {
        setIsAnswered(true);
        setSelectedAnswer(null);
      }
    }
  }, [timeLeft, phase]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "results" || savedRef.current) return;
    savedRef.current = true;
    const total = quizQuestionsRef.current.length;
    const finalScore = score;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    const levels = Array.from(
      new Set(
        quizQuestionsRef.current
          .map((q) => DIFFICULTY_TO_LEVEL[q.difficultyLevel as Difficulty])
          .filter(Boolean)
      )
    );
    const started = startedAtRef.current;
    const timeTotalQuiz =
      started != null ? Math.round((Date.now() - started) / 1000) : total * QUICK_TIME_PER_QUESTION;
    void saveQuickQuizResultToDb({
      userId,
      clientId: newClientId(),
      questionCount: total,
      levels,
      timePerQuestion: QUICK_TIME_PER_QUESTION,
      timeTotalQuiz,
      correctAnswers: finalScore,
      scoreInPercent: percentage,
      totalScore: finalScore,
      correctQuestionIds: [...new Set(correctQuestionIdsRef.current)],
      incorrectQuestionIds: incorrectAnswers.map((r) => r.question.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, userId]);

  useEffect(() => {
    if (phase !== "results") savedRef.current = false;
  }, [phase]);

  if (phase === "intro") {
    return <QuickIntro starting={starting} onStart={handleStart} />;
  }

  if (phase === "loading") {
    return (
      <div className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
        <div className="max-w-xl mx-auto">
          <QuizBackLink className="animate-fade-up mb-8" />
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
            <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <QuickStateCard
        icon={<CircleAlert className="h-7 w-7 text-zinc-400" />}
        title={t("কুইজটি লোড করা যায়নি", "Couldn't load this quiz")}
        desc={t(
          "আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
          "Check your internet connection and try again."
        )}
        actionLabel={t("আবার চেষ্টা করুন", "Try again")}
        onAction={() => void handleStart()}
      />
    );
  }

  if (phase === "empty") {
    return (
      <QuickStateCard
        icon={<Sparkles className="h-7 w-7 text-zinc-400" />}
        title={t("এখনো কোনো প্রশ্ন নেই", "No questions available yet")}
        desc={t(
          "এই মুহূর্তে কুইজের জন্য কোনো প্রশ্ন পাওয়া যায়নি। পরে আবার চেষ্টা করুন।",
          "There are no questions available right now. Please try again later."
        )}
        actionLabel={t("আবার চেষ্টা করুন", "Try again")}
        onAction={() => void handleStart()}
      />
    );
  }

  if (phase === "quiz") {
    const q = quizQuestions[currentIndex];
    if (!q) return null;
    return (
      <QuickQuizView
        question={q}
        currentIndex={currentIndex}
        totalQuestions={quizQuestions.length}
        score={score}
        timeLeft={timeLeft}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        exitOpen={exitOpen}
        onExitOpenChange={setExitOpen}
        onExitConfirm={() => setPhase("intro")}
        onOptionClick={handleOptionClick}
        onNext={handleNext}
      />
    );
  }

  return (
    <QuickResultsView
      score={score}
      total={quizQuestions.length}
      incorrectAnswers={incorrectAnswers}
      onRestart={handleRestart}
    />
  );
}

function QuickIntro({
  starting,
  onStart,
}: {
  starting: boolean;
  onStart: () => void;
}) {
  const t = useT();

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-2xl mx-auto">
        <QuizBackLink className="animate-fade-up mb-8" />

        <div className="animate-fade-up text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-300 mb-4">
            <Zap className="h-3.5 w-3.5" />
            {t("কুইক কুইজ", "Quick Quiz")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            {t("দ্রুত অনুশীলন", "Practice on the Go")}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {t(
              "গ্রামার ও শ্রেণি ভিত্তিক প্রশ্ন থেকে দ্রুত ২০টি প্রশ্নের কুইজ দিন।",
              "A rapid 20-question mixed quiz drawn from grammar and class-based questions."
            )}
          </p>
        </div>

        <div className="animate-fade-up-1 mx-auto max-w-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/40 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${QUICK_STYLE.bg}`}>
                <ListOrdered className={`h-5 w-5 ${QUICK_STYLE.text}`} />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  20
                </p>
                <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {t("প্রশ্ন", "Questions")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/40 p-4">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${QUICK_STYLE.bg}`}>
                <Timer className={`h-5 w-5 ${QUICK_STYLE.text}`} />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  20s
                </p>
                <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  {t("প্রতি প্রশ্নে", "per question")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={onStart}
              disabled={starting}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90"
            >
              {starting
                ? t("তৈরি হচ্ছে…", "Preparing…")
                : t("কুইজ শুরু করুন", "Start Quick Quiz")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-3">
              {t(
                "সব ধরনের প্রশ্ন · ভোকাবুলারি কুইজ ছাড়া",
                "All question types · no vocabulary quiz"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStateCard({
  icon,
  title,
  desc,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="max-w-2xl mx-auto">
        <QuizBackLink className="animate-fade-up mb-8" />
        <div className="animate-fade-up mx-auto max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {desc}
          </p>
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 mt-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 active:opacity-90 transition-opacity cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickQuizView({
  question,
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  selectedAnswer,
  isAnswered,
  exitOpen,
  onExitOpenChange,
  onExitConfirm,
  onOptionClick,
  onNext,
}: {
  question: PlayQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  exitOpen: boolean;
  onExitOpenChange: (open: boolean) => void;
  onExitConfirm: () => void;
  onOptionClick: (option: PlayOption) => void;
  onNext: () => void;
}) {
  const t = useT();
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {currentIndex + 1}
            </span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
            {totalQuestions}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span
              className={cn(
                "font-mono font-semibold",
                timeLeft <= 5
                  ? "text-red-500"
                  : timeLeft <= 10
                    ? "text-amber-500"
                    : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {timeLeft}s
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {t("স্কোর", "Score")}{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {score}
              </span>
            </span>
            <button
              onClick={() => onExitOpenChange(true)}
              className="p-2 -m-2 rounded-xl text-zinc-400 hover:text-red-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title={t("কুইজ থেকে বেরিয়ে যান", "Exit quiz")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-rose-500 to-pink-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="animate-fade-up mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
            {t("কুইক কুইজ", "Quick Quiz")} · {question.difficultyLevel}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {question.questionText}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const isCorrectOption = option.correct;
            const isWrongPick =
              isAnswered && option.text === selectedAnswer && !isCorrectOption;

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
                onClick={() => onOptionClick(option)}
                disabled={isAnswered}
                className={cn(
                  "w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default",
                  optionStyle
                )}
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
                    (letters[i] ?? "")
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm sm:text-base leading-relaxed",
                    isAnswered && isCorrectOption
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

        {/* Next button */}
        {isAnswered && (
          <div className="mt-7 flex justify-center animate-fade-up">
            <Button onClick={onNext} size="lg" className="px-10">
              {currentIndex >= totalQuestions - 1
                ? t("ফলাফল দেখুন", "See Results")
                : t("পরের প্রশ্ন", "Next Question")}
            </Button>
          </div>
        )}

        <ConfirmDialog
          open={exitOpen}
          onOpenChange={onExitOpenChange}
          variant="warning"
          title={t("কুইজটি ছেড়ে যাবেন?", "Exit the quiz?")}
          description={t(
            "আপনার অগ্রগতি সংরক্ষিত হবে না। আপনি কি নিশ্চিতভাবে প্রস্থান করতে চান?",
            "Your progress won't be saved. Are you sure you want to exit?"
          )}
          confirmText={t("প্রস্থান করুন", "Exit")}
          cancelText={t("চালিয়ে যান", "Keep going")}
          onConfirm={onExitConfirm}
        />
      </div>
    </div>
  );
}

function QuickResultsView({
  score,
  total,
  incorrectAnswers,
  onRestart,
}: {
  score: number;
  total: number;
  incorrectAnswers: IncorrectRecord[];
  onRestart: () => void;
}) {
  const t = useT();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

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
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 sm:p-10">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("কুইজ শেষ!", "Quiz Complete!")}
          </h3>
          <p className={cn("text-xl font-bold mt-2", resultColor)}>
            {resultLabel}
          </p>
        </div>

        <div className="mb-8">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border-2 backdrop-blur-sm p-8 text-center",
              QUICK_STYLE.border,
              QUICK_STYLE.bg
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-500 opacity-10" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-black/10">
                <Zap className="h-7 w-7" />
              </div>
              <div className="mt-4 text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {percentage}%
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
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
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
              {t(
                `ভুল উত্তরগুলো (${incorrectAnswers.length})`,
                `Incorrect Answers (${incorrectAnswers.length})`
              )}
            </h3>
            <div className="space-y-3">
              {incorrectAnswers.map(({ question, correctAnswer, userAnswer }, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-4"
                >
                  <Link
                    href={`/quiz/question/${question.id}`}
                    className="inline text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    {question.questionText}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {userAnswer !== "Time's up!" && (
                      <span className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 text-red-700 dark:text-red-300">
                        {t("আপনার উত্তর:", "Your answer:")} {userAnswer}
                      </span>
                    )}
                    {userAnswer === "Time's up!" && (
                      <span className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-1 text-amber-700 dark:text-amber-300">
                        {t("সময় শেষ হয়ে গেছে", "Time ran out")}
                      </span>
                    )}
                    <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                      {t("সঠিক উত্তর:", "Correct answer:")} {correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={onRestart} size="lg" className="px-8">
            <RotateCcw />
            {t("আবার খেলুন", "Play Again")}
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/quiz">
              <ArrowRight />
              {t("সব কুইজ", "All quizzes")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}