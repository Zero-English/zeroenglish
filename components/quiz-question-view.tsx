import { Check, Gauge, Hash, Layers, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizBackLink } from "@/components/quiz-back-link";

export interface QuizQuestionViewData {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: string;
  answer: string;
  explanation?: string;
}

interface QuizQuestionViewProps {
  question: QuizQuestionViewData;
}

const DIFFICULTY_STYLE: Record<string, { label: string; style: string }> = {
  EASY: {
    label: "Easy",
    style:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  MEDIUM: {
    label: "Medium",
    style:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  HARD: {
    label: "Hard",
    style: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function QuizQuestionView({ question }: QuizQuestionViewProps) {
  const difficulty = DIFFICULTY_STYLE[question.difficultyLevel] ?? {
    label: question.difficultyLevel,
    style: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <QuizBackLink className="mb-6" />

        {/* Question card */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
                difficulty.style
              )}
            >
              <Gauge className="h-3 w-3" />
              {difficulty.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Layers className="h-3 w-3" />
              {question.quizType}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Hash className="h-3 w-3" />
              #{question.id}
            </span>
          </div>

          {/* Question text */}
          <h1 className="mt-5 text-xl sm:text-2xl font-bold leading-snug text-zinc-900 dark:text-zinc-100">
            {question.questionText}
          </h1>

          {/* Options */}
          <div className="mt-8 space-y-2.5">
            {question.options.map((option, i) => {
              const isCorrect = option === question.answer;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 sm:p-4 transition-colors",
                    isCorrect
                      ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/30 dark:border-emerald-600 dark:bg-emerald-950/40"
                      : "border-zinc-200 bg-white/80 dark:border-zinc-700 dark:bg-zinc-950/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      isCorrect
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                  >
                    {isCorrect ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      (LETTERS[i] ?? "")
                    )}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm sm:text-base leading-relaxed",
                      isCorrect
                        ? "font-medium text-emerald-800 dark:text-emerald-200"
                        : "text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Correct answer */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Correct Answer
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {question.answer}
            </p>
          </div>

          {/* Explanation */}
          {question.explanation ? (
            <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Explanation
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                  {question.explanation.split(/<br\s*\/?>/i).map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}