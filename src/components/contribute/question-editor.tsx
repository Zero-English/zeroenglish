"use client";

import { Plus, Trash2, Circle, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useT } from "@/components/language-provider";
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
  quizTypeI18n,
  difficultyI18n,
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
  defaultOptionalOpen = false,
}: {
  value: DraftQuestion;
  onChange: (next: DraftQuestion) => void;
  typeOptions: QuizTypeOption[];
  defaultOptionalOpen?: boolean;
}) {
  const [optionalOpen, setOptionalOpen] = useState(defaultOptionalOpen);
  const t = useT();

  const optionalFilled =
    (value.explanation.trim() ? 1 : 0) + (value.class.length > 0 ? 1 : 0);

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
          <FieldLabel>{t("কুইজের ধরন", "Quiz type")}</FieldLabel>
          <Select
            value={value.quizType}
            onValueChange={(quizType) => onChange({ ...value, quizType })}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("কুইজের ধরন বেছে নিন", "Select a quiz type")}
              />
            </SelectTrigger>
            <SelectContent>
              {(typeOptions.length ? typeOptions : QUIZ_TYPE_FALLBACKS).map(
                (option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(...quizTypeI18n(option.value))}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{t("কঠিনতা", "Difficulty")}</FieldLabel>
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
                  {t(...difficultyI18n(option.value))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>{t("প্রশ্নের লেখা", "Question text")}</FieldLabel>
        <Textarea
          rows={3}
          value={value.questionText}
          placeholder={t("প্রশ্নটি লিখুন…", "Type the question…")}
          onChange={(e) => onChange({ ...value, questionText: e.target.value })}
        />
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>{t("অপশনসমূহ", "Options")}</FieldLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOptionsChange([...value.options, ""])}
          >
            <Plus className="h-4 w-4" />
            {t("অপশন যোগ করুন", "Add option")}
          </Button>
        </div>
        <div className="space-y-2">
          {value.options.map((option, i) => {
            const isAnswer = option.trim() === value.answer.trim();
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={
                    isAnswer
                      ? t("সঠিক উত্তর", "Correct answer")
                      : t("সঠিক উত্তর চিহ্নিত করুন", "Mark as correct answer")
                  }
                  title={
                    isAnswer
                      ? t("সঠিক উত্তর", "Correct answer")
                      : t("সঠিক উত্তর চিহ্নিত করুন", "Mark as correct answer")
                  }
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
                  placeholder={t(`অপশন ${i + 1}`, `Option ${i + 1}`)}
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
                    aria-label={t("অপশন মুছুন", "Remove option")}
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

      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setOptionalOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
        >
          <span className="flex items-center gap-2">
            <ChevronDown
              className={cn(
                "size-4 text-zinc-400 transition-transform dark:text-zinc-500",
                optionalOpen && "rotate-180"
              )}
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("ঐচ্ছিক বিবরণ", "Optional details")}
            </span>
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              optionalFilled > 0
                ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                : "bg-black/[0.04] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400"
            )}
          >
            {optionalFilled > 0
              ? t(`${optionalFilled}টি পূরণ হয়েছে`, `${optionalFilled} filled`)
              : t("ব্যাখ্যা ও শ্রেণি", "Explanation & classes")}
          </span>
        </button>
        {optionalOpen ? (
          <div
            className={cn(
              "space-y-4 border-t p-4",
              "border-black/[0.06] dark:border-white/[0.08]"
            )}
          >
            <Field>
              <FieldLabel>{t("ব্যাখ্যা (ঐচ্ছিক)", "Explanation (optional)")}</FieldLabel>
              <Textarea
                rows={2}
                value={value.explanation}
                placeholder={t(
                  "শিক্ষার্থীদের উত্তর বুঝতে সাহায্য করুন…",
                  "Help learners understand the answer…"
                )}
                onChange={(e) =>
                  onChange({ ...value, explanation: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>{t("শ্রেণি (ঐচ্ছিক)", "Classes (optional)")}</FieldLabel>
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
        ) : null}
      </div>
    </div>
  );
}

export type DraftValidationError =
  | "type-required"
  | "text-required"
  | "options-required"
  | "answer-required"
  | "answer-mismatch"
  | "duplicate-in-list";

export function validateDraft(q: DraftQuestion): DraftValidationError | null {
  if (!q.quizType.trim()) return "type-required";
  if (!q.questionText.trim()) return "text-required";
  const options = q.options.filter((o) => o.trim());
  if (options.length < 2) return "options-required";
  if (!q.answer.trim()) return "answer-required";
  if (!options.includes(q.answer.trim())) return "answer-mismatch";
  return null;
}

export const DRAFT_ERROR_I18N: Record<DraftValidationError, [string, string]> = {
  "type-required": ["কুইজের ধরন আবশ্যক।", "Quiz type is required."],
  "text-required": ["প্রশ্নের লেখা আবশ্যক।", "Question text is required."],
  "options-required": [
    "কমপক্ষে ২টি খালি নয় এমন অপশন আবশ্যক।",
    "At least 2 non-empty options are required.",
  ],
  "answer-required": ["সঠিক উত্তর আবশ্যক।", "Correct answer is required."],
  "answer-mismatch": [
    "সঠিক উত্তরটি একটি অপশনের সাথে মিলতে হবে।",
    "The correct answer must match one of the options.",
  ],
  "duplicate-in-list": [
    "এই প্রশ্নটি আপনার পর্যালোচনা তালিকায় ইতিমধ্যেই আছে।",
    "This question text is already in your review list.",
  ],
};