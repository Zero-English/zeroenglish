"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/language-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  QuestionEditor,
  validateDraft,
  DRAFT_ERROR_I18N,
} from "./question-editor";
import {
  WordEditor,
  validateWordDraft,
  WORD_DRAFT_ERROR_I18N,
} from "./word-editor";
import {
  type DraftQuestion,
  type DraftWord,
  type DifficultyLevelValue,
  type WordLevelValue,
  quizTypeI18n,
  difficultyI18n,
  levelI18n,
  posI18n,
} from "./types";
import type { MyItem } from "./my-submissions";

const CHIP_NEUTRAL =
  "rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300";

const CHIP_SOFT =
  "rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400";

const CHIP_PENDING =
  "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

const CHIP_APPROVED =
  "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";

const DIFFICULTY_CHIP: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

type QuizTypeOption = { value: string; label: string };

function toDraft(item: MyItem): DraftQuestion | DraftWord {
  if (item.kind === "question") {
    return {
      id: String(item.id),
      quizType: item.quizType,
      questionText: item.questionText,
      options: item.options.length ? item.options : ["", ""],
      difficultyLevel: item.difficultyLevel as DifficultyLevelValue,
      answer: item.answer,
      explanation: item.explanation ?? "",
      class: item.class ?? [],
    };
  }
  return {
    id: String(item.id),
    word: item.word,
    meaningBn: item.meaningBn.length ? item.meaningBn : [""],
    definitionEn: item.definitionEn ?? "",
    definitionBn: item.definitionBn ?? "",
    examplesEn: item.examplesEn ?? [],
    examplesBn: item.examplesBn ?? [],
    synonyms: item.synonyms ?? [],
    antonyms: item.antonyms ?? [],
    level: item.level as WordLevelValue,
    category: item.category,
    wordType: item.wordType ?? [],
  };
}

function buildPayload(draft: DraftQuestion | DraftWord, kind: MyItem["kind"]) {
  if (kind === "question") {
    const d = draft as DraftQuestion;
    return {
      quizType: d.quizType.trim(),
      questionText: d.questionText.trim(),
      options: d.options.map((o) => o.trim()).filter(Boolean),
      difficultyLevel: d.difficultyLevel,
      answer: d.answer.trim(),
      explanation: d.explanation.trim(),
      class: d.class,
    };
  }
  const d = draft as DraftWord;
  return {
    word: d.word.trim(),
    meaningBn: d.meaningBn.map((m) => m.trim()).filter(Boolean),
    synonyms: d.synonyms.map((s) => s.trim()).filter(Boolean),
    antonyms: d.antonyms.map((a) => a.trim()).filter(Boolean),
    definitionEn: d.definitionEn.trim(),
    definitionBn: d.definitionBn.trim(),
    examplesEn: d.examplesEn.map((e) => e.trim()).filter(Boolean),
    examplesBn: d.examplesBn.map((e) => e.trim()).filter(Boolean),
    level: d.level,
    category: d.category.trim() || "Oxford5000",
    wordType: d.wordType.map((x) => x.trim()).filter(Boolean),
  };
}

function toUpdatedItem(item: MyItem, draft: DraftQuestion | DraftWord): MyItem {
  if (item.kind === "question") {
    const d = draft as DraftQuestion;
    return {
      kind: "question",
      id: item.id,
      quizType: d.quizType,
      questionText: d.questionText,
      options: d.options.map((o) => o.trim()).filter(Boolean),
      difficultyLevel: d.difficultyLevel,
      answer: d.answer.trim(),
      explanation: d.explanation.trim(),
      class: d.class,
      isPending: true,
    };
  }
  const d = draft as DraftWord;
  return {
    kind: "word",
    id: item.id,
    word: d.word,
    meaningBn: d.meaningBn.map((m) => m.trim()).filter(Boolean),
    synonyms: d.synonyms.map((s) => s.trim()).filter(Boolean),
    antonyms: d.antonyms.map((a) => a.trim()).filter(Boolean),
    definitionEn: d.definitionEn.trim(),
    definitionBn: d.definitionBn.trim(),
    examplesEn: d.examplesEn,
    examplesBn: d.examplesBn,
    level: d.level,
    category: d.category,
    wordType: d.wordType,
    isPending: true,
  };
}

export function SubmissionDialog({
  item,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: {
  item: MyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: MyItem) => void;
  onDeleted: (id: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {item ? (
        <SubmissionDialogContent
          key={`${item.kind}-${item.id}`}
          item={item}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      ) : null}
    </Dialog>
  );
}

function SubmissionDialogContent({
  item,
  onOpenChange,
  onSaved,
  onDeleted,
}: {
  item: MyItem;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: MyItem) => void;
  onDeleted: (id: number) => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftQuestion | DraftWord>(() =>
    toDraft(item)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState<QuizTypeOption[]>([]);

  useEffect(() => {
    if (item.kind !== "question" || typeOptions.length > 0) return;
    fetch("/api/v1/quiz-type")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length) {
          setTypeOptions(
            json.data.map((qt: { id: number; name: string }) => ({
              value: qt.name,
              label: quizTypeI18n(qt.name)[1],
            }))
          );
        }
      })
      .catch(() => {});
  }, [item.kind, typeOptions.length]);

  async function handleSave() {
    const kind = item.kind;
    let errorPair: [string, string] | null = null;
    if (kind === "question") {
      const validationError = validateDraft(draft as DraftQuestion);
      if (validationError) errorPair = DRAFT_ERROR_I18N[validationError];
    } else {
      const validationError = validateWordDraft(draft as DraftWord);
      if (validationError) errorPair = WORD_DRAFT_ERROR_I18N[validationError];
    }

    if (errorPair) {
      setError(t(...errorPair));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/${kind === "question" ? "quiz" : "words"}/mine/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(draft, kind)),
        }
      );
      const json = await res.json();
      if (json.success) {
        toast(
          t(
            "আপডেট হয়েছে — পুনরায় অনুমোদনের অপেক্ষমাণ।",
            "Updated — pending approval again."
          )
        );
        onSaved(toUpdatedItem(item, draft));
        onOpenChange(false);
      } else {
        toast(
          json.message || t("আপডেট ব্যর্থ হয়েছে।", "Failed to update the item.")
        );
      }
    } catch {
      toast(
        t(
          "আপডেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
          "Failed to update. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const kind = item.kind;
    try {
      const res = await fetch(
        `/api/v1/${kind === "question" ? "quiz" : "words"}/mine/${item.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        toast(t("আইটেমটি মুছে ফেলা হয়েছে।", "Item deleted."));
        onDeleted(item.id);
        onOpenChange(false);
      } else {
        toast(
          json.message ||
            t("মুছে ফেলা ব্যর্থ হয়েছে।", "Failed to delete the item.")
        );
      }
    } catch {
      toast(
        t(
          "মুছে ফেলা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
          "Failed to delete. Please try again."
        )
      );
    }
  }

  return (
    <>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 pr-11 dark:border-white/[0.08]">
          <div>
            <DialogTitle>
              {item.kind === "question"
                ? t(`প্রশ্ন #${item.id}`, `Question #${item.id}`)
                : t(`শব্দ #${item.id}`, `Word #${item.id}`)}
            </DialogTitle>
            <DialogDescription className="mt-0.5">
              {item.kind === "question"
                ? t("আপনার জমা দেওয়া কুইজ প্রশ্ন", "Your submitted quiz question")
                : t("আপনার জমা দেওয়া শব্দ", "Your submitted word")}
            </DialogDescription>
          </div>
          {item.isPending ? (
            <span className={CHIP_PENDING}>{t("অপেক্ষমাণ", "Pending")}</span>
          ) : (
            <span className={CHIP_APPROVED}>{t("অনুমোদিত", "Approved")}</span>
          )}
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-5 py-5">
          {editing ? (
            <div className="space-y-4">
              {item.kind === "question" ? (
                <QuestionEditor
                  value={draft as DraftQuestion}
                  onChange={(next) => {
                    setDraft(next);
                    if (error) setError(null);
                  }}
                  typeOptions={typeOptions}
                  defaultOptionalOpen={Boolean(
                    (draft as DraftQuestion).class.length ||
                      (draft as DraftQuestion).explanation.trim()
                  )}
                />
              ) : (
                <WordEditor
                  value={draft as DraftWord}
                  onChange={(next) => {
                    setDraft(next);
                    if (error) setError(null);
                  }}
                  defaultOptionalOpen={Boolean(
                    (draft as DraftWord).examplesEn.length ||
                      (draft as DraftWord).examplesBn.length ||
                      (draft as DraftWord).synonyms.length ||
                      (draft as DraftWord).antonyms.length
                  )}
                />
              )}
              {error ? (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              ) : null}
            </div>
          ) : item.kind === "question" ? (
            <QuestionSummary item={item} />
          ) : (
            <WordSummary item={item} />
          )}
        </div>

        <DialogFooter className="border-t border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {editing
                ? t(
                    "পরিবর্তনগুলো সংরক্ষণ করলে আইটেমটি পুনরায় অপেক্ষমাণ হবে।",
                    "Saving changes sets this item back to pending approval."
                  )
                : item.isPending
                  ? t(
                      "সম্পাদনা করলে আইটেমটি পুনরায় অপেক্ষমাণ হবে এবং আবার অনুমোদন লাগবে।",
                      "Editing sets this item back to pending approval."
                    )
                  : t(
                      "অনুমোদিত আইটেম সম্পাদনা বা মুছে ফেলা যাবে না।",
                      "Approved submissions can't be edited or deleted."
                    )}
            </p>
            {editing ? (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  {t("বাতিল", "Cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? t("সেভ হচ্ছে…", "Saving…") : t("সেভ করুন", "Save")}
                </Button>
              </div>
            ) : item.isPending ? (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(true);
                    setError(null);
                  }}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  {t("সম্পাদনা করুন", "Edit")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  {t("মুছুন", "Delete")}
                </Button>
              </div>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("আপনি কি নিশ্চিত?", "Are you sure?")}
        description={t(
          "এই আইটেমটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি ফেরানো যাবে না।",
          "This item will be permanently deleted. This action cannot be undone."
        )}
        confirmText={t("মুছে ফেলুন", "Delete")}
        cancelText={t("বাতিল", "Cancel")}
        onConfirm={handleDelete}
      />
    </>
  );
}

function QuestionSummary({
  item,
}: {
  item: Extract<MyItem, { kind: "question" }>;
}) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={CHIP_SOFT}>#{item.id}</span>
        <span className={CHIP_NEUTRAL}>{t(...quizTypeI18n(item.quizType))}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            DIFFICULTY_CHIP[item.difficultyLevel] ??
              "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
        >
          {t(...difficultyI18n(item.difficultyLevel))}
        </span>
        {item.isPending ? (
          <span className={CHIP_PENDING}>{t("অপেক্ষমাণ", "Pending")}</span>
        ) : (
          <span className={CHIP_APPROVED}>{t("অনুমোদিত", "Approved")}</span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          {t("প্রশ্ন", "Question")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
          {item.questionText || t("অনামী প্রশ্ন", "Untitled question")}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          {t("অপশনসমূহ", "Options")}
        </p>
        <ul className="mt-1.5 space-y-1">
          {item.options.map((option, i) => {
            const isAnswer = option.trim() === item.answer.trim();
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
                  {isAnswer ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "min-w-0",
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
      </div>

      {item.explanation?.trim() ? (
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            {t("ব্যাখ্যা", "Explanation")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {item.explanation}
          </p>
        </div>
      ) : null}

      {item.class && item.class.length > 0 ? (
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            {t("শ্রেণি", "Classes")}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.class.map((cls) => (
              <span key={cls} className={CHIP_SOFT}>
                {cls}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WordSummary({ item }: { item: Extract<MyItem, { kind: "word" }> }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={CHIP_SOFT}>#{item.id}</span>
        <span className={CHIP_NEUTRAL}>{t(...levelI18n(item.level))}</span>
        <span className={CHIP_NEUTRAL}>{item.category}</span>
        {item.wordType.map((pos) => (
          <span key={pos} className={CHIP_NEUTRAL}>
            {t(...posI18n(pos))}
          </span>
        ))}
        {item.isPending ? (
          <span className={CHIP_PENDING}>{t("অপেক্ষমাণ", "Pending")}</span>
        ) : (
          <span className={CHIP_APPROVED}>{t("অনুমোদিত", "Approved")}</span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          {t("শব্দ", "Word")}
        </p>
        <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {item.word || t("অনামী শব্দ", "Untitled word")}
        </p>
      </div>

      {item.meaningBn.length > 0 ? (
        <Section title={t("অর্থ (বাংলা)", "Meaning (Bangla)")}>
          {item.meaningBn.join(", ")}
        </Section>
      ) : null}
      {item.definitionEn.trim() ? (
        <Section title={t("সংজ্ঞা (ইংরেজি)", "Definition (English)")}>
          {item.definitionEn}
        </Section>
      ) : null}
      {item.definitionBn.trim() ? (
        <Section title={t("সংজ্ঞা (বাংলা)", "Definition (Bangla)")}>
          {item.definitionBn}
        </Section>
      ) : null}
      {item.synonyms.length > 0 ? (
        <Section title={t("সমার্থক শব্দ", "Synonyms")}>
          {item.synonyms.join(", ")}
        </Section>
      ) : null}
      {item.antonyms.length > 0 ? (
        <Section title={t("বিপরীত শব্দ", "Antonyms")}>
          {item.antonyms.join(", ")}
        </Section>
      ) : null}
      {item.examplesEn.length > 0 ? (
        <Section title={t("উদাহরণ (ইংরেজি)", "Examples (English)")}>
          <ul className="list-disc space-y-0.5 pl-4">
            {item.examplesEn.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {item.examplesBn.length > 0 ? (
        <Section title={t("উদাহরণ (বাংলা)", "Examples (Bangla)")}>
          <ul className="list-disc space-y-0.5 pl-4">
            {item.examplesBn.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </p>
    </div>
  );
}