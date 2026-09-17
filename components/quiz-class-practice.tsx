"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useAuthStore } from "@/lib/auth-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { requestLogin } from "@/lib/login-required";
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Timer,
  ListOrdered,
  Sparkles,
  Gauge,
} from "lucide-react";
import type { QuizClassOption } from "@/lib/quiz-sections";

export interface ClassQuizQuestion {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: string;
  answer: string;
  explanation?: string;
}

type GrammarDifficulty = "EASY" | "MEDIUM" | "HARD";
type PracticePhase = "config" | "quiz" | "results";

interface PlayOption {
  text: string;
  correct: boolean;
}

interface PlayQuestion {
  id: number;
  questionText: string;
  difficultyLevel: string;
  options: PlayOption[];
}

interface IncorrectRecord {
  question: ClassQuizQuestion;
  correctAnswer: string;
  userAnswer: string;
}

const DIFFICULTIES: GrammarDifficulty[] = ["EASY", "MEDIUM", "HARD"];
const QUANTITY_OPTIONS = [5, 10, 15, 20, 25] as const;
const TIME_OPTIONS = [10, 15, 20, 30, 60] as const;
const LEVELS_ALL = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Class questions carry a difficulty (EASY/MEDIUM/HARD) rather than a CEFR
// level, but QuizResults only stores Levels. Map each difficulty to the level
// band it represents so class quiz results can live in the same table.
const DIFFICULTY_TO_LEVEL: Record<GrammarDifficulty, string> = {
  EASY: "A1",
  MEDIUM: "B1",
  HARD: "C1",
};

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
    : `cq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function toPlayQuestion(q: ClassQuizQuestion): PlayQuestion {
  return {
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
  };
}

async function saveClassResultToDb(args: {
  userId: number | null;
  clientId: string;
  title: string;
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
        title: args.title,
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

export function QuizClassPracticeSession({ cls }: { cls: QuizClassOption }) {
  const t = useT();
  const userId = useAuthStore((s) => s.userId);
  const [questions, setQuestions] = useState<ClassQuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  // Practice settings
  const [phase, setPhase] = useState<PracticePhase>("config");
  const [quantity, setQuantity] = useState(10);
  const [useAllQuestions, setUseAllQuestions] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  const [noTimeLimit, setNoTimeLimit] = useState(false);
  const [difficulties, setDifficulties] = useState<GrammarDifficulty[]>([]);

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

  const questionsRef = useRef<ClassQuizQuestion[] | null>(null);
  const isAnsweredRef = useRef(false);
  const quizQuestionsRef = useRef<PlayQuestion[]>([]);
  const currentIndexRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const correctQuestionIdsRef = useRef<number[]>([]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);
  useEffect(() => {
    quizQuestionsRef.current = quizQuestions;
  }, [quizQuestions]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/v1/quiz/by-class?class=${encodeURIComponent(cls.value)}&limit=150`
    )
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setQuestions(json.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cls.value, tick]);

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

  const pool =
    questions === null
      ? []
      : difficulties.length === 0
        ? questions
        : questions.filter((q) =>
            difficulties.includes(q.difficultyLevel as GrammarDifficulty)
          );

  function toggleDifficulty(d: GrammarDifficulty) {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  const [starting, setStarting] = useState(false);

  function handleStart() {
    if (!questions || starting) return;
    if (requestLogin()) return;
    setStarting(true);
    requestAnimationFrame(() => {
      const poolQuestions = shuffleArray(pool);
      const picked = useAllQuestions
        ? poolQuestions
        : poolQuestions.slice(0, quantity);
      if (picked.length === 0) {
        setStarting(false);
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
      setTimeLeft(noTimeLimit ? -1 : timePerQuestion);
      setDeadlineAt(noTimeLimit ? null : now + timePerQuestion * 1000);
      startedAtRef.current = now;
      setPhase("quiz");
      setStarting(false);
      requestQuizFullscreen();
    });
  }

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
      const all = questionsRef.current ?? [];
      const source = all.find((x) => x.id === q?.id);
      if (q && source) {
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
      setTimeLeft(noTimeLimit ? -1 : timePerQuestion);
      setDeadlineAt(
        noTimeLimit ? null : Date.now() + timePerQuestion * 1000
      );
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
    setPhase("config");
    setTick((n) => n + 1);
  }

  function reload() {
    setError(false);
    setLoading(true);
    setTick((n) => n + 1);
  }

  // Countdown timer (one deadline per question).
  useEffect(() => {
    if (phase !== "quiz" || isAnswered || noTimeLimit || timeLeft < 0) return;
    const deadline = deadlineAt;
    if (deadline == null) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isAnswered, noTimeLimit, currentIndex]);

  // A question that hits zero without an answer is marked wrong.
  useEffect(() => {
    if (
      phase === "quiz" &&
      !isAnsweredRef.current &&
      !noTimeLimit &&
      timeLeft === 0
    ) {
      const idx = currentIndexRef.current;
      const q = quizQuestionsRef.current[idx];
      const all = questionsRef.current ?? [];
      const source = all.find((x) => x.id === q?.id);
      if (q && source) {
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
  }, [timeLeft, noTimeLimit, phase]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "results" || savedRef.current) return;
    savedRef.current = true;
    const total = quizQuestionsRef.current.length;
    const finalScore = score;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    const levels =
      difficulties.length === 0
        ? [...LEVELS_ALL]
        : difficulties.map((d) => DIFFICULTY_TO_LEVEL[d]);
    const started = startedAtRef.current;
    const timeTotalQuiz =
      started != null && !noTimeLimit
        ? Math.round((Date.now() - started) / 1000)
        : total * timePerQuestion;
    void saveClassResultToDb({
      userId,
      clientId: newClientId(),
      title: `${cls.label} Quiz`,
      questionCount: total,
      levels,
      timePerQuestion: noTimeLimit ? 0 : timePerQuestion,
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-40 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
        <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
        <div className="h-44 rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Sparkles className="h-7 w-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {t("কুইজটি লোড করা যায়নি", "Couldn't load this quiz")}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {t(
            "আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
            "Check your internet connection and try again."
          )}
        </p>
        <button
          onClick={reload}
          className="inline-flex items-center gap-1.5 mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t("আবার চেষ্টা করুন", "Try again")}
        </button>
      </div>
    );
  }

  if (questions === null) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Sparkles className="h-7 w-7 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {t("এই শ্রেণিতে এখনো কোনো কুইজ নেই", "No quizzes for this class yet")}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          {t(
            `${cls.labelBn} শ্রেণির জন্য এখনো কোনো অনুশীলন প্রশ্ন যোগ করা হয়নি। অন্য শ্রেণি থেকে অনুশীলন করুন।`,
            `No practice questions have been added for ${cls.label} yet. Try another class in the meantime.`
          )}
        </p>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = quizQuestions[currentIndex];
    if (!q) return null;
    return (
      <ClassQuizView
        cls={cls}
        question={q}
        currentIndex={currentIndex}
        totalQuestions={quizQuestions.length}
        score={score}
        timeLeft={timeLeft}
        noTimeLimit={noTimeLimit}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        exitOpen={exitOpen}
        onExitOpenChange={setExitOpen}
        onExitConfirm={() => setPhase("config")}
        onOptionClick={handleOptionClick}
        onNext={handleNext}
      />
    );
  }

  if (phase === "results") {
    return (
      <ClassResultsView
        cls={cls}
        score={score}
        total={quizQuestions.length}
        incorrectAnswers={incorrectAnswers}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <ClassSettingsView
      cls={cls}
      difficultyOptions={DIFFICULTIES}
      difficulties={difficulties}
      availableCount={pool.length}
      quantity={quantity}
      useAllQuestions={useAllQuestions}
      timePerQuestion={timePerQuestion}
      noTimeLimit={noTimeLimit}
      starting={starting}
      onDifficultyChange={toggleDifficulty}
      onQuantityChange={(q) => {
        setQuantity(q);
        setUseAllQuestions(false);
      }}
      onUseAllChange={(all) => setUseAllQuestions(all)}
      onTimeChange={(tm) => {
        setTimePerQuestion(tm);
        setNoTimeLimit(false);
      }}
      onNoTimeLimitChange={(nl) => setNoTimeLimit(nl)}
      onStart={handleStart}
    />
  );
}

function ClassSettingsView({
  cls,
  difficultyOptions,
  difficulties,
  availableCount,
  quantity,
  useAllQuestions,
  timePerQuestion,
  noTimeLimit,
  starting,
  onDifficultyChange,
  onQuantityChange,
  onUseAllChange,
  onTimeChange,
  onNoTimeLimitChange,
  onStart,
}: {
  cls: QuizClassOption;
  difficultyOptions: GrammarDifficulty[];
  difficulties: GrammarDifficulty[];
  availableCount: number;
  quantity: number;
  useAllQuestions: boolean;
  timePerQuestion: number;
  noTimeLimit: boolean;
  starting: boolean;
  onDifficultyChange: (d: GrammarDifficulty) => void;
  onQuantityChange: (q: number) => void;
  onUseAllChange: (all: boolean) => void;
  onTimeChange: (tm: number) => void;
  onNoTimeLimitChange: (nl: boolean) => void;
  onStart: () => void;
}) {
  const t = useT();
  const countLabel =
    availableCount > 0 ? String(availableCount) : "…";
  const activeStyle = `${cls.border} ${cls.bg} ${cls.text} border-2 shadow-sm`;
  const idleStyle =
    "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${cls.bg}`}>
            <Gauge className={`h-3.5 w-3.5 ${cls.text}`} />
          </span>
          {t("কঠিনতার মাত্রা", "Difficulty")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {difficultyOptions.map((d) => {
            const active = difficulties.includes(d);
            const label =
              d === "EASY"
                ? t("সহজ", "Easy")
                : d === "MEDIUM"
                  ? t("মাঝারি", "Medium")
                  : t("কঠিন", "Hard");
            return (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  active ? activeStyle : idleStyle
                }`}
              >
                {active && <span className="font-bold">✓</span>}
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
          {difficulties.length === 0
            ? t("সব কঠিনতার মাত্রা বেছে নেওয়া হয়েছে", "All difficulties selected")
            : t(
                `${difficulties.length}টি মাত্রা বেছে নেওয়া হয়েছে`,
                `${difficulties.length} difficulty${difficulties.length > 1 ? "ies" : "y"} selected`
              )}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${cls.bg}`}>
            <ListOrdered className={`h-3.5 w-3.5 ${cls.text}`} />
          </span>
          {t("প্রশ্নের সংখ্যা", "Number of Questions")}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {QUANTITY_OPTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onQuantityChange(q)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                !useAllQuestions && quantity === q ? activeStyle : idleStyle
              }`}
            >
              {q}
            </button>
          ))}
          <button
            onClick={() => onUseAllChange(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              useAllQuestions ? activeStyle : idleStyle
            }`}
          >
            {t(`সব (${countLabel})`, `All (${countLabel})`)}
          </button>
          <input
            type="number"
            min={1}
            max={availableCount || undefined}
            placeholder={t("কাস্টম", "Custom")}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!Number.isNaN(val) && val > 0) {
                onQuantityChange(val);
                onUseAllChange(false);
              }
            }}
            className="w-20 px-3 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${cls.bg}`}>
            <Timer className={`h-3.5 w-3.5 ${cls.text}`} />
          </span>
          {t("প্রতি প্রশ্নে সময়", "Time per Question")}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {TIME_OPTIONS.map((tm) => (
            <button
              key={tm}
              onClick={() => onTimeChange(tm)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                !noTimeLimit && timePerQuestion === tm ? activeStyle : idleStyle
              }`}
            >
              {tm}s
            </button>
          ))}
          <button
            onClick={() => onNoTimeLimitChange(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              noTimeLimit ? activeStyle : idleStyle
            }`}
          >
            {t("সময়সীমা নেই", "No limit")}
          </button>
          <input
            type="number"
            min={1}
            placeholder={t("কাস্টম", "Custom")}
            value={timePerQuestion}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!Number.isNaN(val) && val > 0) {
                onTimeChange(val);
                onNoTimeLimitChange(false);
              }
            }}
            className="w-20 px-3 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={onStart}
          disabled={starting || availableCount === 0}
          className={`w-full h-12 text-base font-semibold bg-gradient-to-r ${cls.gradient} hover:opacity-90`}
        >
          {starting
            ? t("তৈরি হচ্ছে…", "Preparing…")
            : t("কুইজ শুরু করুন", "Start Quiz")}
        </Button>
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-3">
          {useAllQuestions
            ? t(
                `${countLabel}টি প্রশ্ন · সব কঠিনতার মাত্রা`,
                `${countLabel} question${availableCount !== 1 ? "s" : ""} · all difficulties`
              )
            : t(
                `${quantity}টি প্রশ্ন · ${difficulties.length === 0 ? "সব মাত্রা" : difficulties.join(", ")}`,
                `${quantity} question${quantity !== 1 ? "s" : ""} · ${
                  difficulties.length === 0 ? "all difficulties" : difficulties.join(", ")
                }`
              )}
        </p>
        {availableCount === 0 && (
          <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-400 mt-2">
            {t(
              "নির্বাচিত কঠিনতার মাত্রায় কোনো প্রশ্ন নেই।",
              "No questions available for the selected difficulty."
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function ClassQuizView({
  cls,
  question,
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  noTimeLimit,
  selectedAnswer,
  isAnswered,
  exitOpen,
  onExitOpenChange,
  onExitConfirm,
  onOptionClick,
  onNext,
}: {
  cls: QuizClassOption;
  question: PlayQuestion;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  noTimeLimit: boolean;
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
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
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
          {!noTimeLimit && (
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
          )}
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
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r",
            cls.gradient
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="animate-fade-up mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 mb-2">
          {t(cls.labelBn, cls.label)} · {question.difficultyLevel}
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
  );
}

function ClassResultsView({
  cls,
  score,
  total,
  incorrectAnswers,
  onRestart,
}: {
  cls: QuizClassOption;
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
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 sm:p-10">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("কুইজ শেষ!", "Quiz Complete!")}
        </h3>
        <p className={`text-xl font-bold mt-2 ${resultColor}`}>{resultLabel}</p>
      </div>

      <div className="mb-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border-2 backdrop-blur-sm p-8 text-center",
            cls.border,
            cls.bg
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-10",
              cls.gradient
            )}
          />
          <div className="relative">
            <div
              className={cn(
                "inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-black/10",
                cls.gradient
              )}
            >
              <Sparkles className="h-7 w-7" />
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
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {question.questionText}
                </p>
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
          <Link href="/quiz/class">
            <ArrowLeft />
            {t("সব শ্রেণির কুইজ", "All class quizzes")}
          </Link>
        </Button>
      </div>
    </div>
  );
}