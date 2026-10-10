"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import {
  Languages,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  Equal,
  Contrast,
  Layers,
  Volume2,
  Star,
  Sparkles,
  Gauge,
  ListOrdered,
  Check,
  X,
  Bookmark,
  BookmarkCheck,
  type LucideIcon,
} from "lucide-react";
import { Word } from "@/lib/data";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useQuizStore, resetQuizState } from "@/lib/quiz-store";
import { useQuizChrome } from "@/lib/quiz-chrome";
import { incrementQuizzesDone, addCorrectAnswers } from "@/lib/db";
import { useAuthPath, useAuthStatus } from "@/lib/auth-store";
import { putQuizHistoryEntry } from "@/lib/use-quiz-history";
import {
  type QuizType,
  type QuizHistoryEntry,
} from "@/lib/quiz-history-store";
import { requestLogin } from "@/lib/login-required";
import Link from "next/link";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

type LevelOption = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Random";

type QuizLevel = LevelOption;

interface Question {
  word: Word;
  options: { text: string; correct: boolean }[];
}

const LEVEL_SCOPE_OPTIONS: LevelOption[] = ["A1", "A2", "B1", "B2", "C1", "C2", "Random"];

const LEVEL_CONFIG: Record<
  QuizLevel,
  { bg: string; border: string; text: string; gradient: string; label: string; labelBn: string }
> = {
  A1: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-teal-500",
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
  },
  A2: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500 to-blue-500",
    label: "Elementary",
    labelBn: "প্রাথমিক",
  },
  B1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-orange-500",
    label: "Intermediate",
    labelBn: "মাঝারি",
  },
  B2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-pink-500",
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
  },
  Random: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    gradient: "from-purple-500 to-violet-500",
    label: "Mixed Levels",
    labelBn: "মিশ্র লেভেল",
  },
  C1: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    gradient: "from-violet-500 to-purple-500",
    label: "Advanced",
    labelBn: "উন্নত",
  },
  C2: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    gradient: "from-fuchsia-500 to-pink-500",
    label: "Mastery",
    labelBn: "পারদর্শী",
  },
};

const QUANTITY_OPTIONS = [5, 10, 15, 20, 25, 30] as const;
const TIME_OPTIONS = [10, 15, 20, 30, 60] as const;

const QUIZ_TYPE_CONFIG: Record<
  QuizType,
  {
    label: string;
    labelBn: string;
    desc: string;
    descBn: string;
    icon: LucideIcon;
    gradient: string;
    accent: string;
    pill: string;
    badge: string;
    badgeBn: string;
  }
> = {
  english_to_bangla: {
    label: "English to Bangla",
    labelBn: "ইংরেজি থেকে বাংলা",
    desc: "Pick the correct Bangla meaning for the given English word.",
    descBn: "প্রদত্ত ইংরেজি শব্দের সঠিক বাংলা অর্থটি বেছে নিন।",
    icon: Languages,
    gradient: "from-sky-500 to-blue-500",
    accent: "bg-sky-100/80 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    pill: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    badge: "Popular",
    badgeBn: "জনপ্রিয়",
  },
  bangla_to_english: {
    label: "Bangla to English",
    labelBn: "বাংলা থেকে ইংরেজি",
    desc: "Pick the correct English word for the given Bangla meaning.",
    descBn: "প্রদত্ত বাংলা অর্থের সঠিক ইংরেজি শব্দটি বেছে নিন।",
    icon: ArrowRightLeft,
    gradient: "from-indigo-500 to-violet-500",
    accent: "bg-indigo-100/80 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    pill: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    badge: "Word Match",
    badgeBn: "শব্দ মেলান",
  },
  synonym: {
    label: "Synonyms",
    labelBn: "সমার্থক শব্দ",
    desc: "Find the word with the closest matching meaning.",
    descBn: "একই ও সমার্থক অর্থের শব্দটি খুঁজে বের করুন।",
    icon: Equal,
    gradient: "from-emerald-500 to-teal-500",
    accent: "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    pill: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    badge: "Synonym",
    badgeBn: "সমার্থক",
  },
  antonym: {
    label: "Antonyms",
    labelBn: "বিপরীত শব্দ",
    desc: "Find the word with the opposite meaning.",
    descBn: "বিপরীত ও বিপরীতার্থক অর্থের শব্দটি খুঁজুন।",
    icon: Contrast,
    gradient: "from-rose-500 to-pink-500",
    accent: "bg-rose-100/80 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    pill: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    badge: "Antonym",
    badgeBn: "বিপরীত",
  },
};

const QUIZ_TYPE_ORDER: QuizType[] = [
  "english_to_bangla",
  "bangla_to_english",
  "synonym",
  "antonym",
];

const CLIENT_TO_DB_QUIZ_TYPE: Record<QuizType, string> = {
  english_to_bangla: "ENGLISH_TO_BANGLA",
  bangla_to_english: "BANGLA_TO_ENGLISH",
  synonym: "SYNONYMS",
  antonym: "ANTONYMS",
};

function firstMeaning(meaning: string[]): string {
  return (meaning[0] ?? "").trim();
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

export function QuizVocabularyClient() {
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
  const t = useT();

  // On a fresh page mount, never show a previously finished quiz's results
  // screen. Drop the transient progress (the quiz settings are preserved in
  // the persisted store, and a full reload already starts at "select").
  useEffect(() => {
    const { step: currentStep } = useQuizStore.getState();
    if (currentStep === "results") {
      useQuizStore.setState({
        step: "select",
        questions: [],
        currentIndex: 0,
        score: 0,
        selectedAnswer: null,
        isAnswered: false,
        timeLeft: 0,
        deadlineAt: null,
        incorrectAnswers: [],
        resultsRecorded: false,
      });
    }
  }, []);

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

  const [poolCount, setPoolCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const poolRequestRef = useRef(0);

  useEffect(() => {
    if (step !== "settings" || !quizType) return;
    const requestId = ++poolRequestRef.current;
    setCountLoading(true);
    const params = new URLSearchParams({
      quizType,
      levels: selectedLevels.join(","),
    });
    fetch(`/api/v1/quiz/pool?${params.toString()}`)
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: { maxCount?: number } }) => {
        if (poolRequestRef.current === requestId) {
          setPoolCount(
            json.success && typeof json.data?.maxCount === "number"
              ? json.data.maxCount
              : 0
          );
          setCountLoading(false);
        }
      })
      .catch(() => {
        if (poolRequestRef.current === requestId) {
          setPoolCount(0);
          setCountLoading(false);
        }
      });
  }, [step, quizType, selectedLevels]);

  const handleQuizTypeSelect = (type: QuizType) => {
    setCountLoading(true);
    useQuizStore.setState({
      quizType: type,
      selectedLevels: [],
      step: "settings",
    });
  };

  const toggleLevel = (lv: LevelOption) => {
    setCountLoading(true);
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

  const [starting, setStarting] = useState(false);

  const handleStartQuiz = async () => {
    if (!quizType || starting) return;
    if (requestLogin()) return;
    setStarting(true);
    try {
      const res = await fetch("/api/v1/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizType,
          levels: selectedLevels,
          quantity,
          useAllQuestions,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { questions: Question[]; maxCount: number };
        message?: string;
      };
      if (
        !json.success ||
        !json.data ||
        !Array.isArray(json.data.questions) ||
        json.data.questions.length === 0
      ) {
        toast.error(
          json.message ||
            t(
              "এই লেভেলে কুইজের জন্য কোনো শব্দ নেই। অন্য লেভেল বা ধরন বেছে নিন।",
              "No words available for this quiz. Pick a different level or quiz type."
            )
        );
        return;
      }
      useQuizStore.setState({
        questions: json.data.questions,
        currentIndex: 0,
        score: 0,
        incorrectAnswers: [],
        selectedAnswer: null,
        isAnswered: false,
        timeLeft: noTimeLimit ? -1 : timePerQuestion,
        deadlineAt: noTimeLimit ? null : Date.now() + timePerQuestion * 1000,
        resultsRecorded: false,
        step: "quiz",
      });
      requestQuizFullscreen();
    } catch {
      toast.error(t("কুইজ তৈরি করা যায়নি", "Couldn't create the quiz"));
    } finally {
      setStarting(false);
    }
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
              correctMeaning: firstMeaning(q.word.meaningBn),
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
        deadlineAt: noTimeLimit ? null : Date.now() + timePerQuestion * 1000,
      });
    }
  };

  const handleRestart = () => {
    resetQuizState();
  };

  useEffect(() => {
    if (step !== "quiz" || isAnswered || noTimeLimit || timeLeft < 0) return;

    const deadline = useQuizStore.getState().deadlineAt;
    if (deadline == null) return;

    useQuizStore.setState({
      timeLeft: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
    });

    const timer = setInterval(() => {
      useQuizStore.setState({
        timeLeft: Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
      });
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
              correctMeaning: firstMeaning(q.word.meaningBn),
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
        maxCount={poolCount}
        countLoading={countLoading}
        starting={starting}
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

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

function QuizTypeSelect({
  onSelect,
}: {
  onSelect: (type: QuizType) => void;
}) {
  const t = useT();
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(ICON_CHIP, "text-sky-500")}>
            <Languages className="size-4.5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("শব্দভাণ্ডার অনুশীলন", "Vocabulary Practice")}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {t(
                "শব্দভাণ্ডার মজবুত করতে একটি মোড বেছে নিয়ে অনুশীলন শুরু করুন।",
                "Pick a practice mode and sharpen your word recall."
              )}
            </p>
          </div>
        </div>
        <Link
          href="/quiz"
          className="inline-flex self-start sm:self-center items-center gap-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/60 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("সব কুইজ", "All Quizzes")}
        </Link>
      </div>

      <div className={cn(CARD, "overflow-hidden")}>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
          {QUIZ_TYPE_ORDER.map((type) => {
            const card = QUIZ_TYPE_CONFIG[type];
            const Icon = card.icon;
            const isFeatured = type === "english_to_bangla";
            return (
              <StaggerItem
                key={type}
                className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0"
              >
                <button
                  onClick={() => onSelect(type)}
                  className={cn(
                    "group flex h-full w-full flex-col text-left gap-3 p-5 sm:p-6 transition-colors cursor-pointer",
                    "hover:bg-black/[0.02] active:bg-black/[0.02] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
                        card.accent
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                        card.pill
                      )}
                    >
                      {isFeatured && <Star className="h-3 w-3 fill-amber-400 text-amber-500" />}
                      {t(card.badgeBn, card.badge)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {t(card.labelBn, card.label)}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {t(card.descBn, card.desc)}
                    </p>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
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
  countLoading,
  starting,
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
  maxCount: number | null;
  countLoading: boolean;
  starting: boolean;
  onLevelChange: (lv: LevelOption) => void;
  onQuantityChange: (q: number) => void;
  onUseAllChange: (all: boolean) => void;
  onTimeChange: (t: number) => void;
  onNoTimeLimitChange: (noLimit: boolean) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const qt = QUIZ_TYPE_CONFIG[quizType];
  const QuizIcon = qt.icon;
  const t = useT();
  const countLabel =
    countLoading || maxCount === null ? "…" : String(maxCount);

  const activeStyle =
    "bg-sky-600 text-white border-sky-600 shadow-sm dark:bg-sky-500 dark:border-sky-500";
  const idleStyle =
    "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-4 sm:space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("কুইজের ধরনে ফিরে যান", "Back to quiz types")}
      </button>

      {/* Selected Mode Banner */}
      <div className={cn(CARD, "p-4 sm:p-5")}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br text-white shadow-sm",
              qt.gradient
            )}
          >
            <QuizIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t(qt.labelBn, qt.label)}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(qt.descBn, qt.desc)} ·{" "}
              {t(`${countLabel}টি শব্দ পাওয়া যায়`, `${countLabel} words available`)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Level Scope Card */}
        <div className={cn(CARD, "p-4 sm:p-5")}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-3.5 w-3.5" />
            </div>
            {t("লেভেলের পরিধি", "Level Scope")}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {LEVEL_SCOPE_OPTIONS.map((lv) => {
              const active = levels.includes(lv);
              return (
                <button
                  key={lv}
                  onClick={() => onLevelChange(lv)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1",
                    active ? activeStyle : idleStyle
                  )}
                >
                  {active && <span className="font-bold">✓</span>}
                  {lv === "Random"
                    ? t("সব লেভেল", "All Levels")
                    : `${t("লেভেল", "Level")} ${lv}`}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
            {levels.length === 0 || levels.includes("Random")
              ? t(
                  "সব লেভেল অন্তর্ভুক্ত — প্রতিটি লেভেল থেকে প্রশ্ন আসবে",
                  "All levels included — questions drawn across all bands"
                )
              : t(
                  `${levels.length}টি লেভেল নির্বাচিত`,
                  `${levels.length} level${levels.length > 1 ? "s" : ""} selected`
                )}
          </p>
        </div>

        {/* Number of Questions Card */}
        <div className={cn(CARD, "p-4 sm:p-5")}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <ListOrdered className="h-3.5 w-3.5" />
            </div>
            {t("প্রশ্নের সংখ্যা", "Number of Questions")}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {QUANTITY_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => {
                  onQuantityChange(q);
                  onUseAllChange(false);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer tabular-nums",
                  !useAllQuestions && quantity === q ? activeStyle : idleStyle
                )}
              >
                {q}
              </button>
            ))}
            <button
              onClick={() => onUseAllChange(true)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
                useAllQuestions ? activeStyle : idleStyle
              )}
            >
              {t(`সব (${countLabel})`, `All (${countLabel})`)}
            </button>
            <input
              type="number"
              min={1}
              max={maxCount ?? undefined}
              placeholder={t("কাস্টম", "Custom")}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onQuantityChange(val);
                  onUseAllChange(false);
                }
              }}
              className="w-20 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Time per Question Card */}
        <div className={cn(CARD, "p-4 sm:p-5")}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Gauge className="h-3.5 w-3.5" />
            </div>
            {t("প্রতি প্রশ্নে সময়", "Time per Question")}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {TIME_OPTIONS.map((tVal) => (
              <button
                key={tVal}
                onClick={() => {
                  onTimeChange(tVal);
                  onNoTimeLimitChange(false);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer tabular-nums",
                  !noTimeLimit && timePerQuestion === tVal
                    ? activeStyle
                    : idleStyle
                )}
              >
                {tVal}s
              </button>
            ))}
            <button
              onClick={() => onNoTimeLimitChange(true)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer",
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
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onTimeChange(val);
                  onNoTimeLimitChange(false);
                }
              }}
              className="w-20 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.04] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-1">
          <Button
            onClick={onStart}
            disabled={starting || countLoading}
            className="w-full h-11 text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-700 active:bg-sky-700 text-white shadow-md shadow-sky-500/20 cursor-pointer"
          >
            {starting
              ? t("তৈরি হচ্ছে…", "Preparing…")
              : t("কুইজ শুরু করুন", "Start Quiz")}
          </Button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
            {useAllQuestions
              ? t(
                  `${countLabel}টি প্রশ্ন · সব লেভেল`,
                  `${countLabel} question${maxCount !== 1 ? "s" : ""} · all levels`
                )
              : t(
                  `${quantity}টি প্রশ্ন · ${
                    levels.length === 0 || levels.includes("Random")
                      ? "সব লেভেল"
                      : levels.join(", ")
                  }`,
                  `${quantity} question${quantity !== 1 ? "s" : ""} · ${
                    levels.length === 0 || levels.includes("Random")
                      ? "all levels"
                      : levels.join(", ")
                  }`
                )}
          </p>
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
  const t = useT();
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const prompt =
    quizType === "bangla_to_english"
      ? firstMeaning(question.word.meaningBn)
      : question.word.word;
  const qt = QUIZ_TYPE_CONFIG[quizType];
  const lc = LEVEL_CONFIG[question.word.level as QuizLevel];
  const letters = ["A", "B", "C", "D"];
  const [exitOpen, setExitOpen] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarkedWords();
  const bookmarked = isBookmarked(question.word.id);

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
              {t(qt.labelBn, qt.label)}
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
                      : "bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300"
                )}
              >
                <Gauge className="h-3 w-3" />
                {timeLeft}s
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {t("স্কোর:", "Score:")} {score}
            </span>
            <button
              onClick={() => setExitOpen(true)}
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
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r",
              qt.gradient
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word prompt header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {question.word.wordType.join(", ")}
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
            <span className={cn("text-[11px] font-bold", lc.text)}>
              {question.word.level}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {prompt}
            </h2>
            {quizType !== "bangla_to_english" && (
              <button
                onClick={() => speak(question.word.word)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
              >
                <Volume2 className="h-4.5 w-4.5" />
              </button>
            )}
            <button
              onClick={() => toggleBookmark(question.word.id)}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                bookmarked
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
              title={
                bookmarked
                  ? t("বুকমার্ক সরান", "Remove bookmark")
                  : t("বুকমার্ক করুন", "Bookmark")
              }
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4.5 w-4.5" />
              ) : (
                <Bookmark className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
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
              className="px-8 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20 cursor-pointer"
            >
              {currentIndex >= totalQuestions - 1
                ? t("ফলাফল দেখুন", "See Results")
                : t("পরের প্রশ্ন", "Next Question")}
            </Button>
          </div>
        )}

        <ConfirmDialog
          open={exitOpen}
          onOpenChange={setExitOpen}
          variant="warning"
          title={t("কুইজটি ছেড়ে যাবেন?", "Exit the quiz?")}
          description={t(
            "আপনার অগ্রগতি সংরক্ষিত হবে না। আপনি কি নিশ্চিতভাবে প্রস্থান করতে চান?",
            "Your progress won't be saved. Are you sure you want to exit?"
          )}
          confirmText={t("প্রস্থান করুন", "Exit")}
          cancelText={t("চালিয়ে যান", "Keep going")}
          onConfirm={() => {
            resetQuizState();
          }}
        />
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
  const { status } = useAuthStatus();
  const t = useT();
  const vocabUploadedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || useQuizStore.getState().resultsRecorded) return;
    let cancelled = false;
    void (async () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await incrementQuizzesDone(dateStr, path);
      await addCorrectAnswers(dateStr, score, path);
      const questions = useQuizStore.getState().questions;
      const levels = Array.from(
        new Set(questions.map((q) => q.word.level))
      ).sort();
      const isTimed = !useQuizStore.getState().noTimeLimit;
      const timePerQuestion = isTimed ? useQuizStore.getState().timePerQuestion : 0;
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
        timePerQuestion,
        createdAt: Date.now(),
      };
      await putQuizHistoryEntry(path, entry);
      if (!cancelled && !vocabUploadedRef.current && status === "google") {
        vocabUploadedRef.current = true;
        const incorrectWordIds = Array.from(
          new Set(
            useQuizStore
              .getState()
              .incorrectAnswers.map((ia) => ia.word.id)
          )
        );
        const correctWordIds = useQuizStore
          .getState()
          .questions.map((q) => q.word.id)
          .filter((id) => !incorrectWordIds.includes(id));
        const quizStoreState = useQuizStore.getState();
        try {
          await fetch("/api/v1/vocabulary-exam-result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              correctWordIds,
              incorrectWordIds,
              scoreInPercent: percentage,
              levels: Array.from(
                new Set(
                  useQuizStore.getState().questions.map((q) => q.word.level)
                )
              ),
              timePerWord: quizStoreState.noTimeLimit
                ? 0
                : quizStoreState.timePerQuestion,
              quizType: CLIENT_TO_DB_QUIZ_TYPE[quizType],
            }),
          });
        } catch {
          // Best-effort upload; the local record is already saved.
        }
      }
      if (cancelled) return;
      useQuizStore.setState({ resultsRecorded: true });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("progress-changed"));
        window.dispatchEvent(new Event("activity-changed"));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, quizType, status]);

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
    <div className="px-4 py-6 sm:px-6 max-w-xl mx-auto">
      <div className={cn(CARD, "p-5 sm:p-7 space-y-5")}>
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("কুইজ সমাপ্ত!", "Quiz Completed!")}
          </h3>
          <p className={cn("text-sm sm:text-base font-bold mt-1", resultColor)}>
            {resultLabel}
          </p>
        </div>

        {/* Score Hero */}
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] p-5 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
            {percentage}%
          </div>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {score}
            </span>{" "}
            {t("টির মধ্যে সঠিক", "correct out of")}{" "}
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              {total}
            </span>{" "}
            {t("টি প্রশ্ন", "questions")}
          </p>
        </div>

        {/* Incorrect Words Deck */}
        {incorrectAnswers.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t(
                `পুনরায় দেখার শব্দ (${incorrectAnswers.length})`,
                `Words to Review (${incorrectAnswers.length})`
              )}
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {incorrectAnswers.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-950/40 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                      {item.word.word}
                    </span>
                    <span className="rounded-md bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {item.word.wordType.join(", ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {item.userAnswer !== "Time's up!" && (
                      <span className="rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 font-medium">
                        {t("আপনার উত্তর:", "Your answer:")} {item.userAnswer}
                      </span>
                    )}
                    {item.userAnswer === "Time's up!" && (
                      <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">
                        {t("সময় শেষ", "Time expired")}
                      </span>
                    )}
                    <span className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-medium">
                      {t("সঠিক অর্থ:", "Correct:")} {item.correctMeaning}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Button
            onClick={onRestart}
            size="lg"
            className="w-full sm:w-auto px-6 h-10 text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20 cursor-pointer"
          >
            {t("আবার চেষ্টা করুন", "Try Again")}
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-6 h-10 text-xs sm:text-sm border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
          >
            <Link href="/quiz">
              {t("সব কুইজ", "All Quizzes")}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto px-6 h-10 text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <Link href="/">
              {t("হোম", "Home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
