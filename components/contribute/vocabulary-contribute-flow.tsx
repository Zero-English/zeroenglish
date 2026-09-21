"use client";

import { useRef, useState } from "react";
import {
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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { wordsArraySchema } from "@/utils/validation/zod";
import {
  WordEditor,
  emptyWordDraft,
  validateWordDraft,
} from "./word-editor";
import { type DraftWord, levelLabel } from "./types";

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

const TILE_ICON =
  "flex h-12 w-12 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(16,24,40,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_-2px_rgba(0,0,0,0.5)]";

const BTN_PRIMARY =
  "shrink-0 gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)] transition-colors";

const BTN_VIOLET =
  "shrink-0 gap-2 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white px-5 h-10 text-sm font-medium shadow-[0_1px_2px_rgba(139,92,246,0.3),0_4px_12px_-4px_rgba(139,92,246,0.35)] transition-colors";

const CHIP_PENDING =
  "rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

const DIVIDER = "border-b border-black/[0.06] dark:border-white/[0.08]";
const DIVIDER_T = "border-t border-black/[0.06] dark:border-white/[0.08]";

type ManualMode = "manual" | "bulk";

function wordKey(word: string): string {
  return word.trim().toLowerCase();
}

export function VocabularyContributeFlow() {
  const [drafts, setDrafts] = useState<DraftWord[]>([]);
  const [manualDraft, setManualDraft] = useState<DraftWord>(() =>
    emptyWordDraft()
  );
  const [manualError, setManualError] = useState<string | null>(null);
  const [mode, setMode] = useState<ManualMode>("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (message: string) => toast(message);

  function addDraft(draft: DraftWord) {
    setDrafts((prev) => [...prev, { ...draft, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]);
    setEditingId(null);
  }

  function updateDraft(id: string, patch: Partial<DraftWord>) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setEditingId((cur) => (cur === id ? null : cur));
  }

  function handleAddManual() {
    const error = validateWordDraft(manualDraft);
    if (error) {
      setManualError(error);
      return;
    }
    const key = wordKey(manualDraft.word);
    if (drafts.some((d) => wordKey(d.word) === key)) {
      setManualError(
        "This word is already in your review list. Edit it there instead of adding it twice."
      );
      return;
    }
    addDraft(manualDraft);
    setManualDraft(emptyWordDraft());
    setManualError(null);
    setMode("manual");
    notify("Word added to review.");
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

      const parsed = wordsArraySchema.safeParse(body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const location = issue?.path?.join(".");
        const detail = issue?.message ?? "Invalid data";
        notify(`Validation failed at "${location ?? "row"}": ${detail}`);
        return;
      }

      const rows = parsed.data.map((row) =>
        emptyWordDraft({
          word: row.word,
          meaningBn: [...row.meaningBn],
          synonyms: [...row.synonyms],
          antonyms: [...row.antonyms],
          definitionEn: row.definitionEn,
          definitionBn: row.definitionBn,
          examplesEn: [...row.examplesEn],
          examplesBn: [...row.examplesBn],
          level: row.level,
          category: row.category,
          wordType: [...row.wordType],
        })
      );

      const existingKeys = new Set(drafts.map((d) => wordKey(d.word)));
      const added: DraftWord[] = [];
      const skipped: string[] = [];
      for (const row of rows) {
        const key = wordKey(row.word);
        if (existingKeys.has(key)) {
          skipped.push(row.word);
          continue;
        }
        existingKeys.add(key);
        added.push(row);
      }

      if (added.length > 0) {
        setDrafts((prev) => [...prev, ...added]);
        notify(`${added.length} word(s) loaded from the file. Review and submit.`);
      }
      if (skipped.length > 0) {
        notify(
          `${skipped.length} duplicate word(s) skipped: ${skipped
            .slice(0, 3)
            .map((w) => `"${w}"`)
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
      const key = wordKey(d.word);
      if (seen.has(key)) {
        notify(`Duplicate word in your list: "${d.word.trim()}". Make each word unique before submitting.`);
        return;
      }
      seen.add(key);
    }

    const rows = drafts.map((d) => ({
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
      wordType: d.wordType.map((t) => t.trim()).filter(Boolean),
    }));

    const parsed = wordsArraySchema.safeParse(rows);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const location = issue?.path?.join(".");
      const detail = issue?.message ?? "Invalid data";
      notify(`Word ${location ?? ""} is not ready: ${detail}`);
      return;
    }

    setSubmitting(true);
    try {
      const file = new File([JSON.stringify(rows)], "words.json", {
        type: "application/json",
      });
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/words?bulk=true", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        notify(
          `${rows.length} word(s) submitted for review (pending approval).`
        );
        setDrafts([]);
        setEditingId(null);
      } else {
        notify(json.message || "Failed to submit words.");
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
      <section className={cn(CARD, "overflow-hidden self-start lg:sticky lg:top-6")}>
        <div className={cn("flex items-center justify-between gap-3 p-5 sm:px-6 sm:py-5", DIVIDER)}>
          <div className="flex items-center gap-3">
            <div className={cn(ICON_CHIP, "text-emerald-500 bg-emerald-500/10")}>
              <ListChecks className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Review & submit
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Edit every word before it ships
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {drafts.length > 0 ? (
              <span className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}>
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
                  Add words or upload a file on the right — every word lands
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
                        <WordEditor
                          value={draft}
                          onChange={(next) => updateDraft(draft.id, next)}
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
                              {levelLabel(draft.level)}
                            </span>
                            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                              {draft.category || "No category"}
                            </span>
                            <span className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}>
                              Pending
                            </span>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit word"
                              onClick={() => setEditingId(draft.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Remove word"
                              onClick={() => removeDraft(draft.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
                          {draft.word || "Untitled word"}
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {draft.meaningBn.filter((m) => m.trim()).join(", ") || "No Bangla meaning"}
                        </p>
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
              : `Submit ${drafts.length} word${drafts.length === 1 ? "" : "s"} for review`}
          </Button>
          <p className="mt-2.5 text-center text-xs text-zinc-400">
            Everything you submit starts as pending and is reviewed by admins.
            Words that already exist are rejected.
          </p>
        </div>
      </section>

      {/* Add panel */}
      <section className={cn(CARD, "overflow-hidden self-start lg:sticky lg:top-6")}>
        <div className={cn("flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6 sm:py-5", DIVIDER)}>
          <div className="flex items-center gap-3">
            <div className={cn(ICON_CHIP, "text-violet-500 bg-violet-500/10")}>
              <SquarePen className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Add Words
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
              <WordEditor
                value={manualDraft}
                onChange={(next) => {
                  setManualDraft(next);
                  if (manualError) setManualError(null);
                }}
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
                <span className={cn(TILE_ICON, "text-violet-500 bg-violet-500/10")}>
                  {importing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <FileJson className="h-6 w-6" />
                  )}
                </span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Upload a JSON file of words
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Words are loaded into the review panel where you can edit
                    them before submitting.
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
    "word": "serendipity",
    "meaningBn": ["দৈবসুখ"],
    "synonyms": ["luck", "chance"],
    "antonyms": ["misfortune"],
    "definitionEn": "A happy accident.",
    "definitionBn": "অপ্রত্যাশিত সুসংযোগ",
    "examplesEn": ["Finding it was serendipity."],
    "examplesBn": [],
    "level": "A1",
    "category": "Oxford5000",
    "wordType": ["noun"]
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