"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BookOpen,
  Loader2,
  FileJson,
  Upload,
  ListChecks,
  CircleDashed,
  Pencil,
  Trash2,
  X,
  Check,
  SquarePen,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
import { MySubmissions } from "./my-submissions";
import { VocabularyContributeFlow } from "./vocabulary-contribute-flow";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const BTN_PRIMARY =
  "shrink-0 gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)] transition-colors";

const BTN_VIOLET =
  "shrink-0 gap-2 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors";

const TILE_ICON =
  "flex h-12 w-12 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]";

const CHIP_PENDING =
  "rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

const CHIP_APPROVED =
  "rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const DIVIDER = "border-b border-black/[0.06] dark:border-white/[0.08]";
const DIVIDER_T = "border-t border-black/[0.06] dark:border-white/[0.08]";

type QuizTypeOption = { value: string; label: string };

type ManualMode = "manual" | "bulk";

function nextDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function questionKey(text: string): string {
  return text.trim().toLowerCase();
}

export function ContributeClient() {
  const [activeType, setActiveType] = useState<"quiz" | "vocabulary">("quiz");

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative px-4 py-10 sm:px-6 lg:px-8">
        <StaggerContainer className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          <StaggerItem>
            <Hero />
          </StaggerItem>
          <StaggerItem>
            <Tabs defaultValue="contribute">
              <TabsList className="h-9 rounded-[10px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
                <TabsTrigger
                  value="contribute"
                  className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white"
                >
                  <SquarePen className="size-4" />
                  Contribute
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white"
                >
                  <ListChecks className="size-4" />
                  My submissions
                </TabsTrigger>
              </TabsList>
              <TabsContent value="contribute">
                <div className="space-y-4 sm:space-y-6">
                  <ContributionTypes
                    active={activeType}
                    onChange={setActiveType}
                  />
                  {activeType === "vocabulary" ? (
                    <VocabularyContributeFlow />
                  ) : (
                    <QuizContributeFlow />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="submissions">
                <MySubmissions />
              </TabsContent>
            </Tabs>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              TILE_ICON,
              "text-orange-500 bg-orange-500/10"
            )}
          >
            <Brain className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Contribute
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Share your knowledge with the Zero English community. Every
              contribution is reviewed by an admin before it goes live.
            </p>
          </div>
        </div>
        <Button asChild className={cn(BTN_VIOLET, "self-start sm:self-auto")}>
          <Link href="/quiz">
            <SquarePen className="size-4" />
            Browse quizzes
          </Link>
        </Button>
      </div>

      <div className={cn("grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.08]")}>
        <HeroStat
          icon={Sparkles}
          label="Submitted"
          value="Questions you shared"
          tint="text-orange-500"
        />
        <HeroStat
          icon={ShieldCheck}
          label="Reviewed"
          value="Approved by admins only"
          tint="text-emerald-500"
        />
        <HeroStat
          icon={CircleDashed}
          label="Pending"
          value="New submissions start pending"
          tint="text-amber-500"
        />
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
      <div className={cn(ICON_CHIP, tint)}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
        <p className="truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function ContributionTypes({
  active,
  onChange,
}: {
  active: "quiz" | "vocabulary";
  onChange: (next: "quiz" | "vocabulary") => void;
}) {
  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2")}>
        <button
          type="button"
          onClick={() => onChange("quiz")}
          className={cn(
            "group flex flex-col gap-3 p-5 sm:p-6 text-left transition-colors",
            "border-l border-t border-black/[0.06] dark:border-white/[0.08]",
            "[&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0",
            active === "quiz"
              ? "bg-orange-500/[0.04] dark:bg-orange-500/[0.08]"
              : "hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
          )}
        >
          <span className="flex items-center gap-4">
            <span
              className={cn(
                TILE_ICON,
                active === "quiz"
                  ? "bg-orange-500 text-white shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)]"
                  : "text-orange-500 bg-orange-500/10"
              )}
            >
              <Brain className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Quiz Questions
                </span>
                <span className={cn(CHIP_APPROVED, "px-2 py-0.5 text-[11px] font-semibold")}>
                  Active
                </span>
              </span>
              <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                Grammar, vocabulary and comprehension questions.
              </span>
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("vocabulary")}
          className={cn(
            "group flex flex-col gap-3 p-5 sm:p-6 text-left transition-colors",
            "border-l border-t border-black/[0.06] dark:border-white/[0.08]",
            "[&:nth-child(odd)]:border-l-0 [&:nth-child(-n+2)]:border-t-0",
            active === "vocabulary"
              ? "bg-violet-500/[0.04] dark:bg-violet-500/[0.08]"
              : "hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
          )}
        >
          <span className="flex items-center gap-4">
            <span
              className={cn(
                TILE_ICON,
                active === "vocabulary"
                  ? "bg-violet-500 text-white shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)]"
                  : "text-violet-500 bg-violet-500/10"
              )}
            >
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Vocabulary
                </span>
                <span className={cn(CHIP_APPROVED, "px-2 py-0.5 text-[11px] font-semibold")}>
                  Active
                </span>
              </span>
              <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                Add new words with meanings, examples and more.
              </span>
            </span>
          </span>
        </button>
      </div>
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
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Review panel */}
      <section
        className={cn(CARD, "overflow-hidden self-start lg:sticky lg:top-6")}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 p-5 sm:px-6 sm:py-5",
            DIVIDER
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(ICON_CHIP, "text-emerald-500 bg-emerald-500/10")}>
              <ListChecks className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Review & submit
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Edit every item before it ships
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {drafts.length > 0 ? (
              <span
                className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
              >
                {drafts.length} queued
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <CircleDashed className="h-3 w-3" />
              Starts pending
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-black/[0.08] py-12 text-center dark:border-white/[0.1]">
              <span className={cn(ICON_CHIP, "h-12 w-12 rounded-[14px] text-zinc-400")}>
                <ListChecks className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Nothing to review yet
                </p>
                <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Add questions or upload a file on the right — every item lands
                  here for review before you submit.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {drafts.map((draft) => {
                const editing = editingId === draft.id;
                return (
                  <div key={draft.id} className="py-4 first:pt-0 last:pb-0">
                    {editing ? (
                      <div className="space-y-3">
                        <QuestionEditor
                          value={draft}
                          onChange={(next) => updateDraft(draft.id, next)}
                          typeOptions={typeOptions}
                        />
                        <div className="flex items-center justify-end">
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
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                              #{draft.id.slice(-4)}
                            </span>
                            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                              {quizTypeLabel(draft.quizType) || "No type"}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                DIFFICULTY_CHIP[draft.difficultyLevel] ??
                                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              )}
                            >
                              {difficultyLabel(draft.difficultyLevel)}
                            </span>
                            <span
                              className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
                            >
                              Pending
                            </span>
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
                                    i + 1
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

                        <div className="mt-2 grid gap-1.5">

                          <div className="flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs dark:border-zinc-800">
                            <span className="mt-px text-zinc-400 dark:text-zinc-500">
                              Expl.
                            </span>
                            <p className="min-w-0 leading-relaxed text-zinc-600 dark:text-zinc-300">
                              {draft.explanation.trim()
                                ? draft.explanation
                                : "No explanation provided"}
                            </p>
                          </div>
                        </div>

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
        </div>

        <div className={cn("p-5 sm:px-6 sm:py-5", DIVIDER_T)}>
          <Button
            className={cn(BTN_PRIMARY, "w-full")}
            disabled={drafts.length === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {submitting
              ? "Submitting…"
              : `Submit ${drafts.length} question${drafts.length === 1 ? "" : "s"} for review`}
          </Button>
          <p className="mt-2.5 text-center text-xs text-zinc-400">
            Everything you submit starts as pending and is reviewed by admins.
          </p>
        </div>
      </section>

      {/* Add panel */}
      <section
        className={cn(CARD, "overflow-hidden self-start lg:sticky lg:top-6")}
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6 sm:py-5",
            DIVIDER
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(ICON_CHIP, "text-orange-500 bg-orange-500/10")}>
              <SquarePen className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Add Questions
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Compose or upload in bulk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[10px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
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
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === tab.key
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
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
              <Button
                className={cn(BTN_VIOLET, "w-full")}
                onClick={handleAddManual}
              >
                <Check className="size-4" />
                Add to review
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-black/[0.1] bg-black/[0.02] p-8 text-center dark:border-white/[0.12] dark:bg-white/[0.03]">
                <span className={cn(TILE_ICON, "text-orange-500 bg-orange-500/10")}>
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

              <div className="mt-4 rounded-xl border border-black/[0.06] p-4 dark:border-white/[0.08]">
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
    </div>
  );
}