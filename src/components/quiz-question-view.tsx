import { Check, Gauge, Layers, Lightbulb, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { QuizBackLink } from "@/components/quiz-back-link";
import { QuizPosterModal } from "@/components/template-engine/quiz-poster-modal";

export interface QuizQuestionViewData {
  id: number;
  quizType: string;
  questionText: string;
  options: string[];
  difficultyLevel: string;
  answer: string;
  explanation?: string;
  addedBy?: {
    id: number;
    name: string | null;
    user_name: string | null;
  } | null;
}

interface QuizQuestionViewProps {
  question: QuizQuestionViewData;
}

const DIFFICULTY_STYLE: Record<string, { label: string; style: string }> = {
  EASY: {
    label: "Easy",
    style:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  MEDIUM: {
    label: "Medium",
    style:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  HARD: {
    label: "Hard",
    style:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
};

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

export function QuizQuestionView({ question }: QuizQuestionViewProps) {
  const difficulty = DIFFICULTY_STYLE[question.difficultyLevel] ?? {
    label: question.difficultyLevel,
    style: "bg-black/[0.04] text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.08]",
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <QuizBackLink />
        <QuizPosterModal quizId={question.id} />
      </div>

      {/* Question Card */}
      <div className={cn(CARD, "p-5 sm:p-6 space-y-5")}>
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
              difficulty.style
            )}
          >
            <Gauge className="h-3.5 w-3.5" />
            {difficulty.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 px-2.5 py-0.5 text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            {question.quizType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400">
            #{question.id}
          </span>
          {question.addedBy ? (
            <Link
              href={`/profile/${question.addedBy.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-violet-500/20"
            >
              <User className="h-3.5 w-3.5" />
              {question.addedBy.name || `@${question.addedBy.user_name}`}
            </Link>
          ) : null}
        </div>

        {/* Question Text */}
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
            {question.questionText}
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const isCorrect = option === question.answer;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 sm:p-4 transition-all",
                  isCorrect
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/30"
                    : "border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isCorrect
                      ? "bg-emerald-500 text-white"
                      : "bg-black/[0.05] dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    (LETTERS[i] ?? "")
                  )}
                </span>
                <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
                  {option}
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanation Box */}
        {question.explanation ? (
          <div className="flex gap-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 sm:p-5 text-amber-900 dark:text-amber-100">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Explanation
              </p>
              <div className="text-sm sm:text-base leading-relaxed text-amber-900/90 dark:text-amber-100/90 font-normal">
                {question.explanation.split(/<br\s*\/?>/i).map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}