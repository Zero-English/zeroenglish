"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  examLevelOptions,
  examModeOptions,
  type ExamLevelValue,
  type ExamModeValue,
  type QuizExamDetail,
} from "../_data/exams";
import {
  difficultyLabelMap,
  quizTypeOptions,
  type DifficultyLevelValue,
  type QuizTypeValue,
} from "../_data/quizzes";

export type ExamPayload = {
  title: string;
  mode: ExamModeValue;
  levels: ExamLevelValue[];
  questionIds: number[];
  timePerQuestion: number;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  resultsPublished: boolean;
};

type QuestionOption = {
  id: number;
  quizType: QuizTypeValue;
  questionText: string;
  options: string[];
  difficultyLevel: DifficultyLevelValue;
  answer: string;
};

type ExamFormState = {
  title: string;
  mode: ExamModeValue;
  levels: ExamLevelValue[];
  questionIds: number[];
  timePerQuestion: string;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string;
  scheduledClosingTime: string;
  resultsPublished: boolean;
};

function emptyForm(): ExamFormState {
  return {
    title: "",
    mode: "PRACTICE",
    levels: [],
    questionIds: [],
    timePerQuestion: "30",
    scheduleEnabled: false,
    scheduledOpeningTime: "",
    scheduledClosingTime: "",
    resultsPublished: false,
  };
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ExamFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: QuizExamDetail | null;
  onSave: (payload: ExamPayload) => void;
}) {
  const [form, setForm] = useState<ExamFormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] =
    useState<string>("all");

  const [lastKey, setLastKey] = useState<string>("");

  function resetForm() {
    setForm(
      editing
        ? {
            title: editing.title,
            mode: editing.mode,
            levels: editing.levels,
            questionIds: editing.questions.map((q) => q.id),
            timePerQuestion: String(editing.timePerQuestion),
            scheduleEnabled: editing.scheduleEnabled,
            scheduledOpeningTime: toDatetimeLocal(
              editing.scheduledOpeningTime
            ),
            scheduledClosingTime: toDatetimeLocal(
              editing.scheduledClosingTime
            ),
            resultsPublished: editing.resultsPublished,
          }
        : emptyForm()
    );
    setError(null);
    setQuestionSearch("");
    setQuestionTypeFilter("all");
  }

  const key = `${open ? "open" : "closed"}:${editing ? editing.id : "new"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) resetForm();
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/v1/quiz")
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: QuestionOption[] }) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setQuestions(json.data);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load questions");
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredQuestions = useMemo(() => {
    const q = questionSearch.trim().toLowerCase();
    return questions.filter((question) => {
      if (
        questionTypeFilter !== "all" &&
        question.quizType !== questionTypeFilter
      ) {
        return false;
      }
      if (q) {
        const haystack = [
          question.questionText,
          question.answer,
          ...question.options,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [questions, questionSearch, questionTypeFilter]);

  function toggleLevel(level: ExamLevelValue) {
    setForm((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  }

  function toggleQuestion(id: number) {
    setForm((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(id)
        ? prev.questionIds.filter((q) => q !== id)
        : [...prev.questionIds, id],
    }));
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.levels.length === 0) {
      setError("Select at least one level.");
      return;
    }
    if (form.questionIds.length === 0) {
      setError("Select at least one question.");
      return;
    }
    const time = Number(form.timePerQuestion);
    if (!Number.isInteger(time) || time < 1) {
      setError("Time per question must be a positive integer.");
      return;
    }
    if (form.scheduleEnabled) {
      if (!form.scheduledOpeningTime || !form.scheduledClosingTime) {
        setError(
          "Opening and closing times are required when scheduling is on."
        );
        return;
      }
      if (
        new Date(form.scheduledOpeningTime) >=
        new Date(form.scheduledClosingTime)
      ) {
        setError("Opening time must be before the closing time.");
        return;
      }
    }

    const payload: ExamPayload = {
      title: form.title.trim(),
      mode: form.mode,
      levels: form.levels,
      questionIds: form.questionIds,
      timePerQuestion: time,
      scheduleEnabled: form.scheduleEnabled,
      scheduledOpeningTime:
        form.scheduleEnabled && form.scheduledOpeningTime
          ? new Date(form.scheduledOpeningTime).toISOString()
          : null,
      scheduledClosingTime:
        form.scheduleEnabled && form.scheduledClosingTime
          ? new Date(form.scheduledClosingTime).toISOString()
          : null,
      resultsPublished: form.resultsPublished,
    };
    onSave(payload);
  }

  const inputClass =
    "h-7 rounded-md border border-input bg-input/20 px-2 py-1 text-xs text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit exam" : "Create exam"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the exam configuration and its question selection."
              : "Build a new exam from the question bank."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Title
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Weekly Quiz A1-A2"
              />
            </Field>
            <Field>
              <FieldLabel>Mode</FieldLabel>
              <Select
                value={form.mode}
                onValueChange={(v) =>
                  setForm({ ...form, mode: v as ExamModeValue })
                }
              >
                <SelectTrigger className="w-full" aria-label="Exam mode">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  {examModeOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel className="flex items-center gap-0.5">
              Levels
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {examLevelOptions.map((level) => {
                const selected = form.levels.includes(level.value);
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => toggleLevel(level.value)}
                    aria-pressed={selected}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field>
            <FieldLabel>Time per question (seconds)</FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={form.timePerQuestion}
              onChange={(e) =>
                setForm({ ...form, timePerQuestion: e.target.value })
              }
            />
          </Field>

          {/* Scheduling */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.scheduleEnabled}
                onCheckedChange={(checked) =>
                  setForm({ ...form, scheduleEnabled: checked === true })
                }
              />
              Schedule this exam (restrict availability window)
            </label>
            {form.scheduleEnabled && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Opening time</FieldLabel>
                  <input
                    type="datetime-local"
                    value={form.scheduledOpeningTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledOpeningTime: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field>
                  <FieldLabel>Closing time</FieldLabel>
                  <input
                    type="datetime-local"
                    value={form.scheduledClosingTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledClosingTime: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={form.resultsPublished}
              onCheckedChange={(checked) =>
                setForm({ ...form, resultsPublished: checked === true })
              }
            />
            Publish results immediately
          </label>

          {/* Question picker */}
          <Field>
            <FieldLabel className="flex items-center justify-between">
              Questions
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {form.questionIds.length} selected
              </span>
            </FieldLabel>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-52 flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Search questions..."
                    className="pl-8"
                  />
                </div>
                <Select
                  value={questionTypeFilter}
                  onValueChange={setQuestionTypeFilter}
                >
                  <SelectTrigger className="w-44" aria-label="Filter by type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {quizTypeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.questionIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.questionIds.map((id) => {
                    const question = questions.find((q) => q.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[0.6875rem] font-medium text-primary"
                      >
                        #{id}
                        {question
                          ? ` ${question.questionText.slice(0, 18)}${
                              question.questionText.length > 18 ? "…" : ""
                            }`
                          : ""}
                        <button
                          type="button"
                          onClick={() => toggleQuestion(id)}
                          aria-label={`Remove question ${id}`}
                          className="text-primary/70 hover:text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
                {questionsLoading ? (
                  <p className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    Loading questions...
                  </p>
                ) : filteredQuestions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    No questions match your filters.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredQuestions.map((question) => {
                      const checked = form.questionIds.includes(question.id);
                      return (
                        <li
                          key={question.id}
                          className={`flex items-start gap-2.5 px-3 py-2 text-xs transition-colors ${
                            checked ? "bg-primary/5" : ""
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleQuestion(question.id)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              #{question.id} — {question.questionText}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {question.options.slice(0, 3).map((opt, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.6875rem] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                >
                                  {opt.length > 18 ? opt.slice(0, 18) + "…" : opt}
                                </span>
                              ))}
                              {question.options.length > 3 && (
                                <span className="text-[0.6875rem] text-gray-400">
                                  +{question.options.length - 3}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[0.6875rem] text-emerald-700 dark:text-emerald-400">
                              Answer: {question.answer}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                              {quizTypeOptions.find(
                                (t) => t.value === question.quizType
                              )?.label ?? question.quizType}
                            </span>
                            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
                              {difficultyLabelMap[question.difficultyLevel] ??
                                question.difficultyLevel}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </Field>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            <Plus />
            {editing ? "Save changes" : "Create exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}