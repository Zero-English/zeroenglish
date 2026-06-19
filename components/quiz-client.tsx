"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import { Volume2 } from "lucide-react";
import { Word } from "@/lib/data";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import { useQuizStore, resetQuizState } from "@/lib/quiz-store";
import { incrementQuizzesDone } from "@/lib/db";
import Link from "next/link";

type LevelOption = "A1" | "A2" | "B1" | "B2" | "Random";
type Step = "select" | "settings" | "quiz" | "results";

interface Question {
  word: Word;
  options: { text: string; correct: boolean }[];
}

const LEVELS: LevelOption[] = ["A1", "A2", "B1", "B2", "Random"];

const LEVEL_CONFIG: Record<
  LevelOption,
  { bg: string; border: string; text: string; gradient: string; label: string }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
  },
  Random: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    gradient: "from-purple-500 to-violet-500",
    label: "Mixed Levels",
  },
};

const QUANTITY_OPTIONS = [5, 10, 15, 20, 25, 30] as const;
const TIME_OPTIONS = [10, 15, 20, 30, 60] as const;

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizClient({ words }: { words: Word[] }) {
  const step = useQuizStore((s) => s.step);
  const selectedLevel = useQuizStore((s) => s.selectedLevel);
  const quantity = useQuizStore((s) => s.quantity);
  const useAllQuestions = useQuizStore((s) => s.useAllQuestions);
  const timePerQuestion = useQuizStore((s) => s.timePerQuestion);
  const noTimeLimit = useQuizStore((s) => s.noTimeLimit);
  const questions = useQuizStore((s) => s.questions);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const score = useQuizStore((s) => s.score);
  const selectedAnswer = useQuizStore((s) => s.selectedAnswer);
  const isAnswered = useQuizStore((s) => s.isAnswered);
  const timeLeft = useQuizStore((s) => s.timeLeft);
  const incorrectAnswers = useQuizStore((s) => s.incorrectAnswers);

  const { addStillLearning, loaded: stillLearningLoaded } = useStillLearningWords();

  const savedRef = useRef(false);
  useEffect(() => {
    if (step === "results" && stillLearningLoaded && !savedRef.current) {
      savedRef.current = true;
      const entries = incorrectAnswers.map((ia) => ({
        id: ia.word.id,
        word: ia.word.word,
      }));
      if (entries.length > 0) addStillLearning(entries);
    }
  }, [step, stillLearningLoaded, incorrectAnswers, addStillLearning]);

  useEffect(() => {
    if (step !== "results") savedRef.current = false;
  }, [step]);

  const isAnsweredRef = useRef(false);
  const questionsRef = useRef<Question[]>([]);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    isAnsweredRef.current = isAnswered;
  }, [isAnswered]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const getPool = useCallback(
    (level: LevelOption): Word[] => {
      const validWords = words.filter(
        (w) => w.meaning_bn !== "..." && w.meaning_bn.length > 0
      );
      if (level === "Random") return validWords;
      return validWords.filter((w) => w.level === level);
    },
    [words]
  );

  const getMaxCount = useCallback(
    (level: LevelOption) => getPool(level).length,
    [getPool]
  );

  const generateQuestions = useCallback(
    (level: LevelOption, qty: number, all: boolean) => {
      const pool = getPool(level);
      const shuffled = shuffleArray(pool);
      const count = all ? shuffled.length : Math.min(qty, shuffled.length);
      const selected = shuffled.slice(0, count);

      return selected.map((word) => {
        const distractors = shuffleArray(
          pool.filter((w) => w.id !== word.id)
        ).slice(0, 3);
        const options = shuffleArray([
          { text: word.meaning_bn, correct: true },
          ...distractors.map((d) => ({
            text: d.meaning_bn,
            correct: false,
          })),
        ]);
        return { word, options };
      });
    },
    [getPool]
  );

  const handleLevelSelect = (level: LevelOption) => {
    useQuizStore.setState({ selectedLevel: level, step: "settings" });
  };

  const handleStartQuiz = () => {
    if (!selectedLevel) return;
    const generated = generateQuestions(
      selectedLevel,
      quantity,
      useAllQuestions
    );
    useQuizStore.setState({
      questions: generated,
      currentIndex: 0,
      score: 0,
      incorrectAnswers: [],
      selectedAnswer: null,
      isAnswered: false,
      timeLeft: noTimeLimit ? -1 : timePerQuestion,
      step: "quiz",
    });
  };

  const handleOptionClick = (option: { text: string; correct: boolean }) => {
    if (isAnsweredRef.current) return;

    useQuizStore.setState({ isAnswered: true, selectedAnswer: option.text });

    if (option.correct) {
      useQuizStore.setState((prev) => ({ score: prev.score + 1 }));
    } else {
      const idx = currentIndexRef.current;
      const q = questionsRef.current[idx];
      if (q) {
        useQuizStore.setState((prev) => ({
          incorrectAnswers: [
            ...prev.incorrectAnswers,
            {
              word: q.word,
              correctMeaning: q.word.meaning_bn,
              userAnswer: option.text,
            },
          ],
        }));
      }
    }
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      useQuizStore.setState({ step: "results" });
    } else {
      useQuizStore.setState({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        isAnswered: false,
        timeLeft: noTimeLimit ? -1 : timePerQuestion,
      });
    }
  };

  const handleRestart = () => {
    resetQuizState();
  };

  useEffect(() => {
    if (step !== "quiz" || isAnswered || noTimeLimit || timeLeft < 0) return;

    const timer = setInterval(() => {
      const current = useQuizStore.getState().timeLeft;
      if (current <= 1) {
        clearInterval(timer);
        useQuizStore.setState({ timeLeft: 0 });
      } else {
        useQuizStore.setState({ timeLeft: current - 1 });
      }
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isAnswered, noTimeLimit, currentIndex]);

  useEffect(() => {
    if (
      step === "quiz" &&
      !isAnsweredRef.current &&
      !noTimeLimit &&
      timeLeft === 0
    ) {
      const idx = currentIndexRef.current;
      const q = questionsRef.current[idx];
      if (q) {
        useQuizStore.setState((prev) => ({
          isAnswered: true,
          selectedAnswer: null,
          incorrectAnswers: [
            ...prev.incorrectAnswers,
            {
              word: q.word,
              correctMeaning: q.word.meaning_bn,
              userAnswer: "Time's up!",
            },
          ],
        }));
      } else {
        useQuizStore.setState({ isAnswered: true, selectedAnswer: null });
      }
    }
  }, [timeLeft, noTimeLimit, step]);

  if (step === "select") {
    return <LevelSelect onSelect={handleLevelSelect} />;
  }

  if (step === "settings") {
    return (
      <SettingsView
        level={selectedLevel!}
        quantity={quantity}
        useAllQuestions={useAllQuestions}
        timePerQuestion={timePerQuestion}
        noTimeLimit={noTimeLimit}
        maxCount={getMaxCount(selectedLevel!)}
        onQuantityChange={(q) => useQuizStore.setState({ quantity: q })}
        onUseAllChange={(v) => useQuizStore.setState({ useAllQuestions: v })}
        onTimeChange={(t) => useQuizStore.setState({ timePerQuestion: t })}
        onNoTimeLimitChange={(v) => useQuizStore.setState({ noTimeLimit: v })}
        onStart={handleStartQuiz}
        onBack={() => useQuizStore.setState({ step: "select" })}
      />
    );
  }

  if (step === "quiz") {
    const q = questions[currentIndex];
    return (
      <QuizView
        question={q}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        score={score}
        timeLeft={timeLeft}
        noTimeLimit={noTimeLimit}
        selectedAnswer={selectedAnswer}
        isAnswered={isAnswered}
        onOptionClick={handleOptionClick}
        onNext={handleNext}
      />
    );
  }

  if (step === "results") {
    return (
      <ResultsView
        score={score}
        total={questions.length}
        incorrectAnswers={incorrectAnswers}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

function LevelSelect({ onSelect }: { onSelect: (level: LevelOption) => void }) {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="animate-fade-up text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Vocabulary Quiz
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Choose your level and test your knowledge
        </p>
      </div>

      <div className="flex flex-wrap gap-5 justify-center max-w-2xl">
        {LEVELS.map((level, i) => {
          const c = LEVEL_CONFIG[level];
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`group relative flex flex-row items-center justify-center w-35 h-35 sm:w-44 sm:h-44 rounded-3xl border-2 ${c.border} ${c.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] cursor-pointer`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
              />
              <div className="relative flex flex-col items-center">
                <span
                  className={`text-3xl sm:text-5xl font-black bg-gradient-to-br ${c.gradient} bg-clip-text text-transparent`}
                >
                  {level === "Random" ? "?" : level}
                </span>
                <span className={`text-xs font-medium mt-1.5 ${c.text}`}>
                  {c.label}
                </span>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:w-12 transition-all duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsView({
  level,
  quantity,
  useAllQuestions,
  timePerQuestion,
  noTimeLimit,
  maxCount,
  onQuantityChange,
  onUseAllChange,
  onTimeChange,
  onNoTimeLimitChange,
  onStart,
  onBack,
}: {
  level: LevelOption;
  quantity: number;
  useAllQuestions: boolean;
  timePerQuestion: number;
  noTimeLimit: boolean;
  maxCount: number;
  onQuantityChange: (q: number) => void;
  onUseAllChange: (all: boolean) => void;
  onTimeChange: (t: number) => void;
  onNoTimeLimitChange: (noLimit: boolean) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const c = LEVEL_CONFIG[level];

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-8"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5">
            &larr;
          </span>
          Back to levels
        </button>

        <div className="animate-fade-up">
          <div className="flex items-center gap-4 mb-10">
            <div
              className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl font-black text-white`}
            >
              {level === "Random" ? "?" : level}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {c.label}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {maxCount} words available
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Number of Questions
              </h3>
              <div className="flex flex-wrap gap-2">
                {QUANTITY_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onQuantityChange(q);
                      onUseAllChange(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      !useAllQuestions && quantity === q
                        ? `${c.border} ${c.bg} ${c.text} border-2`
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {q}
                  </button>
                ))}
                <button
                  onClick={() => onUseAllChange(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                    useAllQuestions
                      ? `${c.border} ${c.bg} ${c.text} border-2`
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  All ({maxCount})
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Time per Question
              </h3>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTimeChange(t);
                      onNoTimeLimitChange(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      !noTimeLimit && timePerQuestion === t
                        ? `${c.border} ${c.bg} ${c.text} border-2`
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
                <button
                  onClick={() => onNoTimeLimitChange(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                    noTimeLimit
                      ? `${c.border} ${c.bg} ${c.text} border-2`
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  No limit
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={onStart}
                className="w-full h-12 text-base font-semibold"
              >
                Start Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizView({
  question,
  currentIndex,
  totalQuestions,
  score,
  timeLeft,
  noTimeLimit,
  selectedAnswer,
  isAnswered,
  onOptionClick,
  onNext,
}: {
  readonly question: Question;
  readonly currentIndex: number;
  readonly totalQuestions: number;
  readonly score: number;
  readonly timeLeft: number;
  readonly noTimeLimit: boolean;
  readonly selectedAnswer: string | null;
  readonly isAnswered: boolean;
  readonly onOptionClick: (option: { text: string; correct: boolean }) => void;
  readonly onNext: () => void;
}) {
  const speak = useSpeak();
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {currentIndex + 1}
            </span>{" "}
            / {totalQuestions}
          </div>

          {!noTimeLimit && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-mono font-semibold",
                timeLeft <= 5
                  ? "text-red-500"
                  : timeLeft <= 10
                  ? "text-amber-500"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
                <circle cx="12" cy="12" r="9" />
              </svg>
              {timeLeft}s
            </div>
          )}

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Score:{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {score}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-zinc-500 to-zinc-700 dark:from-zinc-400 dark:to-zinc-200 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word card */}
        <div className="animate-fade-up">
            <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {question.word.parts_of_speech}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight inline-flex items-center gap-3 justify-center">
              {question.word.word}
              <button
                onClick={() => speak(question.word.word)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Listen to pronunciation"
              >
                <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, i) => {
              let optionStyle =
                "border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/60";

              if (isAnswered) {
                if (option.correct) {
                  optionStyle =
                    "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30";
                } else if (option.text === selectedAnswer && !option.correct) {
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
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border backdrop-blur-sm transition-all duration-200 cursor-pointer disabled:cursor-default ${optionStyle}`}
                >
                  <span
                    className={cn(
                      "text-sm sm:text-base leading-relaxed",
                      isAnswered && option.correct
                        ? "text-emerald-800 dark:text-emerald-200 font-medium"
                        : option.text === selectedAnswer && !option.correct
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
            <div className="mt-8 flex justify-center animate-fade-up">
              <Button onClick={onNext} size="lg" className="px-10">
                {currentIndex >= totalQuestions - 1
                  ? "See Results"
                  : "Next Question"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsView({
  score,
  total,
  incorrectAnswers,
  onRestart,
}: {
  score: number;
  total: number;
  incorrectAnswers: { word: Word; correctMeaning: string; userAnswer: string }[];
  onRestart: () => void;
}) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    incrementQuizzesDone(dateStr);
  }, []);

  let resultColor: string;
  let resultLabel: string;
  if (percentage >= 90) {
    resultColor = "text-emerald-500";
    resultLabel = "Excellent!";
  } else if (percentage >= 70) {
    resultColor = "text-sky-500";
    resultLabel = "Great Job!";
  } else if (percentage >= 50) {
    resultColor = "text-amber-500";
    resultLabel = "Good Effort!";
  } else {
    resultColor = "text-rose-500";
    resultLabel = "Keep Practicing!";
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-6 py-16">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-up text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Quiz Complete!
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
              correct out of{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {total}
              </span>{" "}
              questions
            </p>
          </div>
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="animate-fade-up-2 mb-10">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
              <span>Words to Review ({incorrectAnswers.length})</span>
            </h3>
            <div className="space-y-3">
              {incorrectAnswers.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-4 sm:p-5"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {item.word.word}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-md px-2 py-0.5">
                      {item.word.parts_of_speech}
                    </span>
                  </div>
                  <div className="mt-2 text-sm space-y-1">
                    <p className="text-emerald-600 dark:text-emerald-400">
                      Correct: {item.correctMeaning}
                    </p>
                    {item.userAnswer !== "Time's up!" && (
                      <p className="text-red-500 dark:text-red-400">
                        Your answer: {item.userAnswer}
                      </p>
                    )}
                    {item.userAnswer === "Time's up!" && (
                      <p className="text-amber-500 dark:text-amber-400">
                        Time ran out
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-up-3 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRestart} size="lg" className="px-8">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
