"use client";

import { Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  type DraftQuestion,
  type DifficultyLevelValue,
  QUIZ_TYPE_FALLBACKS,
  DIFFICULTY_OPTIONS,
  CLASS_OPTIONS,
} from "./types";

type QuizTypeOption = { value: string; label: string };

export function emptyDraft(overrides: Partial<DraftQuestion> = {}): DraftQuestion {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quizType: "",
    questionText: "",
    options: ["", ""],
    difficultyLevel: "EASY",
    answer: "",
    explanation: "",
    class: [],
    ...overrides,
  };
}

export function QuestionEditor({
  value,
  onChange,
  typeOptions,
}: {
  value: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
  typeOptions: QuizTypeOption[];
}) {
  function handleOptionsChange(options: string[]) {
    const nonEmpty = options.map((o) => o.trim()).filter(Boolean);
    const nextAnswer = nonEmpty.includes(value.answer.trim())
      ? value.answer.trim()
      : (nonEmpty[0] ?? "");
    onChange({ ...value, options, answer: nextAnswer });
  }

  function toggleClass(cls: string) {
    onChange({
      ...value,
      class: value.class.includes(cls)
        ? value.class.filter((c) => c !== cls)
        : [...value.class, cls],
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Quiz type</FieldLabel>
          <Select
            value={value.quizType}
            onValueChange={(quizType) => onChange({ ...value, quizType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a quiz type" />
            </SelectTrigger>
            <SelectContent>
              {(typeOptions.length ? typeOptions : QUIZ_TYPE_FALLBACKS).map(
                (option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Difficulty</FieldLabel>
          <Select
            value={value.difficultyLevel}
            onValueChange={(difficultyLevel) =>
              onChange({
                ...value,
                difficultyLevel: difficultyLevel as DifficultyLevelValue,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>Question text</FieldLabel>
        <Textarea
          rows={3}
          value={value.questionText}
          placeholder="Type the question…"
          onChange={(e) => onChange({ ...value, questionText: e.target.value })}
        />
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>Options</FieldLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOptionsChange([...value.options, ""])}
          >
            <Plus className="h-4 w-4" />
            Add option
          </Button>
        </div>
        <div className="space-y-2">
          {value.options.map((option, i) => {
            const isAnswer = option.trim() === value.answer.trim();
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={isAnswer ? "Correct answer" : "Mark as correct answer"}
                  title={isAnswer ? "Correct answer" : "Mark as correct answer"}
                  onClick={() => onChange({ ...value, answer: option.trim() })}
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                    isAnswer
                      ? "bg-emerald-500 text-white"
                      : "text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
                  )}
                >
                  {isAnswer ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <Input
                  value={option}
                  placeholder={`Option ${i + 1}`}
                  onChange={(e) => {
                    const next = [...value.options];
                    next[i] = e.target.value;
                    handleOptionsChange(next);
                  }}
                />
                {value.options.length > 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove option"
                    onClick={() =>
                      handleOptionsChange(
                        value.options.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </Field>

      <Field>
        <FieldLabel>Explanation (optional)</FieldLabel>
        <Textarea
          rows={2}
          value={value.explanation}
          placeholder="Help learners understand the answer…"
          onChange={(e) =>
            onChange({ ...value, explanation: e.target.value })
          }
        />
      </Field>

      <Field>
        <FieldLabel>Classes (optional)</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {CLASS_OPTIONS.map((cls) => {
            const active = value.class.includes(cls);
            return (
              <button
                key={cls}
                type="button"
                onClick={() => toggleClass(cls)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

export function validateDraft(q: DraftQuestion): string | null {
  if (!q.quizType.trim()) return "Quiz type is required.";
  if (!q.questionText.trim()) return "Question text is required.";
  const options = q.options.filter((o) => o.trim());
  if (options.length < 2) return "At least 2 non-empty options are required.";
  if (!q.answer.trim()) return "Correct answer is required.";
  if (!options.includes(q.answer.trim()))
    return "The correct answer must match one of the options.";
  return null;
}