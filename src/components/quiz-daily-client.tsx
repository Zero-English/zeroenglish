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
  ArrowLeft,
  ChevronRight,
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

  // Initial load: unauthenticated users don't make 401 calls; they show intro directly
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

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] bg-[#f8f8f6] px-2.5 py-4 transition-colors duration-200 dark:bg-[#0c0c0e] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {phase === "loading" && (
          <div className="mx-auto max-w-lg py-12">
            <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e]">
              <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]">
                <Flame className="size-5 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                {t("দৈনিক অনুশীলন প্রস্তুত হচ্ছে…", "Preparing Daily Practice…")}
              </h3>
              <p className="mt-1 text-[12px] text-[#242423]/60 dark:text-zinc-400">
                {t(
                  "১০টি ব্যক্তিগত প্রশ্ন লোড করা হচ্ছে",
                  "Loading 10 personalized questions based on your profile"
                )}
              </p>
              <div className="relative mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
                <div className="h-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#242423] dark:bg-white" />
              </div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <DailyStateCard
            icon={<CircleAlert className="size-5 text-rose-500" />}
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
        )}

        {phase === "completed" && (
          <DailyCompletedView
            streak={streak}
            todayResult={todayResult}
            nextResetSeconds={nextResetSeconds}
          />
        )}

        {phase === "intro" && (
          <DailyIntro
            streak={streak}
            isGoogleAuth={isGoogleAuth}
            onStart={handleStart}
          />
        )}

        {phase === "quiz" && questions[currentIndex] && (
          <DailyQuizView
            question={questions[currentIndex]}
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
        )}

        {phase === "results" && (
          <DailyResultsView
            score={score}
            total={questions.length}
            streak={streak}
            questions={questions}
            incorrectAnswers={incorrectAnswers}
          />
        )}
      </div>
    </div>
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
    <div className="mx-auto max-w-xl">
      <div className="rounded-[26px] border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[30px] sm:p-5">
        {/* Sunken Inset Header (Recipe 4.1) */}
        <div className="rounded-[18px] bg-[#f1f1ef] p-3.5 dark:bg-[#252528] sm:rounded-[22px] sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423] sm:size-11">
                <Flame className="size-5 text-amber-500 fill-amber-500" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold leading-5 text-[#242423] dark:text-[#f3f3f2] sm:text-[17px]">
                  {t("দৈনিক অনুশীলন", "Personalized Daily Practice")}
                </h1>
                <p className="mt-0.5 text-[11.5px] text-[#242423]/60 dark:text-zinc-400 sm:text-[12.5px]">
                  {t(
                    "১০টি দ্রুত প্রশ্ন • ২০ সেকেন্ড • স্ট্রিক রক্ষা করুন",
                    "10 quick blitz questions • 20s each • Grow your streak"
                  )}
                </p>
              </div>
            </div>

            {/* Streak Pill */}
            {streak > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-medium text-[#242423] shadow-xs dark:bg-white/10 dark:text-zinc-200">
                <Flame className="size-3.5 text-amber-500 fill-amber-500" />
                {streak}d
              </span>
            )}
          </div>
        </div>

        {/* Natural Language Highlight Box (Reference 4) */}
        <div className="mt-3.5 rounded-[16px] bg-[#242423]/[0.03] p-3 text-[13px] leading-relaxed text-[#242423]/75 dark:bg-white/[0.04] dark:text-zinc-300 sm:rounded-[18px] sm:p-3.5 sm:text-[13.5px]">
          {t(
            "আপনার দুর্বল বিষয় ও ভুলের ওপর ভিত্তি করে তৈরি ",
            "Personalized challenge drawn from weak topics: "
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#242423] shadow-2xs dark:bg-[#2e2e32] dark:text-zinc-100">
            5 {t("ভোকাব", "Vocab")} + 5 {t("গ্রামার", "Grammar")}
          </span>
          {t("। প্রতিদিন একবার অংশ নিয়ে ", ". Complete once a day to protect your ")}
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#242423] shadow-2xs dark:bg-[#2e2e32] dark:text-zinc-100">
            🔥 {streak > 0 ? `${streak} ${t("দিনের স্ট্রিক", "day streak")}` : t("স্ট্রিক শুরু করুন", "start streak")}
          </span>
          {t(" রক্ষা করুন।", ".")}
        </div>

        {/* 4-Cell Feature Grid with Soft Pastel Styles (DESIGNS.md Reference 6) */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:gap-2.5">
          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-blue-700/60 dark:text-blue-300/60">
                {t("প্রশ্নের ধরন", "MIXED")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-blue-700 shadow-2xs dark:bg-white/10 dark:text-blue-300">
                <ListOrdered className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] tabular-nums dark:text-[#f3f3f2]">
              10 {t("টি", "Qs")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("৫ ভোকাব + ৫ গ্রামার", "5 vocab + 5 grammar")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-amber-700/60 dark:text-amber-300/60">
                {t("সময় সীমা", "PACE")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-amber-700 shadow-2xs dark:bg-white/10 dark:text-amber-300">
                <Timer className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] tabular-nums dark:text-[#f3f3f2]">
              20s / {t("প্রশ্ন", "Q")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("দ্রুত কাউন্টডাউন", "Blitz timer")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-rose-700/60 dark:text-rose-300/60">
                {t("স্ট্রিক", "STREAK")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-rose-700 shadow-2xs dark:bg-white/10 dark:text-rose-300">
                <Flame className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] tabular-nums dark:text-[#f3f3f2]">
              {streak > 0 ? `${streak}d` : "0d"}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("বর্তমান সক্রিয় স্ট্রিক", "Active streak")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700/60 dark:text-emerald-300/60">
                {t("দৈনিক কোটা", "LIMIT")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-emerald-700 shadow-2xs dark:bg-white/10 dark:text-emerald-300">
                <CalendarCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] dark:text-[#f3f3f2]">
              1 / {t("দিন", "Day")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("প্রতিদিন একবার সুযোগ", "Once every 24h")}
            </p>
          </div>
        </div>

        {/* Google auth note if not logged in */}
        {!isGoogleAuth && (
          <div className="mt-3.5 flex items-center gap-2.5 rounded-[16px] border border-amber-500/10 bg-[#faf4ee] p-3 text-[12px] text-amber-800 dark:bg-[#2b2219] dark:text-amber-200">
            <GoogleIcon className="size-4 shrink-0" />
            <span>
              {t(
                "ব্যক্তিগত দৈনিক অনুশীলন ও স্ট্রিক রক্ষার জন্য গুগল সাইন-ইন প্রয়োজন।",
                "Google sign-in is required for Personalized Daily Practice and streak tracking."
              )}
            </span>
          </div>
        )}

        {/* Primary Action Button (Reference 1) */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onStart}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-[14px] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <span>{t("অনুশীলন শুরু করুন", "Start Daily Practice")}</span>
            <ArrowRight className="size-4" />
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-[11.5px] text-[#242423]/45 dark:text-zinc-500">
            <span>{t("ব্যক্তিগতভাবে সাজানো", "Weak words & mistake prioritized")}</span>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1 font-medium text-[#242423]/60 transition-colors hover:text-[#242423] dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="size-3" />
              {t("কুইজ তালিকা", "All Quizzes")}
            </Link>
          </div>
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
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[26px] border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[30px] sm:p-6">
        {/* Sunken Inset Top HUD (Recipe 4.1) */}
        <div className="rounded-[18px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528] sm:rounded-[20px] sm:p-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 font-mono text-[11.5px] font-bold tabular-nums text-[#242423] shadow-2xs dark:bg-[#323236] dark:text-[#f3f3f2] sm:text-[12px]">
                {currentIndex + 1} / {totalQuestions}
              </span>
              <span className="hidden rounded-full bg-[#242423]/[0.05] px-2.5 py-0.5 text-[10.5px] font-medium text-[#242423]/70 dark:bg-white/[0.08] dark:text-zinc-300 sm:inline-block">
                {isVocab ? t("ভোকাবুলারি", "Vocabulary") : t("গ্রামার", "Grammar")} · {question.category}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <Flame className="size-3 fill-amber-500 text-amber-500" />
                  {streak}d
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Countdown Badge */}
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold tabular-nums shadow-2xs transition-colors sm:text-[12px]",
                  timeLeft <= 5
                    ? "bg-rose-500 text-white animate-pulse"
                    : timeLeft <= 10
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-white text-[#242423] dark:bg-[#323236] dark:text-[#f3f3f2]"
                )}
              >
                <Timer className="size-3.5" />
                {timeLeft}s
              </span>

              {/* Score Chip */}
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-bold tabular-nums text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 sm:text-[12px]">
                {score}
              </span>

              {/* Exit Button */}
              <button
                type="button"
                onClick={() => onExitOpenChange(true)}
                className="grid size-7 place-items-center rounded-full text-[#242423]/45 transition-colors hover:bg-[#242423]/[0.06] hover:text-[#242423] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-100 sm:size-8 cursor-pointer"
                title={t("কুইজ থেকে প্রস্থান", "Exit quiz")}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Liquid Shimmer Progress Bar (Recipe 4.4) */}
          <div className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
            <div
              className="relative h-full overflow-hidden rounded-full bg-[#242423] transition-all duration-300 dark:bg-white"
              style={{ width: `${progress}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ transform: "translateX(600%)" }}
              />
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="mt-4 rounded-[18px] bg-[#242423]/[0.02] p-4 dark:bg-white/[0.03] sm:rounded-[20px] sm:p-5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[8px] px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider",
                isVocab
                  ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                  : "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
              )}
            >
              {isVocab ? <BookOpen className="size-3" /> : <Layers className="size-3" />}
              {question.difficultyLevel} · {question.category}
            </span>
          </div>

          <h2 className="mt-2 text-[15.5px] font-bold leading-snug text-[#242423] dark:text-[#f3f3f2] sm:text-[18.5px]">
            {question.questionText}
          </h2>
        </div>

        {/* Options List (Recipe 4.3 streamlined list standard) */}
        <div className="mt-3.5 space-y-2">
          {question.options.map((option, i) => {
            const isCorrectOption = option.correct;
            const isWrongPick =
              isAnswered && option.text === selectedAnswer && !isCorrectOption;

            let optionStyle =
              "bg-[#242423]/[0.03] dark:bg-white/[0.04] text-[#242423] dark:text-[#f3f3f2] hover:bg-[#242423]/[0.06] dark:hover:bg-white/[0.07]";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  "bg-emerald-500/10 text-emerald-900 ring-1 ring-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-200";
              } else if (isWrongPick) {
                optionStyle =
                  "bg-rose-500/10 text-rose-900 ring-1 ring-rose-500 dark:bg-rose-500/20 dark:text-rose-200";
              } else {
                optionStyle = "opacity-35 bg-[#242423]/[0.02] dark:bg-white/[0.02]";
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onOptionClick(option)}
                disabled={isAnswered}
                className={cn(
                  "group relative flex min-h-[52px] w-full cursor-pointer items-center justify-between rounded-[14px] px-3.5 py-2.5 text-left outline-none transition-all duration-150 active:scale-[0.985] disabled:cursor-default sm:min-h-[56px] sm:rounded-[16px] sm:px-4",
                  optionStyle
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-[10px] font-mono text-[12px] font-bold transition-colors",
                      isAnswered
                        ? isCorrectOption
                          ? "bg-emerald-500 text-white"
                          : isWrongPick
                            ? "bg-rose-500 text-white"
                            : "bg-[#242423]/[0.05] text-[#242423]/50 dark:bg-white/[0.06]"
                        : "bg-[#242423]/[0.06] text-[#242423] dark:bg-white/[0.08] dark:text-[#f3f3f2]"
                    )}
                  >
                    {isAnswered && (isCorrectOption || isWrongPick) ? (
                      isCorrectOption ? (
                        <Check className="size-3.5 stroke-[3]" />
                      ) : (
                        <X className="size-3.5 stroke-[3]" />
                      )
                    ) : (
                      letters[i] ?? ""
                    )}
                  </span>
                  <span className="text-[13.5px] font-medium leading-relaxed sm:text-[14.5px]">
                    {option.text}
                  </span>
                </div>

                <ChevronRight className="size-4 shrink-0 text-[#242423]/30 transition-transform duration-150 group-hover:translate-x-0.5 dark:text-zinc-500" />
              </button>
            );
          })}
        </div>

        {/* Explanation banner if answered */}
        {isAnswered && question.explanation && (
          <div className="mt-3.5 rounded-[14px] border border-amber-500/10 bg-[#faf4ee] p-3 text-[12px] leading-relaxed text-[#242423] dark:bg-[#2b2219] dark:text-zinc-200">
            <span className="font-semibold text-amber-800 dark:text-amber-300 mr-1.5">
              {t("ব্যাখ্যা:", "Note:")}
            </span>
            <span dangerouslySetInnerHTML={{ __html: question.explanation }} />
          </div>
        )}

        {/* Floating Next Question Bar */}
        {isAnswered && (
          <div className="mt-4 flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.06]">
            <span className="text-[12px] text-[#242423]/55 dark:text-zinc-400">
              {selectedAnswer
                ? question.options.find((o) => o.text === selectedAnswer)?.correct
                  ? t("সঠিক উত্তর!", "Correct Answer!")
                  : t("ভুল উত্তর, দুর্বল তালিকায় যোগ", "Incorrect, logged to review")
                : t("সময় শেষ!", "Time's up!")}
            </span>

            <button
              type="button"
              onClick={onNext}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#242423] px-5 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
            >
              <span>
                {currentIndex >= totalQuestions - 1
                  ? t("ফলাফল দেখুন", "See Results")
                  : t("পরবর্তী প্রশ্ন", "Next Question")}
              </span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        <ConfirmDialog
          open={exitOpen}
          onOpenChange={onExitOpenChange}
          variant="warning"
          title={t("কুইজটি ছেড়ে যাবেন?", "Exit Daily Practice?")}
          description={t(
            "আপনার চলমান অগ্রগতি সংরক্ষিত হবে না। আপনি কি নিশ্চিতভাবে প্রস্থান করতে চান?",
            "Your session progress won't be saved. Are you sure you want to exit?"
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

  let resultLabel: string;
  let statusDot: string;
  if (percentage >= 90) {
    statusDot = "bg-emerald-500";
    resultLabel = t("চমৎকার ফলাফল!", "Excellent Mastery!");
  } else if (percentage >= 70) {
    statusDot = "bg-sky-500";
    resultLabel = t("দারুণ অগ্রগতি!", "Great Progress!");
  } else if (percentage >= 50) {
    statusDot = "bg-amber-500";
    resultLabel = t("ভালো চেষ্টা!", "Good Effort!");
  } else {
    statusDot = "bg-rose-500";
    resultLabel = t("আরও অনুশীলন প্রয়োজন!", "Keep Practicing!");
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[26px] border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[30px] sm:p-5">
        {/* Sunken Inset Header */}
        <div className="rounded-[18px] bg-[#f1f1ef] p-4 text-center dark:bg-[#252528] sm:rounded-[22px] sm:p-5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-amber-500 shadow-xs dark:bg-[#323236]">
            <Flame className="size-6 fill-amber-500 text-amber-500" />
          </div>
          <h3 className="mt-2.5 text-[17px] font-bold text-[#242423] dark:text-[#f3f3f2] sm:text-[19px]">
            {t("অনুশীলন সমাপ্ত!", "Daily Practice Completed!")}
          </h3>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-[#242423] shadow-2xs dark:bg-white/10 dark:text-zinc-200">
            <span className={cn("size-2 rounded-full", statusDot)} />
            {resultLabel}
          </div>
        </div>

        {/* 3-Cell Stat Inset (Reference 1) */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-[18px] bg-[#242423]/[0.03] p-3 text-center dark:bg-white/[0.04]">
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium uppercase tracking-wider text-[#242423]/50 dark:text-zinc-500">
              {t("স্কোর", "ACCURACY")}
            </p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-[#242423] dark:text-[#f3f3f2] sm:text-[22px]">
              {percentage}%
            </p>
          </div>
          <div className="min-w-0 border-x border-black/[0.06] dark:border-white/[0.08]">
            <p className="text-[10.5px] font-medium uppercase tracking-wider text-[#242423]/50 dark:text-zinc-500">
              {t("ভোকাব", "VOCAB")}
            </p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-sky-600 dark:text-sky-400 sm:text-[22px]">
              {vocabCorrect} / 5
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium uppercase tracking-wider text-[#242423]/50 dark:text-zinc-500">
              {t("গ্রামার", "GRAMMAR")}
            </p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-purple-600 dark:text-purple-400 sm:text-[22px]">
              {grammarCorrect} / 5
            </p>
          </div>
        </div>

        {/* Streak Capsule */}
        <div className="mt-3.5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/10 bg-[#faf4ee] px-4 py-1.5 text-xs font-bold text-amber-800 dark:bg-[#2b2219] dark:text-amber-200">
            <Flame className="size-4 text-amber-500 fill-amber-500" />
            <span>
              {streak > 0
                ? t(`বর্তমান স্ট্রিক: ${streak} দিন! 🔥`, `Current Streak: ${streak} Days! 🔥`)
                : t("স্ট্রিক শুরু হয়েছে: ১ দিন! 🔥", "Streak Started: 1 Day! 🔥")}
            </span>
          </div>
        </div>

        {/* Mistakes Review Deck */}
        {incorrectAnswers.length > 0 && (
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#242423]/55 dark:text-zinc-400">
                {t(
                  `ভুল উত্তর পর্যালোচনা (${incorrectAnswers.length})`,
                  `Review Mistakes (${incorrectAnswers.length})`
                )}
              </h4>
              <span className="text-[11px] text-[#242423]/40 dark:text-zinc-500">
                {t("ভুল ব্যাংকে সংরক্ষিত", "Logged to Mistake Bank")}
              </span>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {incorrectAnswers.map(({ question, correctAnswer, userAnswer }, i) => (
                <div
                  key={i}
                  className="rounded-[16px] bg-[#242423]/[0.03] p-3 text-xs dark:bg-white/[0.04]"
                >
                  <p className="font-semibold text-[#242423] dark:text-[#f3f3f2]">
                    {question.questionText}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userAnswer !== "Time's up!" ? (
                      <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 font-medium text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                        {t("আপনার উত্তর:", "You:")} {userAnswer}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                        <Clock className="size-3" />
                        {t("সময় শেষ", "Time expired")}
                      </span>
                    )}

                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {t("সঠিক উত্তর:", "Correct:")} {correctAnswer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Toolbar (Reference 1) */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-[13.5px] font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <span>{t("ড্যাশবোর্ডে ফিরুন", "Go to Dashboard")}</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/quiz"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423]/[0.05] px-6 text-[13.5px] font-semibold text-[#242423] transition-all hover:bg-[#242423]/[0.09] active:scale-[0.97] dark:bg-white/[0.08] dark:text-[#f3f3f2] dark:hover:bg-white/[0.12]"
          >
            <ArrowLeft className="size-4" />
            <span>{t("সব কুইজ", "All Quizzes")}</span>
          </Link>
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
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-[28px] border border-black/[0.06] bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:p-7">
        {/* Sunken Inset Header */}
        <div className="rounded-[20px] bg-[#f1f1ef] p-4 dark:bg-[#252528] sm:p-5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-amber-500 shadow-xs dark:bg-[#323236]">
            <Flame className="size-6 fill-amber-500 text-amber-500" />
          </div>
          <h3 className="mt-3 text-[17px] font-bold text-[#242423] dark:text-[#f3f3f2] sm:text-[19px]">
            {t("আজকের অনুশীলন সম্পন্ন!", "Today's Practice Completed!")}
          </h3>
          <p className="mt-1 text-[12px] text-[#242423]/60 dark:text-zinc-400">
            {t(
              "আপনি আজকের ১০টি প্রশ্ন শেষ করেছেন। আপনার স্ট্রিক সচল রয়েছে!",
              "You have finished today's 10 questions. Your streak is protected!"
            )}
          </p>

          {/* Current streak pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/10 bg-white/90 px-4 py-1 text-xs font-bold text-amber-800 shadow-2xs dark:bg-white/10 dark:text-amber-200">
            <Flame className="size-3.5 fill-amber-500 text-amber-500" />
            <span>
              {streak > 0
                ? t(`বর্তমান স্ট্রিক: ${streak} দিন`, `Current Streak: ${streak} Day${streak > 1 ? "s" : ""}`)
                : t("স্ট্রিক শুরু হয়েছে: ১ দিন", "Streak Started: 1 Day")}
            </span>
          </div>
        </div>

        {/* Score info if recorded */}
        {todayResult && (
          <div className="mt-3.5 rounded-[18px] bg-[#242423]/[0.03] p-4 dark:bg-white/[0.04]">
            <p className="text-[26px] font-bold tabular-nums text-[#242423] dark:text-[#f3f3f2]">
              {todayResult.scoreInPercent}%
            </p>
            <p className="mt-0.5 text-[12px] text-[#242423]/60 dark:text-zinc-400">
              {todayResult.correctAnswers} / {todayResult.questionCount} {t("সঠিক", "correct")} ({todayResult.timeTotalQuiz}s)
            </p>
          </div>
        )}

        {/* Next Unlock Countdown Card (Warm Sand Pastel Style) */}
        <div className="mt-3.5 rounded-[18px] border border-amber-500/10 bg-[#faf4ee] p-4 dark:bg-[#2b2219]">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700/80 dark:text-amber-300/80">
            <Clock className="size-3.5" />
            <span>{t("পরবর্তী অনুশীলন আনলক হবে", "Next Practice Unlocks In")}</span>
          </div>
          <p className="mt-1.5 font-mono text-[22px] font-bold tabular-nums text-[#242423] dark:text-[#f3f3f2]">
            {String(countdown.hours).padStart(2, "0")}h :{" "}
            {String(countdown.minutes).padStart(2, "0")}m :{" "}
            {String(countdown.seconds).padStart(2, "0")}s
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-[13.5px] font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <span>{t("ড্যাশবোর্ডে যান", "Go to Dashboard")}</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/quiz/quick"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423]/[0.05] px-6 text-[13.5px] font-semibold text-[#242423] transition-all hover:bg-[#242423]/[0.09] active:scale-[0.97] dark:bg-white/[0.08] dark:text-[#f3f3f2] dark:hover:bg-white/[0.12]"
          >
            <span>{t("কুইক কুইজ খেলুন", "Play Quick Quiz")}</span>
          </Link>
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
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-[28px] border border-black/[0.06] bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:p-8">
        <div className="inline-flex size-11 items-center justify-center rounded-[14px] bg-[#242423]/[0.05] dark:bg-white/[0.06]">
          {icon}
        </div>
        <h3 className="mt-3.5 text-[16px] font-semibold text-[#242423] dark:text-[#f3f3f2] sm:text-[18px]">
          {title}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-[#242423]/60 dark:text-zinc-400">
          {desc}
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="cursor-pointer rounded-full bg-[#242423] px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
