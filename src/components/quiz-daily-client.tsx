"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useAuthStore } from "@/lib/auth-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { requestGoogleLogin } from "@/lib/login-required";
import { GoogleIcon } from "@/components/login-required-drawer";
import {
  Flame,
  Check,
  X,
  Timer,
  ListOrdered,
  ArrowRight,
  CircleAlert,
  Clock,
  BookOpen,
  Layers,
  CalendarCheck,
} from "lucide-react";

export interface DailyPracticeOption {
  text: string;
  correct: boolean;
}

export interface DailyPracticeQuestion {
  id: number;
  type: "VOCABULARY" | "GRAMMAR";
  category: string;
  questionText: string;
  options: DailyPracticeOption[];
  difficultyLevel: string;
  explanation?: string;
  wordId?: number;
  questionId?: number;
}

interface IncorrectRecord {
  question: DailyPracticeQuestion;
  correctAnswer: string;
  userAnswer: string;
}

type Phase = "intro" | "loading" | "error" | "empty" | "quiz" | "results" | "completed";

const TIME_PER_QUESTION = 20;

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function newClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `dp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function QuizDailyClient() {
  const t = useT();
  const authStatus = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.userId);
  const isGoogleAuth = authStatus === "google" && userId != null;

  const [phase, setPhase] = useState<Phase>("intro");
  const [streak, setStreak] = useState(0);
  const [nextResetSeconds, setNextResetSeconds] = useState(0);
  const [todayResult, setTodayResult] = useState<{
    scoreInPercent: number;
    correctAnswers: number;
    questionCount: number;
    timeTotalQuiz: number;
  } | null>(null);

  // Quiz runtime
  const [questions, setQuestions] = useState<DailyPracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectRecord[]>([]);
  const [exitOpen, setExitOpen] = useState(false);

  const isAnsweredRef = useRef(false);
  const questionsRef = useRef<DailyPracticeQuestion[]>([]);
  const currentIndexRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const correctWordIdsRef = useRef<number[]>([]);
  const incorrectWordIdsRef = useRef<number[]>([]);
  const correctQuestionIdsRef = useRef<number[]>([]);
  const incorrectQuestionIdsRef = useRef<number[]>([]);

  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const setQuizChromeHidden = useQuizChrome((s) => s.setHidden);
  useEffect(() => {
    const active = phase === "quiz";
    setQuizChromeHidden(active);
    return () => setQuizChromeHidden(false);
  }, [phase, setQuizChromeHidden]);

  // Data fetching helper
  const loadDailyData = useCallback(() => {
    let cancelled = false;
    const clientDate = fmtDate(new Date());

    fetch(`/api/v1/quiz/daily?clientDate=${clientDate}`, { cache: "no-store" })
      .then((res) => {
        if (cancelled) return null;
        if (res.status === 401) {
          setPhase("intro");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json) return;
        if (!json.success) {
          setPhase("error");
          return;
        }
        setStreak(json.data.streak ?? 0);
        setNextResetSeconds(json.data.nextResetSeconds ?? 0);
        if (json.data.completedToday) {
          setTodayResult(json.data.todayResult ?? null);
          setPhase("completed");
        } else if (Array.isArray(json.data.questions) && json.data.questions.length > 0) {
          setQuestions(json.data.questions);
          setPhase("intro");
        } else {
          setPhase("intro");
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Initial load: unauthenticated or guest users don't make 401 calls; they show intro directly
  useEffect(() => {
    if (!isGoogleAuth) return;
    return loadDailyData();
  }, [isGoogleAuth, loadDailyData]);

  function handleStart() {
    if (requestGoogleLogin()) return;
    if (questions.length === 0) {
      setPhase("loading");
      loadDailyData();
      return;
    }

    const now = Date.now();
    setCurrentIndex(0);
    setScore(0);
    setIncorrectAnswers([]);
    correctWordIdsRef.current = [];
    incorrectWordIdsRef.current = [];
    correctQuestionIdsRef.current = [];
    incorrectQuestionIdsRef.current = [];
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimeLeft(TIME_PER_QUESTION);
    setDeadlineAt(now + TIME_PER_QUESTION * 1000);
    startedAtRef.current = now;
    setPhase("quiz");
  }

  function handleNext() {
    if (currentIndexRef.current >= questionsRef.current.length - 1) {
      setDeadlineAt(null);
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(TIME_PER_QUESTION);
      setDeadlineAt(Date.now() + TIME_PER_QUESTION * 1000);
    }
  }

  function handleOptionClick(option: DailyPracticeOption) {
    if (isAnsweredRef.current) return;
    setIsAnswered(true);
    setSelectedAnswer(option.text);

    const q = questionsRef.current[currentIndexRef.current];
    if (!q) return;

    if (option.correct) {
      setScore((s) => s + 1);
      if (q.type === "VOCABULARY" && q.wordId) {
        correctWordIdsRef.current.push(q.wordId);
      } else if (q.type === "GRAMMAR" && q.questionId) {
        correctQuestionIdsRef.current.push(q.questionId);
      }
    } else {
      if (q.type === "VOCABULARY" && q.wordId) {
        incorrectWordIdsRef.current.push(q.wordId);
      } else if (q.type === "GRAMMAR" && q.questionId) {
        incorrectQuestionIdsRef.current.push(q.questionId);
      }
      const answer = q.options.find((o) => o.correct)?.text ?? "";
      setIncorrectAnswers((prev) => [
        ...prev,
        { question: q, correctAnswer: answer, userAnswer: option.text },
      ]);
    }
  }

  // Question timer interval
  useEffect(() => {
    if (phase !== "quiz" || isAnswered || timeLeft < 0) return;
    const deadline = deadlineAt;
    if (deadline == null) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isAnswered, deadlineAt, timeLeft, currentIndex]);

  // Timeout handler: reveals the correct answer and lets the user advance manually
  useEffect(() => {
    if (phase === "quiz" && !isAnsweredRef.current && timeLeft === 0) {
      const idx = currentIndexRef.current;
      const q = questionsRef.current[idx];
      if (q) {
        setIsAnswered(true);
        setSelectedAnswer(null);
        if (q.type === "VOCABULARY" && q.wordId) {
          incorrectWordIdsRef.current.push(q.wordId);
        } else if (q.type === "GRAMMAR" && q.questionId) {
          incorrectQuestionIdsRef.current.push(q.questionId);
        }
        const answer = q.options.find((o) => o.correct)?.text ?? "";
        setIncorrectAnswers((prev) => [
          ...prev,
          { question: q, correctAnswer: answer, userAnswer: "Time's up!" },
        ]);
      }
    }
  }, [timeLeft, phase]);

  // Save results
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "results" || savedRef.current) return;
    savedRef.current = true;

    const total = questionsRef.current.length || 10;
    const finalScore = score;
    const percentage = Math.round((finalScore / total) * 100);
    const started = startedAtRef.current;
    const timeTotalQuiz = started != null ? Math.round((Date.now() - started) / 1000) : 200;
    const clientDate = fmtDate(new Date());

    void (async () => {
      try {
        const res = await fetch("/api/v1/quiz/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: newClientId(),
            clientDate,
            correctAnswers: finalScore,
            scoreInPercent: percentage,
            totalScore: finalScore,
            timeTotalQuiz,
            correctWordIds: [...new Set(correctWordIdsRef.current)],
            incorrectWordIds: [...new Set(incorrectWordIdsRef.current)],
            correctQuestionIds: [...new Set(correctQuestionIdsRef.current)],
            incorrectQuestionIds: [...new Set(incorrectQuestionIdsRef.current)],
            levels: ["A1", "B1"],
          }),
        });

        if (res.ok) {
          const body = await res.json();
          if (body.streak !== undefined) {
            setStreak(body.streak);
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("activity-changed"));
          }
        }
      } catch (err) {
        console.error("Failed to save daily practice:", err);
      }
    })();
  }, [phase, score]);

  if (phase === "loading") {
    return (
      <div className="px-4 py-8 sm:px-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-lg bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="h-48 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <DailyStateCard
        icon={<CircleAlert className="h-7 w-7 text-rose-500" />}
        title={t("অনুশীলন লোড করা যায়নি", "Couldn't load Daily Practice")}
        desc={t(
          "আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
          "Check your internet connection and try again."
        )}
        actionLabel={t("আবার চেষ্টা করুন", "Try again")}
        onAction={() => {
          setPhase("loading");
          window.location.reload();
        }}
      />
    );
  }

  if (phase === "completed") {
    return (
      <DailyCompletedView
        streak={streak}
        todayResult={todayResult}
        nextResetSeconds={nextResetSeconds}
      />
    );
  }

  if (phase === "intro") {
    return (
      <DailyIntro
        streak={streak}
        isGoogleAuth={isGoogleAuth}
        onStart={handleStart}
      />
    );
  }

  if (phase === "quiz") {
    const q = questions[currentIndex];
    if (!q) return null;
    return (
      <DailyQuizView
        question={q}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        score={score}
        streak={streak}
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
    <DailyResultsView
      score={score}
      total={questions.length}
      streak={streak}
      questions={questions}
      incorrectAnswers={incorrectAnswers}
    />
  );
}

function DailyIntro({
  streak,
  isGoogleAuth,
  onStart,
}: {
  streak: number;
  isGoogleAuth: boolean;
  onStart: () => void;
}) {
  const t = useT();

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-lg mx-auto">
      <div className={cn(CARD, "p-5 sm:p-6 space-y-5")}>
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("দৈনিক অনুশীলন", "Personalized Daily Practice")}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(
                "১০টি দ্রুত প্রশ্ন • ২০ সেকেন্ড • প্রতিদিন ১ বার আপনার স্ট্রিকের জন্য",
                "10 quick blitz questions • 20s each • Once daily to grow your streak"
              )}
            </p>
          </div>
        </div>

        {/* Feature stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <ListOrdered className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                10
              </p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {t("৫ ভোকাব + ৫ গ্রামার", "5 Vocab + 5 Grammar")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
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

          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {streak > 0 ? `${streak}d` : "0d"}
              </p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {t("বর্তমান স্ট্রিক", "Current Streak")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                1 / Day
              </p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {t("দৈনিক সীমাবদ্ধতা", "Everyday Limit")}
              </p>
            </div>
          </div>
        </div>

        {/* Google auth note if not logged in */}
        {!isGoogleAuth && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2.5">
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>
              {t(
                "ব্যক্তিগত দৈনিক অনুশীলন ও স্ট্রিক রক্ষার জন্য গুগল সাইন-ইন প্রয়োজন।",
                "Google sign-in is required for Personalized Daily Practice and streak tracking."
              )}
            </span>
          </div>
        )}

        {/* Start button */}
        <div>
          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/20 cursor-pointer"
          >
            {t("অনুশীলন শুরু করুন", "Start Daily Practice")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
            {t(
              "আপনার দুর্বল বিষয় ও বিগত ভুলের ওপর ভিত্তি করে ব্যক্তিগতভাবে সাজানো",
              "Personalized based on your weak words and past mistakes"
            )}
          </p>
        </div>
      </div>

    </div>
  );
}

function DailyQuizView({
  question,
  currentIndex,
  totalQuestions,
  score,
  streak,
  timeLeft,
  selectedAnswer,
  isAnswered,
  exitOpen,
  onExitOpenChange,
  onExitConfirm,
  onOptionClick,
  onNext,
}: {
  question: DailyPracticeQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  timeLeft: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  exitOpen: boolean;
  onExitOpenChange: (open: boolean) => void;
  onExitConfirm: () => void;
  onOptionClick: (option: DailyPracticeOption) => void;
  onNext: () => void;
}) {
  const t = useT();
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const letters = ["A", "B", "C", "D"];
  const isVocab = question.type === "VOCABULARY";

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
              {t("দৈনিক অনুশীলন", "Daily Practice")}
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 text-xs font-semibold">
                <Flame className="h-3 w-3 fill-orange-500" />
                {streak}d
              </span>
            )}
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
            className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-amber-500 to-orange-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="mb-6">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider mb-2",
              isVocab
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                : "bg-violet-500/10 text-violet-700 dark:text-violet-300"
            )}
          >
            {isVocab ? <BookOpen className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
            {question.difficultyLevel} · {question.category}
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

        {/* Explanation banner if answered */}
        {isAnswered && question.explanation && (
          <div className="mt-4 rounded-xl border border-black/[0.06] bg-black/[0.02] dark:border-white/[0.06] dark:bg-white/[0.03] p-3 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold text-orange-600 dark:text-orange-400 mr-1.5">
              {t("ব্যাখ্যা:", "Note:")}
            </span>
            <span dangerouslySetInnerHTML={{ __html: question.explanation }} />
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onNext}
              size="lg"
              className="px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/20 cursor-pointer"
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
          title={t("কুইজটি ছেড়ে যাবেন?", "Exit Daily Practice?")}
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

function DailyResultsView({
  score,
  total,
  streak,
  questions,
  incorrectAnswers,
}: {
  score: number;
  total: number;
  streak: number;
  questions: DailyPracticeQuestion[];
  incorrectAnswers: IncorrectRecord[];
}) {
  const t = useT();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const vocabCorrect = questions
    .filter((q) => q.type === "VOCABULARY")
    .filter((q) => !incorrectAnswers.some((inc) => inc.question.id === q.id && inc.question.type === "VOCABULARY"))
    .length;

  const grammarCorrect = questions
    .filter((q) => q.type === "GRAMMAR")
    .filter((q) => !incorrectAnswers.some((inc) => inc.question.id === q.id && inc.question.type === "GRAMMAR"))
    .length;

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
            {t("অনুশীলন সমাপ্ত!", "Daily Practice Completed!")}
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
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-zinc-500">
            <span>
              {t("ভোকাবুলারি:", "Vocab:")} <strong className="text-sky-600">{vocabCorrect}/5</strong>
            </span>
            <span>•</span>
            <span>
              {t("গ্রামার:", "Grammar:")} <strong className="text-violet-600">{grammarCorrect}/5</strong>
            </span>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
            <span>
              {streak > 0
                ? t(`বর্তমান স্ট্রিক: ${streak} দিন! 🔥`, `Current Streak: ${streak} Days! 🔥`)
                : t("স্ট্রিক শুরু হয়েছে: ১ দিন! 🔥", "Streak Started: 1 Day! 🔥")}
            </span>
          </div>
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
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {question.questionText}
                  </p>
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

        {/* Action Buttons (NO SHARE BUTTON) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Link href="/">
              {t("ড্যাশবোর্ডে ফিরুন", "Go to Dashboard")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
          >
            <Link href="/quiz">
              {t("সব কুইজ", "All Quizzes")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DailyCompletedView({
  streak,
  todayResult,
  nextResetSeconds,
}: {
  streak: number;
  todayResult: {
    scoreInPercent: number;
    correctAnswers: number;
    questionCount: number;
    timeTotalQuiz: number;
  } | null;
  nextResetSeconds: number;
}) {
  const t = useT();

  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    let s = nextResetSeconds;
    const updateCountdown = () => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setCountdown({ hours: h, minutes: m, seconds: sec });
    };
    updateCountdown();

    const interval = setInterval(() => {
      s = Math.max(0, s - 1);
      updateCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [nextResetSeconds]);

  return (
    <div className="px-4 py-8 sm:px-6 max-w-lg mx-auto">
      <div className={cn(CARD, "p-5 sm:p-7 space-y-5 text-center")}>
        {/* Header Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
          <Flame className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("আজকের অনুশীলন সম্পন্ন!", "Today's Practice Completed!")}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {t(
              "আপনি আজকের ১০টি প্রশ্ন শেষ করেছেন। আপনার স্ট্রিক সচল রয়েছে!",
              "You have finished today's 10 questions. Your streak is protected!"
            )}
          </p>
        </div>

        {/* Current streak pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300">
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          <span>
            {streak > 0
              ? t(`বর্তমান স্ট্রিক: ${streak} দিন`, `Current Streak: ${streak} Day${streak > 1 ? "s" : ""}`)
              : t("স্ট্রিক শুরু হয়েছে: ১ দিন", "Streak Started: 1 Day")}
          </span>
        </div>

        {/* Score info if recorded */}
        {todayResult && (
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-4">
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
              {todayResult.scoreInPercent}%
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {todayResult.correctAnswers} / {todayResult.questionCount} {t("সঠিক", "correct")} ({todayResult.timeTotalQuiz}s)
            </p>
          </div>
        )}

        {/* Next Unlock Countdown */}
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20 p-4">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("পরবর্তী অনুশীলন আনলক হবে", "Next Practice Unlocks In")}</span>
          </div>
          <p className="mt-1.5 text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {String(countdown.hours).padStart(2, "0")}h :{" "}
            {String(countdown.minutes).padStart(2, "0")}m :{" "}
            {String(countdown.seconds).padStart(2, "0")}s
          </p>
        </div>

        {/* Navigation Buttons (NO SHARE BUTTON) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Link href="/">
              {t("ড্যাশবোর্ডে যান", "Go to Dashboard")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
          >
            <Link href="/quiz/quick">
              {t("কুইক কুইজ খেলুন", "Play Quick Quiz")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DailyStateCard({
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
    <div className="px-4 py-8 sm:px-6 max-w-lg mx-auto">
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
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold cursor-pointer"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
