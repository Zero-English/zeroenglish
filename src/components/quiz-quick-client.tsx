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

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

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
      <div className="px-4 py-8 sm:px-6 max-w-xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-lg bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="h-48 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <QuickStateCard
        icon={<CircleAlert className="h-7 w-7 text-rose-500" />}
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
        icon={<Sparkles className="h-7 w-7 text-amber-500" />}
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
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-lg mx-auto">
      <div className={cn(CARD, "p-5 sm:p-6 space-y-5")}>
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("কুইক কুইজ", "Quick Blitz Quiz")}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(
                "গ্রামার ও শ্রেণি ভিত্তিক প্রশ্ন থেকে দ্রুত ২০টি প্রশ্নের কুইজ দিন।",
                "A rapid 20-question mixed quiz from grammar and class topics."
              )}
            </p>
          </div>
        </div>

        {/* Feature stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ListOrdered className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                20
              </p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {t("প্রশ্ন", "Questions")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                20s
              </p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {t("প্রতি প্রশ্নে", "Per Question")}
              </p>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div>
          <Button
            onClick={onStart}
            disabled={starting}
            size="lg"
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white shadow-md shadow-rose-500/20 cursor-pointer"
          >
            {starting
              ? t("তৈরি হচ্ছে…", "Preparing…")
              : t("কুইজ শুরু করুন", "Start Quick Quiz")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
            {t(
              "সব ধরনের প্রশ্ন · ভোকাবুলারি কুইজ ছাড়া",
              "All grammar and class questions · no vocabulary"
            )}
          </p>
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
    <div className="px-4 py-8 sm:px-6 max-w-xl mx-auto">
      <div className={cn(CARD, "p-8 text-center space-y-4")}>
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]">
          {icon}
        </div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {desc}
        </p>
        <div className="pt-2">
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold cursor-pointer"
          >
            {actionLabel}
          </Button>
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
    <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto">
      <div className={cn(CARD, "p-5 sm:p-7 relative overflow-hidden")}>
        {/* Top bar HUD */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              {t("কুইক কুইজ", "Quick Quiz")}
            </span>
          </div>

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
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {t("স্কোর:", "Score:")} {score}
            </span>
            <button
              onClick={() => onExitOpenChange(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={t("কুইজ থেকে বেরিয়ে যান", "Exit quiz")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress track */}
        <div className="h-1.5 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-rose-500 to-pink-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider mb-2">
            {question.difficultyLevel} · {question.quizType}
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
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
              "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500";
              } else if (isWrongPick) {
                optionStyle =
                  "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500";
              } else {
                optionStyle =
                  "border-black/[0.04] dark:border-white/[0.04] opacity-40";
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
                    "flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                    isAnswered
                      ? isCorrectOption
                        ? "bg-emerald-500 text-white"
                        : isWrongPick
                          ? "bg-rose-500 text-white"
                          : "bg-black/[0.04] dark:bg-white/[0.06] text-zinc-400"
                      : "bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300"
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
                <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {isAnswered && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onNext}
              size="lg"
              className="px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white shadow-md shadow-rose-500/20 cursor-pointer"
            >
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
    resultLabel = t("চমৎকার ফলাফল!", "Excellent Mastery!");
  } else if (percentage >= 70) {
    resultColor = "text-sky-500";
    resultLabel = t("দারুণ অগ্রগতি!", "Great Progress!");
  } else if (percentage >= 50) {
    resultColor = "text-amber-500";
    resultLabel = t("ভালো চেষ্টা!", "Good Effort!");
  } else {
    resultColor = "text-rose-500";
    resultLabel = t("আরও অনুশীলন প্রয়োজন!", "Keep Practicing!");
  }

  return (
    <div className="px-4 py-8 sm:px-6 max-w-lg mx-auto">
      <div className={cn(CARD, "p-5 sm:p-7 space-y-5")}>
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("কুইজ সমাপ্ত!", "Quiz Completed!")}
          </h3>
          <p className={cn("text-xs sm:text-sm font-semibold mt-0.5", resultColor)}>
            {resultLabel}
          </p>
        </div>

        {/* Score Hero */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-5 text-center">
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {percentage}%
          </div>
          <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {score}
            </span>{" "}
            {t("টির মধ্যে সঠিক", "correct out of")}{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {total}
            </span>{" "}
            {t("টি প্রশ্ন", "questions")}
          </p>
        </div>

        {/* Wrong Answers Deck */}
        {incorrectAnswers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t(
                `ভুল উত্তর পর্যালোচনা (${incorrectAnswers.length})`,
                `Review Incorrect Answers (${incorrectAnswers.length})`
              )}
            </h4>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {incorrectAnswers.map(({ question, correctAnswer, userAnswer }, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-950/40 p-3.5 text-xs space-y-1.5"
                >
                  <Link
                    href={`/quiz/question/${question.id}`}
                    className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    {question.questionText}
                  </Link>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {userAnswer !== "Time's up!" && (
                      <span className="rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 font-medium">
                        {t("আপনার উত্তর:", "Your answer:")} {userAnswer}
                      </span>
                    )}
                    {userAnswer === "Time's up!" && (
                      <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">
                        {t("সময় শেষ", "Time expired")}
                      </span>
                    )}
                    <span className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-medium">
                      {t("সঠিক উত্তর:", "Correct:")} {correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={onRestart}
            size="lg"
            className="w-full sm:w-auto px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("আবার খেলুন", "Play Again")}
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
          >
            <Link href="/quiz">
              <ArrowRight className="h-4 w-4 mr-2" />
              {t("সব কুইজ", "All Quizzes")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}