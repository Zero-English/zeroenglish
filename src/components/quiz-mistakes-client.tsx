"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { useAuthStore } from "@/lib/auth-store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { requestGoogleLogin } from "@/lib/login-required";
import { useSpeak } from "@/lib/use-speak";
import {
  fetchMistakeBank,
  type MistakeBankData,
  type MistakeQuestionItem,
} from "@/lib/mistake-bank-api";
import {
  RefreshCw,
  Zap,
  Check,
  X,
  RotateCcw,
  Timer,
  ListOrdered,
  Sparkles,
  ArrowRight,
  CircleAlert,
  ArrowLeft,
  Trophy,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  GraduationCap,
  Gauge,
} from "lucide-react";
import { Classic } from "@/components/classic";

type PracticePhase = "config" | "loading" | "error" | "empty" | "quiz" | "results";
type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

interface PlayOption {
  text: string;
  correct: boolean;
}

interface PlayQuestion {
  id: number;
  questionText: string;
  difficultyLevel: string;
  quizType: string;
  explanation: string;
  options: PlayOption[];
}

interface IncorrectRecord {
  question: PlayQuestion;
  correctAnswer: string;
  userAnswer: string;
}

const QUANTITY_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS = [15, 20, 30];
const DIFFICULTY_OPTIONS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

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
    : `mb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function requestQuizFullscreen(): void {
  if (
    typeof document !== "undefined" &&
    document.fullscreenEnabled &&
    !document.fullscreenElement
  ) {
    void document.documentElement.requestFullscreen().catch(() => {});
  }
}

function exitQuizFullscreen(): void {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    void document.exitFullscreen().catch(() => {});
  }
}

function toPlayQuestion(q: MistakeQuestionItem): PlayQuestion {
  return {
    id: q.id,
    questionText: q.questionText,
    difficultyLevel: q.difficultyLevel,
    quizType: q.quizType?.name ?? "MIXED",
    explanation: q.explanation || "",
    options: shuffleArray([
      { text: q.answer, correct: true },
      ...shuffleArray(q.options.filter((o) => o !== q.answer)).map((o) => ({
        text: o,
        correct: false,
      })),
    ]),
  };
}

async function saveMistakeQuizResultToDb(args: {
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
        title: "Mistake Bank Quiz",
        mode: "PRACTICE",
        quizType: "MIXED",
        questionCount: args.questionCount,
        levels: args.levels.length > 0 ? args.levels : ["A1"],
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
    return false;
  }
}

export function QuizMistakesClient() {
  const t = useT();
  const speak = useSpeak();
  const authStatus = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.userId);
  const isGoogle = authStatus === "google" && userId != null;

  const [phase, setPhase] = useState<PracticePhase>("config");
  const [bankData, setBankData] = useState<MistakeBankData | null>(null);
  const [loadingBank, setLoadingBank] = useState(true);

  // Configuration settings
  const [filterMode, setFilterMode] = useState<"unresolved" | "all">("unresolved");
  const [difficulties, setDifficulties] = useState<DifficultyLevel[]>([]);
  const [quantity, setQuantity] = useState(10);
  const [useAllQuestions, setUseAllQuestions] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [noTimeLimit, setNoTimeLimit] = useState(false);

  // Quiz runtime state
  const [quizQuestions, setQuizQuestions] = useState<PlayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectRecord[]>([]);
  const [exitOpen, setExitOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const isAnsweredRef = useRef(false);
  const quizQuestionsRef = useRef<PlayQuestion[]>([]);
  const currentIndexRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const correctQuestionIdsRef = useRef<number[]>([]);
  const incorrectQuestionIdsRef = useRef<number[]>([]);

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

  // Load mistake bank data on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingBank(true);
      if (!isGoogle) {
        if (!cancelled) {
          setBankData(null);
          setLoadingBank(false);
        }
        return;
      }
      const data = await fetchMistakeBank();
      if (!cancelled) {
        setBankData(data);
        setLoadingBank(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isGoogle]);

  // Determine active pool based on filter mode and difficulty
  const basePool =
    bankData?.questions.filter((q) => {
      if (filterMode === "unresolved" && q.isResolved) return false;
      return true;
    }) ?? [];

  const availablePool =
    difficulties.length === 0
      ? basePool
      : basePool.filter((q) =>
          difficulties.includes(q.difficultyLevel as DifficultyLevel)
        );

  const availableCount = availablePool.length;

  function toggleDifficulty(d: DifficultyLevel) {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  // Start exam handler
  const handleStart = useCallback(() => {
    if (!isGoogle) {
      requestGoogleLogin();
      return;
    }
    if (availableCount === 0 || starting) return;
    setStarting(true);

    requestAnimationFrame(() => {
      const poolQuestions = shuffleArray(availablePool);
      const picked = useAllQuestions
        ? poolQuestions
        : poolQuestions.slice(0, quantity);

      if (picked.length === 0) {
        setStarting(false);
        return;
      }

      const playList = picked.map((q) => toPlayQuestion(q));
      const now = Date.now();
      setQuizQuestions(playList);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(noTimeLimit ? -1 : timePerQuestion);
      setDeadlineAt(noTimeLimit ? null : now + timePerQuestion * 1000);
      setIncorrectAnswers([]);
      correctQuestionIdsRef.current = [];
      incorrectQuestionIdsRef.current = [];
      startedAtRef.current = now;
      setPhase("quiz");
      setStarting(false);
      requestQuizFullscreen();
    });
  }, [
    isGoogle,
    availableCount,
    starting,
    availablePool,
    useAllQuestions,
    quantity,
    noTimeLimit,
    timePerQuestion,
  ]);

  // Option Click Handler (MANUAL: registers answer, does NOT auto-advance)
  const handleOptionClick = (option: PlayOption) => {
    if (isAnsweredRef.current) return;
    setIsAnswered(true);
    setSelectedAnswer(option.text);

    const q = quizQuestionsRef.current[currentIndexRef.current];
    if (!q) return;

    if (option.correct) {
      setScore((s) => s + 1);
      correctQuestionIdsRef.current.push(q.id);
    } else {
      incorrectQuestionIdsRef.current.push(q.id);
      const correctOpt = q.options.find((o) => o.correct);
      setIncorrectAnswers((prev) => [
        ...prev,
        {
          question: q,
          correctAnswer: correctOpt?.text ?? "",
          userAnswer: option.text,
        },
      ]);
    }
  };

  // Manual Next Button Handler
  const handleNext = () => {
    const total = quizQuestionsRef.current.length;
    if (currentIndex >= total - 1) {
      setDeadlineAt(null);
      setPhase("results");
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(noTimeLimit ? -1 : timePerQuestion);
      setDeadlineAt(noTimeLimit ? null : Date.now() + timePerQuestion * 1000);
    }
  };

  // Countdown timer hook (one deadline per question)
  useEffect(() => {
    if (phase !== "quiz" || isAnswered || noTimeLimit || timeLeft < 0) return;
    const deadline = deadlineAt;
    if (deadline == null) return;

    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isAnswered, noTimeLimit, currentIndex, deadlineAt, timeLeft]);

  // Timeout handler: if time hits zero, mark question answered with timeout
  useEffect(() => {
    if (
      phase === "quiz" &&
      !isAnsweredRef.current &&
      !noTimeLimit &&
      timeLeft === 0
    ) {
      const idx = currentIndexRef.current;
      const q = quizQuestionsRef.current[idx];
      if (q) {
        setIsAnswered(true);
        setSelectedAnswer(null);
        incorrectQuestionIdsRef.current.push(q.id);
        const correctOpt = q.options.find((o) => o.correct);
        setIncorrectAnswers((prev) => [
          ...prev,
          {
            question: q,
            correctAnswer: correctOpt?.text ?? "",
            userAnswer: t("সময় শেষ!", "Time's up!"),
          },
        ]);
      }
    }
  }, [timeLeft, noTimeLimit, phase, t]);

  // Save results once "results" phase is reached
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== "results" || savedRef.current) return;
    savedRef.current = true;

    const total = quizQuestionsRef.current.length;
    const finalScore = score;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    const started = startedAtRef.current;
    const timeTotalQuiz =
      started != null && !noTimeLimit
        ? Math.round((Date.now() - started) / 1000)
        : total * timePerQuestion;

    const levels = Array.from(
      new Set(
        quizQuestionsRef.current.map((q) => {
          if (q.difficultyLevel === "HARD") return "C1";
          if (q.difficultyLevel === "MEDIUM") return "B1";
          return "A1";
        })
      )
    );

    void saveMistakeQuizResultToDb({
      userId,
      clientId: newClientId(),
      questionCount: total,
      levels,
      timePerQuestion: noTimeLimit ? 0 : timePerQuestion,
      timeTotalQuiz,
      correctAnswers: finalScore,
      scoreInPercent: percentage,
      totalScore: finalScore,
      correctQuestionIds: [...new Set(correctQuestionIdsRef.current)],
      incorrectQuestionIds: [...new Set(incorrectQuestionIdsRef.current)],
    });

    // Refresh mistake bank in background
    void fetchMistakeBank().then((data) => {
      if (data) setBankData(data);
    });
  }, [phase, score, noTimeLimit, timePerQuestion, userId]);

  useEffect(() => {
    if (phase !== "results") savedRef.current = false;
  }, [phase]);

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
  }

  const currentQ = quizQuestions[currentIndex];
  const totalQuestions = quizQuestions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const letters = ["A", "B", "C", "D", "E", "F"];

  const activeStyle =
    "bg-primary text-primary-foreground border-primary shadow-xs font-semibold";
  const idleStyle =
    "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]";

  return (
    <div className="relative min-h-[85dvh] px-4 py-6 sm:px-6 lg:px-8">
      {/* ========================================================================= */}
      {/* 1. CONFIGURATION VIEW */}
      {/* ========================================================================= */}
      {phase === "config" && (
        <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
              <RefreshCw className="size-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("ভুল উত্তর পুনর্বিবেচনা পরীক্ষা", "Mistake Bank Exam")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {t(
                "পূর্বে দেওয়া পরীক্ষা ও কুইজে আপনার ভুল হওয়া প্রশ্নগুলো পুনরায় অনুশীলন করে ১০০% মাস্টারি অর্জন করুন।",
                "Retest questions you previously missed across all exams and quizzes to achieve full mastery."
              )}
            </p>
          </div>

          {!isGoogle ? (
            <div className={cn(CARD, "p-6 sm:p-8 text-center space-y-4")}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("গুগল দিয়ে সাইন ইন করুন", "Sign in with Google")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                {t(
                  "ভুল উত্তর পুনর্বিবেচনা পরীক্ষা দিতে আপনার ক্লাউড প্রোফাইলে সাইন ইন প্রয়োজন।",
                  "Sign in to load your personalized mistake bank and track resolved questions."
                )}
              </p>
              <Button
                onClick={() => requestGoogleLogin()}
                className="rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {t("গুগল সাইন ইন", "Sign in with Google")}
              </Button>
            </div>
          ) : loadingBank ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Classic className="size-6" />
            </div>
          ) : !bankData || bankData.totalMistakeQuestions === 0 ? (
            <div className={cn(CARD, "p-8 text-center space-y-4")}>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("আপনার কোনো ভুল প্রশ্ন নেই!", "No Mistake Questions Found!")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                {t(
                  "চমৎকার! আপনার আগের সব প্রশ্নের উত্তর সঠিক হয়েছে অথবা আপনি এখনও কোনো পরীক্ষা দেননি। কুইজ বিভাগে গিয়ে নতুন পরীক্ষা নিন।",
                  "Great job! You haven't made any mistakes yet or haven't taken any quizzes. Explore the quiz hub to test your skills."
                )}
              </p>
              <div className="pt-2">
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="size-3.5" />
                  <span>{t("কুইজ খেলুন", "Explore Quizzes")}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {/* Question Pool Mode Card */}
              <div className={cn(CARD, "p-5 sm:p-6")}>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  {t("ভুল প্রশ্নের ধরন", "Question Pool")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFilterMode("unresolved")}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer",
                      filterMode === "unresolved" ? activeStyle : idleStyle
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">
                        {t("অনুশীলন প্রয়োজন এমন প্রশ্ন", "Unresolved Mistakes")}
                      </span>
                      {filterMode === "unresolved" && (
                        <Check className="size-4 text-primary-foreground" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 mt-1">
                      {t("যে প্রশ্নগুলো এখনও আয়ত্ত করা হয়নি", "Questions you haven't mastered yet")} ({bankData.unresolvedQuestionsCount})
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer",
                      filterMode === "all" ? activeStyle : idleStyle
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">
                        {t("সকল ভুল প্রশ্ন", "All Past Mistakes")}
                      </span>
                      {filterMode === "all" && (
                        <Check className="size-4 text-primary-foreground" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 mt-1">
                      {t("ইতিপূর্বে ভুল হওয়া সকল প্রশ্ন", "All past mistakes including mastered")} ({bankData.totalMistakeQuestions})
                    </p>
                  </button>
                </div>
              </div>

              {/* Difficulty Level Card */}
              <div className={cn(CARD, "p-5 sm:p-6")}>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Gauge className="h-4 w-4" />
                  </div>
                  {t("কঠিনতার মাত্রা", "Difficulty Level")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((d) => {
                    const active = difficulties.includes(d);
                    const label =
                      d === "EASY"
                        ? t("সহজ (Easy)", "Easy")
                        : d === "MEDIUM"
                        ? t("মাঝারি (Medium)", "Medium")
                        : t("কঠিন (Hard)", "Hard");
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDifficulty(d)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
                          active ? activeStyle : idleStyle
                        )}
                      >
                        {active && <span className="font-bold">✓</span>}
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2.5">
                  {difficulties.length === 0
                    ? t("সব কঠিনতার মাত্রা অন্তর্ভুক্ত", "All difficulty levels included")
                    : t(
                        `${difficulties.length}টি মাত্রা নির্বাচিত`,
                        `${difficulties.length} difficulty level${difficulties.length > 1 ? "s" : ""} selected`
                      )}
                </p>
              </div>

              {/* Number of Questions Card */}
              <div className={cn(CARD, "p-5 sm:p-6")}>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <ListOrdered className="h-4 w-4" />
                  </div>
                  {t("প্রশ্নের সংখ্যা", "Number of Questions")}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {QUANTITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setQuantity(q);
                        setUseAllQuestions(false);
                      }}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer tabular-nums",
                        !useAllQuestions && quantity === q ? activeStyle : idleStyle
                      )}
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUseAllQuestions(true)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
                      useAllQuestions ? activeStyle : idleStyle
                    )}
                  >
                    {t(`সব (${availableCount}টি)`, `All (${availableCount})`)}
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
                        setQuantity(val);
                        setUseAllQuestions(false);
                      }
                    }}
                    className="w-20 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Time per Question Card */}
              <div className={cn(CARD, "p-5 sm:p-6")}>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Timer className="h-4 w-4" />
                  </div>
                  {t("প্রতি প্রশ্নে সময়", "Time per Question")}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {TIME_OPTIONS.map((tm) => (
                    <button
                      key={tm}
                      type="button"
                      onClick={() => {
                        setTimePerQuestion(tm);
                        setNoTimeLimit(false);
                      }}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer tabular-nums",
                        !noTimeLimit && timePerQuestion === tm ? activeStyle : idleStyle
                      )}
                    >
                      {tm}s
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNoTimeLimit(true)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
                      noTimeLimit ? activeStyle : idleStyle
                    )}
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
                        setTimePerQuestion(val);
                        setNoTimeLimit(false);
                      }
                    }}
                    className="w-20 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={starting || availableCount === 0}
                  className="w-full h-12 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
                >
                  {starting
                    ? t("তৈরি হচ্ছে…", "Preparing…")
                    : t("কুইজ শুরু করুন", "Start Quiz")}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2.5">
                  {useAllQuestions
                    ? t(
                        `${availableCount}টি প্রশ্ন নির্বাচিত`,
                        `${availableCount} question${availableCount !== 1 ? "s" : ""} selected`
                      )
                    : t(
                        `${Math.min(quantity, availableCount)}টি প্রশ্ন নির্বাচিত`,
                        `${Math.min(quantity, availableCount)} question${quantity !== 1 ? "s" : ""} selected`
                      )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE QUIZ RUNTIME (MANUAL NAVIGATION) */}
      {/* ========================================================================= */}
      {phase === "quiz" && currentQ && (
        <div className="relative min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl mx-auto">
            <div className={cn(CARD, "p-5 sm:p-7 relative overflow-hidden")}>
              {/* Top bar HUD */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1 text-xs font-semibold tabular-nums text-foreground">
                    {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    {currentQ.quizType.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {!noTimeLimit && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
                        timeLeft <= 5
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300 animate-pulse"
                          : timeLeft <= 10
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground"
                      )}
                    >
                      <Timer className="h-3 w-3" />
                      {timeLeft}s
                    </span>
                  )}

                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {t("স্কোর:", "Score:")} {score}
                  </span>

                  <button
                    type="button"
                    onClick={() => setExitOpen(true)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title={t("কুইজ থেকে বেরিয়ে যান", "Exit quiz")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Question Content */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {currentQ.difficultyLevel}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(currentQ.questionText)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title={t("উচ্চারণ শুনুন", "Pronounce")}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {currentQ.questionText}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, i) => {
                  const isCorrectOption = option.correct;
                  const isWrongPick =
                    isAnswered && option.text === selectedAnswer && !isCorrectOption;
                  const isRightPick =
                    isAnswered && option.text === selectedAnswer && isCorrectOption;

                  let optionStyle =
                    "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.08]";

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500 font-semibold";
                    } else if (isWrongPick) {
                      optionStyle =
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500 font-semibold";
                    } else {
                      optionStyle =
                        "border-black/[0.04] dark:border-white/[0.04] opacity-40";
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(option)}
                      className={cn(
                        "w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default",
                        optionStyle
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                          isAnswered
                            ? isCorrectOption
                              ? "bg-emerald-500 text-white"
                              : isWrongPick
                              ? "bg-rose-500 text-white"
                              : "bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground"
                            : "bg-black/[0.05] dark:bg-white/[0.08] text-muted-foreground"
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

                      <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown when answered) */}
              {isAnswered && currentQ.explanation && (
                <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
                    <Info className="size-3.5" />
                    <span>{t("সঠিক উত্তরের ব্যাখ্যা:", "Explanation:")}</span>
                  </div>
                  <div>{currentQ.explanation}</div>
                </div>
              )}

              {/* MANUAL NEXT BUTTON (User controls advancing!) */}
              {isAnswered && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
                  >
                    {currentIndex >= totalQuestions - 1
                      ? t("ফলাফল দেখুন", "See Results")
                      : t("পরের প্রশ্ন", "Next Question")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESULTS VIEW */}
      {/* ========================================================================= */}
      {phase === "results" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className={cn(CARD, "p-6 sm:p-8 text-center space-y-4")}>
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Trophy className="size-8 text-amber-500" />
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">
                {totalQuestions > 0
                  ? Math.round((score / totalQuestions) * 100)
                  : 0}
                %
              </span>
              <h2 className="text-lg font-bold text-foreground mt-1">
                {score === totalQuestions
                  ? t("অসাধারণ! শতভাগ সঠিক!", "Flawless Mastery!")
                  : score >= Math.ceil(totalQuestions * 0.7)
                  ? t("খুব চমৎকার ফলাফল!", "Great Progress!")
                  : t("ভালো চেষ্টা! আরও অনুশীলন প্রয়োজন।", "Good Effort! Keep practicing.")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t(
                  `${totalQuestions}টি প্রশ্নের মধ্যে ${score}টি প্রশ্নের সঠিক উত্তর দিয়েছেন।`,
                  `You answered ${score} of ${totalQuestions} questions correctly.`
                )}
              </p>
            </div>

            {/* Stat split */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                  {t("আয়ত্ত করা প্রশ্ন", "Mastered")}
                </span>
                <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {score}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 block">
                  {t("পুনরায় ভুল", "Still Needs Review")}
                </span>
                <span className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5 block">
                  {incorrectAnswers.length}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                onClick={handleRestart}
                className="flex-1 rounded-xl font-semibold gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>{t("আবার পরীক্ষা দিন", "Retake Exam")}</span>
              </Button>

              <Button
                variant="outline"
                asChild
                className="flex-1 rounded-xl font-semibold gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                <Link href="/profile?tab=quiz&subtab=still-learning">
                  <RefreshCw className="size-4" />
                  <span>{t("ভুল উত্তর ডেকে ফিরে যান", "Mistakes Review Deck")}</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Detailed Question Review */}
          {incorrectAnswers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <XCircle className="size-4 text-rose-500" />
                <span>{t("যে প্রশ্নগুলো এখনও ভুল হয়েছে:", "Questions Still Needing Practice:")}</span>
              </h3>

              <div className="space-y-3">
                {incorrectAnswers.map((rec, i) => (
                  <div
                    key={i}
                    className={cn(CARD, "p-4 sm:p-5 space-y-2.5 border-rose-500/30 dark:border-rose-500/20")}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-foreground">
                      {rec.question.questionText}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        <span className="font-semibold block">{t("আপনার উত্তর:", "Your Answer:")}</span>
                        <span>{rec.userAnswer}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <span className="font-semibold block">{t("সঠিক উত্তর:", "Correct Answer:")}</span>
                        <span>{rec.correctAnswer}</span>
                      </div>
                    </div>

                    {rec.question.explanation && (
                      <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground mr-1">{t("ব্যাখ্যা:", "Explanation:")}</strong>
                        {rec.question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title={t("পরীক্ষা প্রস্থান নিশ্চিত করুন", "Exit Mistake Exam?")}
        description={t(
          "আপনি কি পরীক্ষা ছেড়ে যেতে চান? বর্তমান অগ্রগতির ফলাফল সংরক্ষিত হবে না।",
          "Are you sure you want to exit? Your current session progress will not be saved."
        )}
        confirmText={t("প্রস্থান করুন", "Exit")}
        cancelText={t("চালিয়ে যান", "Continue Exam")}
        onConfirm={() => {
          setPhase("config");
          setExitOpen(false);
        }}
      />
    </div>
  );
}
