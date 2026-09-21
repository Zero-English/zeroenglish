"use client";

import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BookOpen,
  Loader2,
  FileJson,
  Upload,
  ListChecks,
  Pencil,
  Trash2,
  X,
  Check,
  SquarePen,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/components/language-provider";
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
  DRAFT_ERROR_I18N,
} from "./question-editor";
import {
  type DraftQuestion,
  quizTypeI18n,
  difficultyI18n,
} from "./types";
import { MySubmissions } from "./my-submissions";
import { VocabularyContributeFlow } from "./vocabulary-contribute-flow";
import { ReviewPanelCard, MobileQueueBar } from "./review-panel";
import { ModeSwitch, SubmitButton, type ManualMode } from "./shared";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const BTN_VIOLET =
  "shrink-0 gap-2 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors";

const TILE_ICON =
  "flex h-12 w-12 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]";

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const CHIP_PENDING =
  "rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

const DIVIDER = "border-b border-black/[0.06] dark:border-white/[0.08]";

type QuizTypeOption = { value: string; label: string };

function nextDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function questionKey(text: string): string {
  return text.trim().toLowerCase();
}

export function ContributeClient() {
  const [activeType, setActiveType] = useState<"quiz" | "vocabulary">("quiz");
  const t = useT();

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
                  {t("অবদান", "Contribute")}
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white"
                >
                  <ListChecks className="size-4" />
                  {t("আমার সাবমিশন", "My submissions")}
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
  const t = useT();
  const steps = [
    {
      title: t("যোগ করুন", "Add"),
      body: t(
        "প্রশ্ন একে একে লিখুন বা ফাইল দিয়ে বাল্কে আপলোড করুন।",
        "Compose items one by one or upload a file in bulk."
      ),
      tint: "text-orange-500 bg-orange-500/10",
      icon: SquarePen,
    },
    {
      title: t("পর্যালোচনা করুন", "Review"),
      body: t(
        "প্রতিটি আইটেম আপনার তালিকায় আসবে; সেখানেই সম্পাদনা করতে পারবেন।",
        "Every item lands in your queue where you can edit it."
      ),
      tint: "text-violet-500 bg-violet-500/10",
      icon: ListChecks,
    },
    {
      title: t("জমা দিন", "Submit"),
      body: t(
        "অপেক্ষমাণ হিসেবে পাঠানো হয় — অনুমোদনের আগে এডমিনরা যাচাই করেন।",
        "Ships as pending — admins approve before it goes live."
      ),
      tint: "text-emerald-500 bg-emerald-500/10",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <span className={cn(TILE_ICON, "text-orange-500 bg-orange-500/10")}>
            <Brain className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("অবদান", "Contribute")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t(
                "Zero English কমিউনিটির সাথে আপনার জ্ঞান ভাগ করুন। প্রতিটি অবদান অনুমোদনের আগে একজন এডমিনের মাধ্যমে যাচাই হয়।",
                "Share your knowledge with the Zero English community. Every contribution is reviewed by an admin before it goes live."
              )}
            </p>
          </div>
        </div>
        <Button asChild className={cn(BTN_VIOLET, "self-start sm:self-auto")}>
          <Link href="/quiz">
            <SquarePen className="size-4" />
            {t("কুইজ ব্রাউজ করুন", "Browse quizzes")}
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-3",
          "divide-y divide-black/[0.06] sm:divide-x sm:divide-y-0 dark:divide-white/[0.08]"
        )}
      >
        {steps.map(({ title, body, tint, icon: Icon }, index) => (
          <div key={title} className="flex items-start gap-3 px-5 py-4 sm:px-6">
            <span className={cn(TILE_ICON, "h-11 w-11", tint)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                  0{index + 1}
                </span>
                {title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {body}
              </p>
            </div>
          </div>
        ))}
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
  const t = useT();
  const options = [
    {
      key: "quiz" as const,
      icon: Brain,
      title: t("কুইজ প্রশ্ন", "Quiz Questions"),
      desc: t(
        "ব্যাকরণ, শব্দভাণ্ডার ও comprehension প্রশ্ন।",
        "Grammar, vocabulary and comprehension questions."
      ),
      activeTile:
        "bg-orange-500 text-white shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)]",
      inactiveTile: "text-orange-500 bg-orange-500/10",
      activeBg: "bg-orange-500/[0.04] dark:bg-orange-500/[0.08]",
      radioActive: "border-orange-500 bg-orange-500 text-white",
    },
    {
      key: "vocabulary" as const,
      icon: BookOpen,
      title: t("শব্দভাণ্ডার", "Vocabulary"),
      desc: t(
        "অর্থ, উদাহরণ ও আরও অনেক তথ্যসহ নতুন শব্দ যোগ করুন।",
        "Add new words with meanings, examples and more."
      ),
      activeTile:
        "bg-violet-500 text-white shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)]",
      inactiveTile: "text-violet-500 bg-violet-500/10",
      activeBg: "bg-violet-500/[0.04] dark:bg-violet-500/[0.08]",
      radioActive: "border-violet-500 bg-violet-500 text-white",
    },
  ];

  return (
    <div className={cn(CARD, "p-2.5 sm:p-3")}>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map(
          ({
            key,
            icon: Icon,
            title,
            desc,
            activeTile,
            inactiveTile,
            activeBg,
            radioActive,
          }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                aria-pressed={isActive}
                className={cn(
                  "group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5",
                  isActive
                    ? cn(
                        "border-black/[0.08] ring-1 ring-inset ring-black/[0.06] dark:border-white/[0.12] dark:ring-white/[0.1]",
                        activeBg
                      )
                    : "border-transparent hover:border-black/[0.06] hover:bg-black/[0.02] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.04]"
                )}
              >
                <span
                  className={cn(
                    TILE_ICON,
                    "h-11 w-11",
                    isActive ? activeTile : inactiveTile
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                    {desc}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isActive
                      ? radioActive
                      : "border-zinc-300 dark:border-zinc-600"
                  )}
                >
                  {isActive ? <Check className="h-3 w-3" /> : null}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function QuizContributeFlow() {
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [typeOptions, setTypeOptions] = useState<QuizTypeOption[]>([]);
  const [manualDraft, setManualDraft] = useState<DraftQuestion>(() =>
    emptyDraft()
  );
  const [manualError, setManualError] = useState<string | null>(null);
  const [mode, setMode] = useState<ManualMode>("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const notify = (message: string) => toast(message);

  useEffect(() => {
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length) {
          setTypeOptions(
            json.data.map((t: { id: number; name: string }) => ({
              value: t.name,
              label: quizTypeI18n(t.name)[1],
            }))
          );
        }
      })
      .catch(() => {});
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
      setManualError(t(...DRAFT_ERROR_I18N[error]));
      return;
    }
    const key = questionKey(manualDraft.questionText);
    if (drafts.some((d) => questionKey(d.questionText) === key)) {
      setManualError(
        t(
          "এই প্রশ্নের লেখা আপনার পর্যালোচনা তালিকায় ইতিমধ্যেই আছে। দুবার যোগ না করে সেখানেই সম্পাদনা করুন।",
          "This question text is already in your review list. Edit it there instead of adding it twice."
        )
      );
      return;
    }
    addDraft(manualDraft);
    setManualDraft(emptyDraft());
    setManualError(null);
    setMode("manual");
    notify(t("প্রশ্ন পর্যালোচনায় যোগ হয়েছে।", "Question added to review."));
  }

  async function handleBulkFile(file: File) {
    setImporting(true);
    try {
      if (!file.name.toLowerCase().endsWith(".json")) {
        notify(t("শুধুমাত্র .json ফাইল অনুমোদিত।", "Only .json files are allowed."));
        return;
      }
      const text = await file.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        notify(
          t(
            "JSON সঠিক নয়। ফাইলের সিনট্যাক্স পরীক্ষা করুন।",
            "Invalid JSON. Please check the file syntax."
          )
        );
        return;
      }

      const parsed = bulkQuizUploadSchema.safeParse(body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const location = issue?.path?.join(".");
        const detail = issue?.message ?? "Invalid data";
        notify(
          t(
            `"${location ?? "row"}"-এ যাচাই ব্যর্থ: ${detail}`,
            `Validation failed at "${location ?? "row"}": ${detail}`
          )
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
          t(
            `${added.length}টি প্রশ্ন ফাইল থেকে লোড হয়েছে। পর্যালোচনা করে জমা দিন।`,
            `${added.length} question${added.length === 1 ? "" : "s"} loaded from the file. Review and submit.`
          )
        );
      }
      if (skipped.length > 0) {
        notify(
          t(
            `${skipped.length}টি ডুপ্লিকেট প্রশ্নের লেখা বাদ দেওয়া হয়েছে: ${skipped
              .slice(0, 3)
              .map((q) => `"${q}"`)
              .join(", ")}${skipped.length > 3 ? "…" : ""}`,
            `${skipped.length} duplicate question text${skipped.length === 1 ? "" : "s"} skipped: ${skipped
              .slice(0, 3)
              .map((q) => `"${q}"`)
              .join(", ")}${skipped.length > 3 ? "…" : ""}`
          )
        );
      }
    } catch {
      notify(
        t(
          "ফাইল পড়া ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
          "Failed to read the file. Please try again."
        )
      );
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
          t(
            `আপনার তালিকায় ডুপ্লিকেট প্রশ্ন: "${d.questionText.trim()}"। জমা দেওয়ার আগে প্রতিটি প্রশ্ন একক করুন।`,
            `Duplicate question text in your list: "${d.questionText.trim()}". Make each question unique before submitting.`
          )
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
      notify(
        t(
          `প্রশ্ন ${location ?? ""} প্রস্তুত নয়: ${detail}`,
          `Question ${location ?? ""} is not ready: ${detail}`
        )
      );
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
      setQueueOpen(false);
      if (json.success) {
        notify(
          t(
            `${rows.length}টি প্রশ্ন পর্যালোচনার জন্য জমা দেওয়া হয়েছে (অনুমোদন অপেক্ষমাণ)।`,
            `${rows.length} question${rows.length === 1 ? "" : "s"} submitted for review (pending approval).`
          )
        );
        setDrafts([]);
        setEditingId(null);
      } else {
        notify(
          t(
            "প্রশ্ন জমা দিতে ব্যর্থ হয়েছে।",
            "Failed to submit questions."
          )
        );
      }
    } catch {
      notify(
        t("জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন。", "Failed to submit. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderReview(className?: string) {
    const pendingLabel = t("অপেক্ষমাণ", "Pending");
    return (
      <ReviewPanelCard
        icon={ListChecks}
        iconClassName="text-emerald-500 bg-emerald-500/10"
        title={t("পর্যালোচনা ও জমা দিন", "Review & submit")}
        subtitle={t(
          "জমা দেওয়ার আগে প্রতিটি আইটেম সম্পাদনা করুন",
          "Edit every item before it ships"
        )}
        count={drafts.length}
        emptyTitle={t("এখনো পর্যালোচনা করার কিছু নেই", "Nothing to review yet")}
        emptyBody={t(
          "প্রশ্ন যোগ করুন বা ফাইল আপলোড করুন — জমা দেওয়ার আগে প্রতিটি আইটেম এখানে পর্যালোচনার জন্য আসবে।",
          "Add questions or upload a file — every item lands here for review before you submit."
        )}
        className={className}
        footer={
          <SubmitButton
            count={drafts.length}
            nounBn="প্রশ্ন"
            nounEn="question"
            note={t(
              "আপনার জমা দেওয়া সব কিছু অপেক্ষমাণ অবস্থায় শুরু হয় এবং এডমিনরা যাচাই করেন।",
              "Everything you submit starts as pending and is reviewed by admins."
            )}
            submitting={submitting}
            onClick={handleSubmit}
          />
        }
      >
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
                      defaultOptionalOpen
                    />
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        {t("সম্পন্ন", "Done")}
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
                          {t(...quizTypeI18n(draft.quizType)) ||
                            t("কোনো ধরন নেই", "No type")}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            DIFFICULTY_CHIP[draft.difficultyLevel] ??
                              "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          )}
                        >
                          {t(...difficultyI18n(draft.difficultyLevel))}
                        </span>
                        <span
                          className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
                        >
                          {pendingLabel}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("প্রশ্ন সম্পাদনা করুন", "Edit question")}
                          onClick={() => setEditingId(draft.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("প্রশ্ন মুছুন", "Remove question")}
                          onClick={() => removeDraft(draft.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                      {draft.questionText || t("অনামী প্রশ্ন", "Untitled question")}
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

                    {draft.explanation.trim() ? (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-black/[0.06] px-2.5 py-1.5 text-xs dark:border-white/[0.08]">
                        <span className="mt-px text-zinc-400 dark:text-zinc-500">
                          {t("ব্যাখ্যা", "Expl.")}
                        </span>
                        <p className="min-w-0 leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {draft.explanation}
                        </p>
                      </div>
                    ) : null}

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
      </ReviewPanelCard>
    );
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
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
                  {t("প্রশ্ন যোগ করুন", "Add Questions")}
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {t("হাতে লিখুন বা বাল্কে আপলোড করুন", "Compose or upload in bulk")}
                </p>
              </div>
            </div>
            <ModeSwitch mode={mode} onChange={setMode} />
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
                  {t("পর্যালোচনায় যোগ করুন", "Add to review")}
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
                      {t("প্রশ্নের JSON ফাইল আপলোড করুন", "Upload a JSON file of questions")}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t(
                        "প্রশ্নগুলো পর্যালোচনা প্যানেলে লোড হবে, যেখানে আপনি জমা দেওয়ার আগে সেগুলো সম্পাদনা করতে পারবেন।",
                        "Questions are loaded into the review panel where you can edit them before submitting."
                      )}
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
                    {importing
                      ? t("পড়া হচ্ছে…", "Reading…")
                      : t("JSON ফাইল বেছে নিন", "Choose JSON file")}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border border-black/[0.06] p-4 dark:border-white/[0.08]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {t("প্রত্যাশিত ফরম্যাট", "Expected format")}
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

        {/* Review & submit */}
        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-6">{renderReview()}</div>
        </div>
      </div>

      <MobileQueueBar
        label={
          drafts.length > 0
            ? t(
                `পর্যালোচনা করুন ${drafts.length}টি প্রশ্ন`,
                `Review ${drafts.length} question${drafts.length === 1 ? "" : "s"} for approval`
              )
            : ""
        }
        count={drafts.length}
        open={queueOpen}
        onOpenChange={setQueueOpen}
      >
        {renderReview("flex-1 min-h-0")}
      </MobileQueueBar>
    </div>
  );
}