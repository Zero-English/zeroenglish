"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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
  Trophy,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
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

const DIFFICULTY_TO_LEVEL: Record<Difficulty, string> = {
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
    : `qq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
      const res = await fetch(`/api/v1/quiz/quick?limit=${QUICK_QUANTITY}`, {
        cache: "no-store",
      });
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

  // Countdown timer
  useEffect(() => {
    if (phase !== "quiz" || isAnswered || timeLeft < 0) return;
    const deadline = deadlineAt;
    if (deadline == null) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isAnswered, currentIndex, deadlineAt, timeLeft]);

  // Zero-time timeout
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
  }, [phase, userId, score, incorrectAnswers]);

  useEffect(() => {
    if (phase !== "results") savedRef.current = false;
  }, [phase]);

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] bg-[#f8f8f6] px-2.5 py-4 transition-colors duration-200 dark:bg-[#0c0c0e] sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            >
              <QuickIntro starting={starting} onStart={handleStart} />
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-lg py-12"
            >
              <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e]">
                <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]">
                  <Zap className="size-5 animate-pulse" />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                  {t("কুইক কুইজ প্রস্তুত হচ্ছে…", "Preparing Quick Quiz…")}
                </h3>
                <p className="mt-1 text-[12px] text-[#242423]/60 dark:text-zinc-400">
                  {t(
                    "২০টি দ্রুত প্রশ্ন লোড করা হচ্ছে",
                    "Loading 20 mixed grammar & class questions"
                  )}
                </p>
                <div className="relative mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[#242423]/10 dark:bg-white/10">
                  <div className="h-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#242423] dark:bg-white" />
                </div>
              </div>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <QuickStateCard
                icon={<CircleAlert className="size-5 text-rose-600 dark:text-rose-400" />}
                title={t("কুইজটি লোড করা যায়নি", "Couldn't load this quiz")}
                desc={t(
                  "সার্ভার বা ইন্টারনেট সমস্যার কারণে প্রশ্ন আনা যায়নি। দয়া করে পুনরায় চেষ্টা করুন।",
                  "Unable to load quiz questions due to network or server issues. Please try again."
                )}
                actionLabel={t("আবার চেষ্টা করুন", "Try Again")}
                onAction={() => void handleStart()}
              />
            </motion.div>
          )}

          {phase === "empty" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <QuickStateCard
                icon={<Sparkles className="size-5 text-amber-600 dark:text-amber-400" />}
                title={t("এখনো কোনো প্রশ্ন পাওয়া যায়নি", "No questions available yet")}
                desc={t(
                  "এই মুহূর্তে কুইক কুইজের জন্য পর্যাপ্ত প্রশ্ন পাওয়া যায়নি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।",
                  "There are currently not enough questions available for this quiz. Please check back soon."
                )}
                actionLabel={t("পুনরায় চেষ্টা করুন", "Try Again")}
                onAction={() => void handleStart()}
              />
            </motion.div>
          )}

          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            >
              {quizQuestions[currentIndex] && (
                <QuickQuizView
                  question={quizQuestions[currentIndex]}
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
              )}
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            >
              <QuickResultsView
                score={score}
                total={quizQuestions.length}
                incorrectAnswers={incorrectAnswers}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* INTRO LAUNCHPAD (DESIGNS.md: Inset Header + 4-Cell Grid + Pill Button)       */
/* ========================================================================== */
function QuickIntro({
  starting,
  onStart,
}: {
  starting: boolean;
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
                <Zap className="size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold leading-5 text-[#242423] dark:text-[#f3f3f2] sm:text-[17px]">
                  {t("কুইক কুইজ", "Quick Blitz Quiz")}
                </h1>
                <p className="mt-0.5 text-[11.5px] text-[#242423]/60 dark:text-zinc-400 sm:text-[12.5px]">
                  {t(
                    "গ্রামার ও শ্রেণি ভিত্তিক দ্রুত প্রশ্নাবলি",
                    "Paced 20-question mixed challenge"
                  )}
                </p>
              </div>
            </div>

            {/* Status Indicator Pill */}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-medium text-[#242423] shadow-xs dark:bg-white/10 dark:text-zinc-200">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              20 × 20s
            </span>
          </div>
        </div>

        {/* Natural Language Highlight Box (Reference 4) */}
        <div className="mt-3.5 rounded-[16px] bg-[#242423]/[0.03] p-3 text-[13px] leading-relaxed text-[#242423]/75 dark:bg-white/[0.04] dark:text-zinc-300 sm:rounded-[18px] sm:p-3.5 sm:text-[13.5px]">
          {t(
            "দ্রুত ২০টি মিশ্র প্রশ্নে অংশ নিন। প্রতিটি প্রশ্নে সময় পাবেন ",
            "Solve a fast blitz of "
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#242423] shadow-2xs dark:bg-[#2e2e32] dark:text-zinc-100">
            20 {t("টি প্রশ্ন", "questions")}
          </span>
          {t(" এবং প্রতিটি প্রশ্নের জন্য বরাদ্দ ", " with ")}
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#242423] shadow-2xs dark:bg-[#2e2e32] dark:text-zinc-100">
            ⏱ 20s {t("সময়", "timer")}
          </span>
          {t(
            "। ভুল উত্তরগুলো স্বয়ংক্রিয়ভাবে ভুল ব্যাংকে সংরক্ষিত হবে।",
            ". Missed items automatically save to your Mistake Bank."
          )}
        </div>

        {/* 4-Cell Feature Grid with Soft Pastel Styles (DESIGNS.md Reference 6) */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:gap-2.5">
          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-blue-700/60 dark:text-blue-300/60">
                {t("প্রশ্ন সংখ্যা", "VOLUME")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-blue-700 shadow-2xs dark:bg-white/10 dark:text-blue-300">
                <ListOrdered className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] tabular-nums dark:text-[#f3f3f2]">
              20 {t("টি", "Qs")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("গ্রামার ও শ্রেণির প্রশ্ন", "Grammar & class")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-amber-700/60 dark:text-amber-300/60">
                {t("গতি সীমা", "PACE")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-amber-700 shadow-2xs dark:bg-white/10 dark:text-amber-300">
                <Timer className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] tabular-nums dark:text-[#f3f3f2]">
              20s / {t("প্রশ্ন", "Q")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("লাইভ কাউন্টডাউন", "Live countdown")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-rose-700/60 dark:text-rose-300/60">
                {t("স্মার্ট ট্র্যাক", "MISTAKE BANK")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-rose-700 shadow-2xs dark:bg-white/10 dark:text-rose-300">
                <ShieldAlert className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] dark:text-[#f3f3f2]">
              {t("অটো-সেভ", "Auto-log")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("পুনর্বার রিভিশন সুবিধা", "Retest incorrect")}
            </p>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-[#f8f8f6] dark:bg-[#252528] p-3 transition-colors sm:p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700/60 dark:text-emerald-300/60">
                {t("অ্যানালিটিক্স", "PERFORMANCE")}
              </span>
              <span className="flex size-7 items-center justify-center rounded-[10px] bg-white text-emerald-700 shadow-2xs dark:bg-white/10 dark:text-emerald-300">
                <Trophy className="size-3.5" />
              </span>
            </div>
            <p className="mt-1 text-[16px] font-bold text-[#242423] dark:text-[#f3f3f2]">
              {t("রেকর্ড", "Recorded")}
            </p>
            <p className="text-[11px] text-[#242423]/55 dark:text-zinc-400">
              {t("প্রোফাইল হিস্ট্রিতে যোগ", "Saved to history")}
            </p>
          </div>
        </div>

        {/* Primary Action Button (Reference 1 & Master Standard) */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-[14px] font-semibold text-white shadow-xs transition-all duration-150 hover:bg-black active:scale-[0.97] disabled:opacity-50 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            {starting ? (
              t("তৈরি হচ্ছে…", "Preparing Quiz…")
            ) : (
              <>
                <span>{t("কুইক কুইজ শুরু করুন", "Start Quick Quiz")}</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-[11.5px] text-[#242423]/45 dark:text-zinc-500">
            <span>{t("ভোকাবুলারি ব্যতিরেকে", "Grammar & class questions only")}</span>
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

/* ========================================================================== */
/* STATE CARD (Loading / Empty / Error)                                       */
/* ========================================================================== */
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

/* ========================================================================== */
/* QUIZ ACTIVE VIEW (DESIGNS.md: Inset HUD + Shimmer Track + Clean Options)   */
/* ========================================================================== */
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
                {question.difficultyLevel} · {question.quizType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Paced Countdown Badge */}
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
                <Trophy className="size-3" />
                {score}
              </span>

              {/* Exit Button */}
              <button
                type="button"
                onClick={() => onExitOpenChange(true)}
                className="grid size-7 place-items-center rounded-full text-[#242423]/45 transition-colors hover:bg-[#242423]/[0.06] hover:text-[#242423] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-100 sm:size-8"
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
          <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#242423]/45 dark:text-zinc-500">
            Question {currentIndex + 1}
          </span>
          <h2 className="mt-1.5 text-[15.5px] font-bold leading-snug text-[#242423] dark:text-[#f3f3f2] sm:text-[18.5px]">
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

        {/* Floating Next Question Bar */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 flex items-center justify-between border-t border-black/[0.05] pt-3.5 dark:border-white/[0.06]"
            >
              <span className="text-[12px] text-[#242423]/55 dark:text-zinc-400">
                {selectedAnswer
                  ? question.options.find((o) => o.text === selectedAnswer)?.correct
                    ? t("সঠিক উত্তর!", "Correct Answer!")
                    : t("ভুল উত্তর, নোট করা হলো", "Incorrect, logged to Mistake Bank")
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
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={exitOpen}
          onOpenChange={onExitOpenChange}
          variant="warning"
          title={t("কুইজটি ছেড়ে যাবেন?", "Exit this quiz session?")}
          description={t(
            "আপনার চলমান অগ্রগতি ও স্কোর সংরক্ষিত হবে না। আপনি কি নিশ্চিতভাবে বের হতে চান?",
            "Your current session progress will not be saved. Are you sure you want to exit?"
          )}
          confirmText={t("প্রস্থান করুন", "Exit Quiz")}
          cancelText={t("চালিয়ে যান", "Continue")}
          onConfirm={onExitConfirm}
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* RESULTS & MISTAKE DECK (DESIGNS.md: Reference 1 / Reference 4 / 3-Cell)     */
/* ========================================================================== */
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

  let resultLabel: string;
  let statusDot: string;
  if (percentage >= 90) {
    statusDot = "bg-emerald-500";
    resultLabel = t("অসাধারণ পারদর্শিতা!", "Excellent Mastery!");
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
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-[#242423] shadow-xs dark:bg-[#323236] dark:text-[#f3f3f2]">
            <Trophy className="size-5" />
          </div>
          <h3 className="mt-2.5 text-[17px] font-bold text-[#242423] dark:text-[#f3f3f2] sm:text-[19px]">
            {t("কুইক কুইজ সমাপ্ত!", "Quiz Completed!")}
          </h3>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-[#242423] shadow-2xs dark:bg-white/10 dark:text-zinc-200">
            <span className={cn("size-2 rounded-full", statusDot)} />
            {resultLabel}
          </div>
        </div>

        {/* 3-Cell Stat Inset (Reference 1 & Jordan Lee) */}
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
              {t("সঠিক", "CORRECT")}
            </p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-[22px]">
              {score}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium uppercase tracking-wider text-[#242423]/50 dark:text-zinc-500">
              {t("ভুল", "MISSED")}
            </p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-rose-600 dark:text-rose-400 sm:text-[22px]">
              {total - score}
            </p>
          </div>
        </div>

        {/* Mistakes Deck */}
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
                  <Link
                    href={`/quiz/question/${question.id}`}
                    className="font-semibold text-[#242423] transition-colors hover:text-[#0071e3] dark:text-[#f3f3f2] dark:hover:text-sky-400"
                  >
                    {question.questionText}
                  </Link>

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
          <button
            type="button"
            onClick={onRestart}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-[13.5px] font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-[0.97] dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
          >
            <RotateCcw className="size-4" />
            <span>{t("আবার খেলুন", "Play Again")}</span>
          </button>

          <Link
            href="/quiz"
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#242423]/[0.05] px-6 text-[13.5px] font-semibold text-[#242423] transition-all hover:bg-[#242423]/[0.09] active:scale-[0.97] dark:bg-white/[0.08] dark:text-[#f3f3f2] dark:hover:bg-white/[0.12]"
          >
            <ArrowLeft className="size-4" />
            <span>{t("কুইজ তালিকা", "All Quizzes")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
