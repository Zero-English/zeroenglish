"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import { Languages, ArrowLeftRight, Shuffle, Layers, Volume2, Star, Sparkles, Gauge, ListOrdered, Check, X, type LucideIcon } from "lucide-react";
import { Word } from "@/lib/data";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import { useQuizStore, resetQuizState } from "@/lib/quiz-store";
import { incrementQuizzesDone, addCorrectAnswers } from "@/lib/db";
import { useAuthPath } from "@/lib/auth-store";
import {
  useQuizHistoryStore,
  type QuizType,
  type QuizHistoryEntry,
} from "@/lib/quiz-history-store";
import Link from "next/link";

type LevelOption = "A1" | "A2" | "B1" | "B2" | "Random";

interface Question {
  word: Word;
  options: { text: string; correct: boolean }[];
}

const LEVEL_SCOPE_OPTIONS: LevelOption[] = ["A1", "A2", "B1", "B2", "Random"];

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

const QUIZ_TYPE_CONFIG: Record<
  QuizType,
  { label: string; desc: string; icon: LucideIcon; gradient: string; bg: string; border: string; text: string }
> = {
  english_to_bangla: {
    label: "English → Bangla",
    desc: "Pick the correct Bangla meaning",
    icon: Languages,
    gradient: "from-sky-500 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
  },
  bangla_to_english: {
    label: "Bangla → English",
    desc: "Pick the correct English word",
    icon: ArrowLeftRight,
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  synonym: {
    label: "Synonyms",
    desc: "Find the word with the same meaning",
    icon: Shuffle,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  antonym: {
    label: "Antonyms",
    desc: "Find the word with the opposite meaning",
    icon: Layers,
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
  },
};

const QUIZ_TYPE_ORDER: QuizType[] = [
  "english_to_bangla",
  "bangla_to_english",
  "synonym",
  "antonym",
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function wordDistractors(pool: Word[], correctText: string): string[] {
  const seen = new Set<string>([correctText]);
  const out: string[] = [];
  for (const w of pool) {
    if (seen.has(w.word)) continue;
    seen.add(w.word);
    out.push(w.word);
    if (out.length === 3) break;
  }
  return out;
}

function firstMeaning(meaning: string): string {
  return meaning.split(";")[0].trim();
}

export function QuizClient({ words }: { words: Word[] }) {
  const step = useQuizStore((s) => s.step);
  const quizType = useQuizStore((s) => s.quizType);
  const selectedLevels = useQuizStore((s) => s.selectedLevels);
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
    (levels: LevelOption[]): Word[] => {
      const validWords = words.filter(
        (w) => w.meaning_bn !== "..." && w.meaning_bn.length > 0
      );
      const picked = levels.filter((lv) => lv !== "Random");
      if (levels.length === 0 || picked.length === 0) return validWords;
      return validWords.filter((w) => picked.includes(w.level));
    },
    [words]
  );

  const getQuizPool = useCallback(
    (levels: LevelOption[], type: QuizType): Word[] => {
      const pool = getPool(levels);
      if (type === "synonym") return pool.filter((w) => w.synonyms.length > 0);
      if (type === "antonym") return pool.filter((w) => w.antonyms.length > 0);
      return pool;
    },
    [getPool]
  );

  const getMaxCount = useCallback(
    (levels: LevelOption[], type: QuizType) => getQuizPool(levels, type).length,
    [getQuizPool]
  );

  const generateQuestions = useCallback(
    (levels: LevelOption[], qty: number, all: boolean, type: QuizType) => {
      const pool = getQuizPool(levels, type);
      const shuffled = shuffleArray(pool);
      const count = all ? shuffled.length : Math.min(qty, shuffled.length);
      const selected = shuffled.slice(0, count);

      return selected.map((word) => {
        const others = shuffleArray(pool.filter((w) => w.id !== word.id)).slice(0, 6);
        let options: { text: string; correct: boolean }[];

        if (type === "bangla_to_english") {
          options = shuffleArray([
            { text: word.word, correct: true },
            ...others.slice(0, 3).map((d) => ({ text: d.word, correct: false })),
          ]);
        } else if (type === "synonym") {
          const correctText =
            word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
          options = shuffleArray([
            { text: correctText, correct: true },
            ...wordDistractors(others, correctText).map((t) => ({
              text: t,
              correct: false,
            })),
          ]);
        } else if (type === "antonym") {
          const correctText =
            word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
          options = shuffleArray([
            { text: correctText, correct: true },
            ...wordDistractors(others, correctText).map((t) => ({
              text: t,
              correct: false,
            })),
          ]);
        } else {
          options = shuffleArray([
            { text: firstMeaning(word.meaning_bn), correct: true },
            ...others.slice(0, 3).map((d) => ({
              text: firstMeaning(d.meaning_bn),
              correct: false,
            })),
          ]);
        }

        return { word, options };
      });
    },
    [getQuizPool]
  );

  const handleQuizTypeSelect = (type: QuizType) => {
    useQuizStore.setState({
      quizType: type,
      selectedLevels: [],
      step: "settings",
    });
  };

  const toggleLevel = (lv: LevelOption) => {
    useQuizStore.setState((prev) => {
      if (lv === "Random") {
        return {
          selectedLevels: prev.selectedLevels.includes("Random") ? [] : ["Random"],
        };
      }
      if (prev.selectedLevels.includes(lv)) {
        return { selectedLevels: prev.selectedLevels.filter((x) => x !== lv) };
      }
      return {
        selectedLevels: [...prev.selectedLevels.filter((x) => x !== "Random"), lv],
      };
    });
  };

  const handleStartQuiz = () => {
    if (!quizType) return;
    const generated = generateQuestions(
      selectedLevels,
      quantity,
      useAllQuestions,
      quizType
    );
    useQuizStore.setState({
      questions: generated,
      currentIndex: 0,
      score: 0,
      incorrectAnswers: [],
      selectedAnswer: null,
      isAnswered: false,
      timeLeft: noTimeLimit ? -1 : timePerQuestion,
      resultsRecorded: false,
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
    return <QuizTypeSelect onSelect={handleQuizTypeSelect} />;
  }

  if (step === "settings") {
    return (
      <SettingsView
        quizType={quizType ?? "english_to_bangla"}
        levels={selectedLevels}
        quantity={quantity}
        useAllQuestions={useAllQuestions}
        timePerQuestion={timePerQuestion}
        noTimeLimit={noTimeLimit}
        maxCount={getMaxCount(selectedLevels, quizType ?? "english_to_bangla")}
        onLevelChange={toggleLevel}
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
        quizType={quizType ?? "english_to_bangla"}
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
        quizType={quizType ?? "english_to_bangla"}
        score={score}
        total={questions.length}
        incorrectAnswers={incorrectAnswers}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

function QuizTypeSelect({ onSelect }: { onSelect: (type: QuizType) => void }) {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="w-full max-w-3xl">
        <div className="animate-fade-up text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Vocabulary Quiz
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Choose a Quiz Type
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Pick how you want to practice. Every mode builds your vocabulary differently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {QUIZ_TYPE_ORDER.map((type, i) => {
            const c = QUIZ_TYPE_CONFIG[type];
            const Icon = c.icon;
            const featured = type === "english_to_bangla";
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`group relative flex flex-col text-left overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                  featured
                    ? "sm:col-span-2 border-2 " + c.border + " " + c.bg
                    : "border-2 " + c.border + " " + c.bg
                } hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.99]`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="relative flex items-center justify-between p-6">
                  <div className={`flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg shadow-black/10`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {featured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      Most Popular
                    </span>
                  )}
                </div>

                <div className={`relative flex-1 px-6 pb-6 ${featured ? "sm:pt-0" : "pt-1"}`}>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {c.label}
                  </h3>
                  <p className={`text-sm font-medium mt-1 ${c.text}`}>{c.desc}</p>

                  <div className={`flex flex-wrap items-center gap-2 mt-4 ${featured ? "" : ""}`}>
                    {type === "english_to_bangla" && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        Word → Meaning
                      </span>
                    )}
                    {type === "bangla_to_english" && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        Meaning → Word
                      </span>
                    )}
                    {type === "synonym" && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        Same meaning
                      </span>
                    )}
                    {type === "antonym" && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        Opposite meaning
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      Start
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </div>

                <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsView({
  quizType,
  levels,
  quantity,
  useAllQuestions,
  timePerQuestion,
  noTimeLimit,
  maxCount,
  onLevelChange,
  onQuantityChange,
  onUseAllChange,
  onTimeChange,
  onNoTimeLimitChange,
  onStart,
  onBack,
}: {
  quizType: QuizType;
  levels: LevelOption[];
  quantity: number;
  useAllQuestions: boolean;
  timePerQuestion: number;
  noTimeLimit: boolean;
  maxCount: number;
  onLevelChange: (lv: LevelOption) => void;
  onQuantityChange: (q: number) => void;
  onUseAllChange: (all: boolean) => void;
  onTimeChange: (t: number) => void;
  onNoTimeLimitChange: (noLimit: boolean) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const qt = QUIZ_TYPE_CONFIG[quizType];
  const c = LEVEL_CONFIG[levels.includes("Random") ? "Random" : (levels[0] ?? "A1")];
  const QuizIcon = qt.icon;

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
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
          Back to quiz types
        </button>

        <div className="animate-fade-up">
          <div className={`relative overflow-hidden rounded-3xl border ${qt.border} ${qt.bg} backdrop-blur-sm p-6 sm:p-8 mb-8`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${qt.gradient} opacity-10`} />
            <div className="relative flex items-center gap-4">
              <div
                className={`flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${qt.gradient} flex items-center justify-center shadow-lg shadow-black/10`}
              >
                <QuizIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {qt.label}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {qt.desc} · {maxCount} words available
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${qt.bg}`}>
                  <Layers className={`h-3.5 w-3.5 ${qt.text}`} />
                </span>
                Level Scope
              </h3>
              <div className="flex flex-wrap gap-2">
                {LEVEL_SCOPE_OPTIONS.map((lv) => {
                  const lc = LEVEL_CONFIG[lv];
                  const active = levels.includes(lv);
                  const lcStyle = active
                    ? `${lc.border} ${lc.bg} ${lc.text} border-2 shadow-sm`
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600";
                  return (
                    <button
                      key={lv}
                      onClick={() => onLevelChange(lv)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${lcStyle}`}
                    >
                      {active && <span className="font-bold">✓</span>}
                      {lv === "Random" ? "All Levels" : `Level ${lv}`}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
                {levels.length === 0 || levels.includes("Random")
                  ? "All levels selected — questions from every level"
                  : `${levels.length} level${levels.length > 1 ? "s" : ""} selected`}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${qt.bg}`}>
                  <ListOrdered className={`h-3.5 w-3.5 ${qt.text}`} />
                </span>
                Number of Questions
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {QUANTITY_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onQuantityChange(q);
                      onUseAllChange(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      !useAllQuestions && quantity === q
                        ? `${c.border} ${c.bg} ${c.text} border-2 shadow-sm`
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
                      ? `${c.border} ${c.bg} ${c.text} border-2 shadow-sm`
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  All ({maxCount})
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxCount}
                  placeholder="Custom"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
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
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${qt.bg}`}>
                  <Gauge className={`h-3.5 w-3.5 ${qt.text}`} />
                </span>
                Time per Question
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTimeChange(t);
                      onNoTimeLimitChange(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                      !noTimeLimit && timePerQuestion === t
                        ? `${c.border} ${c.bg} ${c.text} border-2 shadow-sm`
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
                      ? `${c.border} ${c.bg} ${c.text} border-2 shadow-sm`
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  No limit
                </button>
                <input
                  type="number"
                  min={1}
                  placeholder="Custom"
                  value={timePerQuestion}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
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
                className={`w-full h-12 text-base font-semibold bg-gradient-to-r ${qt.gradient} hover:opacity-90`}
              >
                Start Quiz
              </Button>
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-3">
                {useAllQuestions
                  ? `${maxCount} question${maxCount !== 1 ? "s" : ""} · all levels`
                  : `${quantity} question${quantity !== 1 ? "s" : ""} · ${levels.length === 0 || levels.includes("Random") ? "all levels" : levels.join(", ")}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizView({
  quizType,
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
  readonly quizType: QuizType;
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
  const prompt = quizType === "bangla_to_english" ? firstMeaning(question.word.meaning_bn) : question.word.word;
  const qt = QUIZ_TYPE_CONFIG[quizType];
  const lc = LEVEL_CONFIG[question.word.level];
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="max-w-xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentIndex + 1}</span>
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
              Score{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{score}</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-10 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r", qt.gradient)}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word */}
        <div className="animate-fade-up text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{question.word.parts_of_speech}</span>
            <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
            <span className={cn("text-xs font-semibold", lc.text)}>{question.word.level}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight inline-flex items-center gap-3 justify-center mb-8">
            {prompt}
            {quizType !== "bangla_to_english" && (
              <button
                onClick={() => speak(question.word.word)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Listen to pronunciation"
              >
                <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const isCorrectOption = option.correct;
            const isWrongPick = isAnswered && option.text === selectedAnswer && !isCorrectOption;

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
                className={`w-full flex items-center gap-3 text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default ${optionStyle}`}
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
                    letters[i] ?? ""
                  )}
                </span>

                <span
                  className={cn(
                    "flex-1 text-sm sm:text-base leading-relaxed",
                    isCorrectOption && isAnswered
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
              {currentIndex >= totalQuestions - 1 ? "See Results" : "Next Question"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsView({
  quizType,
  score,
  total,
  incorrectAnswers,
  onRestart,
}: {
  quizType: QuizType;
  score: number;
  total: number;
  incorrectAnswers: { word: Word; correctMeaning: string; userAnswer: string }[];
  onRestart: () => void;
}) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const { path, hydrated } = useAuthPath();
  const addHistoryEntry = useQuizHistoryStore((s) => s.addEntry);

  useEffect(() => {
    if (!hydrated || useQuizStore.getState().resultsRecorded) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    incrementQuizzesDone(dateStr, path);
    addCorrectAnswers(dateStr, score, path);
    const questions = useQuizStore.getState().questions;
    const levels = Array.from(
      new Set(questions.map((q) => q.word.level))
    ).sort();
    const entry: QuizHistoryEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      quizType,
      date: dateStr,
      win: `${percentage}%`,
      levels,
      numberOfQuestions: total,
      timePerQuestion: useQuizStore.getState().noTimeLimit
            ? 0
            : useQuizStore.getState().timePerQuestion,
    };
    addHistoryEntry(entry);
    useQuizStore.setState({ resultsRecorded: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, quizType]);

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
