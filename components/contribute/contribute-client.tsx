"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BookOpen,
  Loader2,
  FileJson,
  Upload,
  ClipboardList,
  CheckCircle2,
  CircleDashed,
  Pencil,
  Trash2,
  X,
  PlusCircle,
  ListChecks,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { bulkQuizUploadSchema } from "@/utils/validation/zod";
import {
  QuestionEditor,
  emptyDraft,
  validateDraft,
} from "./question-editor";
import {
  type DraftQuestion,
  quizTypeLabel,
  difficultyLabel,
} from "./types";

type QuizTypeOption = { value: string; label: string };

type MyQuestion = {
  id: number;
  quizType: string;
  questionText: string;
  difficultyLevel: string;
  isPending: boolean;
};

type ManualMode = "manual" | "bulk";

function nextDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function questionKey(text: string): string {
  return text.trim().toLowerCase();
}

export function ContributeClient() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ContributeHeader />
          <ContributionTypes />
          <QuizContributeFlow />
          <MySubmissions />
        </div>
      </div>
    </div>
  );
}

function ContributeHeader() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Brain className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Contribute
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Share your knowledge with the Zero English community. Contributions
          are reviewed by admins before going live.
        </p>
      </div>
    </div>
  );
}

function ContributionTypes() {
  const [active, setActive] = useState<"quiz" | "vocabulary">("quiz");

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setActive("quiz")}
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border p-5 text-left transition-all",
          active === "quiz"
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-zinc-200/80 bg-white/70 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
        )}
      >
        <span
          className={cn(
            "inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
            active === "quiz"
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          <Brain className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Quiz Questions
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              Active
            </Badge>
          </span>
          <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">
            Submit grammar, vocabulary and comprehension questions.
          </span>
        </span>
      </button>

      <button
        type="button"
        disabled
        onClick={() => toast("Vocabulary contribution is coming soon.")}
        className="flex items-center gap-4 rounded-2xl border border-dashed border-zinc-200 p-5 text-left opacity-70 dark:border-zinc-800"
      >
        <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
          <BookOpen className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">
              Vocabulary
            </span>
            <Badge variant="outline" className="text-zinc-400">
              Coming soon
            </Badge>
          </span>
          <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">
            Add new words with meanings, examples and more.
          </span>
        </span>
      </button>
    </div>
  );
}

function QuizContributeFlow() {
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [typeOptions, setTypeOptions] = useState<QuizTypeOption[]>([]);
  const [manualDraft, setManualDraft] = useState<DraftQuestion>(() => emptyDraft());
  const [manualError, setManualError] = useState<string | null>(null);
  const [mode, setMode] = useState<ManualMode>("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (message: string) => toast(message);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length) {
          setTypeOptions(
            json.data.map((t: { id: number; name: string }) => ({
              value: t.name,
              label: quizTypeLabel(t.name),
            }))
          );
        }
      })
      .catch(() => {
        // Keep the fallback list.
      });
  }, []);

  function addDraft(draft: DraftQuestion) {
    setDrafts((prev) => [...prev, { ...draft, id: nextDraftId() }]);
    setEditingId(null);
  }

  function updateDraft(id: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setEditingId((cur) => (cur === id ? null : cur));
  }

  function handleAddManual() {
    const error = validateDraft(manualDraft);
    if (error) {
      setManualError(error);
      return;
    }
    const key = questionKey(manualDraft.questionText);
    if (drafts.some((d) => questionKey(d.questionText) === key)) {
      setManualError(
        "This question text is already in your review list. Edit it there instead of adding it twice."
      );
      return;
    }
    addDraft(manualDraft);
    setManualDraft(emptyDraft());
    setManualError(null);
    setMode("manual");
    notify("Question added to review.");
  }

  async function handleBulkFile(file: File) {
    setImporting(true);
    try {
      if (!file.name.toLowerCase().endsWith(".json")) {
        notify("Only .json files are allowed.");
        return;
      }
      const text = await file.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        notify("Invalid JSON. Please check the file syntax.");
        return;
      }

      const parsed = bulkQuizUploadSchema.safeParse(body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const location = issue?.path?.join(".");
        const detail = issue?.message ?? "Invalid data";
        notify(
          `Validation failed at "${location ?? "row"}": ${detail}`
        );
        return;
      }

      const rows = parsed.data.map((row) =>
        emptyDraft({
          quizType: row.quizType,
          questionText: row.questionText,
          options: [...row.options],
          difficultyLevel: row.difficultyLevel,
          answer: row.answer,
          explanation: row.explanation ?? "",
          class: [...(row.class ?? [])],
        })
      );

      const existingKeys = new Set(
        drafts.map((d) => questionKey(d.questionText))
      );
      const added: DraftQuestion[] = [];
      const skipped: string[] = [];
      for (const row of rows) {
        const key = questionKey(row.questionText);
        if (existingKeys.has(key)) {
          skipped.push(row.questionText);
          continue;
        }
        existingKeys.add(key);
        added.push(row);
      }

      if (added.length > 0) {
        setDrafts((prev) => [...prev, ...added]);
        notify(
          `${added.length} question(s) loaded from the file. Review and submit.`
        );
      }
      if (skipped.length > 0) {
        notify(
          `${skipped.length} duplicate question text(s) skipped: ${skipped
            .slice(0, 3)
            .map((t) => `"${t}"`)
            .join(", ")}${skipped.length > 3 ? "…" : ""}`
        );
      }
    } catch {
      notify("Failed to read the file. Please try again.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    handleBulkFile(file);
  }

  async function handleSubmit() {
    const seen = new Set<string>();
    for (const d of drafts) {
      const key = questionKey(d.questionText);
      if (seen.has(key)) {
        notify(
          `Duplicate question text in your list: "${d.questionText.trim()}". Make each question unique before submitting.`
        );
        return;
      }
      seen.add(key);
    }

    const rows = drafts.map((d) => ({
      quizType: d.quizType.trim(),
      questionText: d.questionText.trim(),
      options: d.options.map((o) => o.trim()).filter(Boolean),
      difficultyLevel: d.difficultyLevel,
      answer: d.answer.trim(),
      explanation: d.explanation.trim(),
      class: d.class,
    }));

    const parsed = bulkQuizUploadSchema.safeParse(rows);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const location = issue?.path?.join(".");
      const detail = issue?.message ?? "Invalid data";
      notify(`Question ${location ?? ""} is not ready: ${detail}`);
      return;
    }

    setSubmitting(true);
    try {
      const file = new File([JSON.stringify(rows)], "questions.json", {
        type: "application/json",
      });
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/quiz?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        notify(
          `${rows.length} question(s) submitted for review (pending approval).`
        );
        setDrafts([]);
        setEditingId(null);
      } else {
        notify(json.message || "Failed to submit questions.");
      }
    } catch {
      notify("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Add panel */}
      <section className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-8">
        <div className="flex items-center gap-2.5">
          <PlusCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Add Questions
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {(
            [
              { key: "manual", label: "Add manually" },
              { key: "bulk", label: "Bulk upload" },
            ] as { key: ManualMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                mode === tab.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {mode === "manual" ? (
            <div className="space-y-4">
              <QuestionEditor
                value={manualDraft}
                onChange={(next) => {
                  setManualDraft(next);
                  if (manualError) setManualError(null);
                }}
                typeOptions={typeOptions}
              />
              {manualError ? (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {manualError}
                </p>
              ) : null}
              <Button className="w-full" onClick={handleAddManual}>
                <Check className="mr-2 h-4 w-4" />
                Add to review
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {importing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <FileJson className="h-6 w-6" />
                  )}
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Upload a JSON file of questions
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Questions are loaded into the review panel where you can
                    edit them before submitting.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? "Reading…" : "Choose JSON file"}
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Expected format
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-[11px] leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
{`[
  {
    "quizType": "ENGLISH_TO_BANGLA",
    "questionText": "What is the Bangla of 'apple'?",
    "options": ["আপেল", "কলা", "আম", "কমলা"],
    "difficultyLevel": "EASY",
    "answer": "আপেল",
    "class": [],
    "explanation": ""
  }
]`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Review panel */}
      <section className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Review & submit
            </h2>
            {drafts.length > 0 ? (
              <Badge variant="outline">{drafts.length}</Badge>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <CircleDashed className="h-3.5 w-3.5" />
            Submissions start as pending
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 py-10 text-center dark:border-zinc-700">
            <ClipboardList className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No questions yet. Add a question or upload a file — you can
              review and edit every item here before submitting.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {drafts.map((draft) => {
              const editing = editingId === draft.id;
              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  {editing ? (
                    <div>
                      <QuestionEditor
                        value={draft}
                        onChange={(next) => updateDraft(draft.id, next)}
                        typeOptions={typeOptions}
                      />
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">#{draft.id.slice(-4)}</Badge>
                          <Badge variant="outline">
                            {quizTypeLabel(draft.quizType) || "No type"}
                          </Badge>
                          <Badge
                            className={cn(
                              draft.difficultyLevel === "EASY" &&
                                "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                              draft.difficultyLevel === "MEDIUM" &&
                                "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                              draft.difficultyLevel === "HARD" &&
                                "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                              draft.difficultyLevel === "EASY" ||
                                draft.difficultyLevel === "MEDIUM" ||
                                draft.difficultyLevel === "HARD"
                                ? ""
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            )}
                          >
                            {difficultyLabel(draft.difficultyLevel)}
                          </Badge>
                          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                            <CircleDashed className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit question"
                            onClick={() => setEditingId(draft.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove question"
                            onClick={() => removeDraft(draft.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                        {draft.questionText || "Untitled question"}
                      </p>

                      <ul className="mt-2 space-y-1">
                        {draft.options.map((option, i) => {
                          const isAnswer =
                            option.trim() === draft.answer.trim();
                          return (
                            <li
                              key={i}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                                isAnswer
                                  ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/30"
                                  : "border-zinc-100 dark:border-zinc-800"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
                                  isAnswer
                                    ? "bg-emerald-500 text-white"
                                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                )}
                              >
                                {isAnswer ? (
                                  <Check className="h-2.5 w-2.5" />
                                ) : (
                                  (i + 1)
                                )}
                              </span>
                              <span
                                className={cn(
                                  "truncate",
                                  isAnswer
                                    ? "font-medium text-emerald-800 dark:text-emerald-200"
                                    : "text-zinc-600 dark:text-zinc-300"
                                )}
                              >
                                {option}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      {draft.class.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {draft.class.map((cls) => (
                            <span
                              key={cls}
                              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Button
          className="mt-6 w-full"
          disabled={drafts.length === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {submitting
            ? "Submitting…"
            : `Submit ${drafts.length} question${drafts.length === 1 ? "" : "s"} for review`}
        </Button>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Everything you submit starts as pending and is reviewed by admins.
        </p>
      </section>
    </div>
  );
}

function MySubmissions() {
  const [questions, setQuestions] = useState<MyQuestion[] | null>(null);

  useEffect(() => {
    fetch("/api/v1/quiz/mine")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setQuestions(json.data);
        }
      })
      .catch(() => {
        setQuestions([]);
      });
  }, []);

  return (
    <section className="mt-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 backdrop-blur-sm p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            My submissions
          </h2>
          {questions !== null ? (
            <Badge variant="outline">{questions.length}</Badge>
          ) : null}
        </div>
        <Link
          href="/quiz"
          className="text-sm font-medium text-primary hover:underline"
        >
          Browse quizzes →
        </Link>
      </div>

      {questions === null ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : questions.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          You haven&apos;t submitted any questions yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">#{question.id}</Badge>
                <Badge variant="outline">{quizTypeLabel(question.quizType)}</Badge>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    question.difficultyLevel === "EASY" &&
                      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                    question.difficultyLevel === "MEDIUM" &&
                      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                    question.difficultyLevel === "HARD" &&
                      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                  )}
                >
                  {difficultyLabel(question.difficultyLevel)}
                </span>
                {question.isPending ? (
                  <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <CircleDashed className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {question.questionText}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}