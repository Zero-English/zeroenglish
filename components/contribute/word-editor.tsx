"use client";

import { Plus, Trash2, Pencil, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useT } from "@/components/language-provider";
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
  type DraftWord,
  type WordLevelValue,
  LEVEL_OPTIONS,
  CATEGORY_OPTIONS,
  POS_OPTIONS,
  levelI18n,
  posI18n,
} from "./types";

function nextDraftId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyWordDraft(overrides: Partial<DraftWord> = {}): DraftWord {
  return {
    id: nextDraftId(),
    word: "",
    meaningBn: [""],
    definitionEn: "",
    definitionBn: "",
    examplesEn: [],
    examplesBn: [],
    synonyms: [],
    antonyms: [],
    level: "A1",
    category: "Oxford5000",
    wordType: [],
    ...overrides,
  };
}

function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const t = useT();

  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  return (
    <Field>
      <FieldLabel className="w-full">
        <span className="flex items-center justify-between mb-2">
          {label}
          <button
            type="button"
            onClick={() => onChange([...values, ""])}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-[0.6875rem] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3 w-3" />
            {t("যোগ করুন", "Add")}
          </button>
        </span>
      </FieldLabel>
      <div className="space-y-2">
        {values.length === 0 ? (
          <p className="text-xs text-zinc-400">
            {t("এখনো কোনো আইটেম নেই।", "No items yet.")}
          </p>
        ) : null}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
            />
            {values.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                title={t("মুছুন", "Remove")}
                aria-label={t("আইটেম মুছুন", "Remove item")}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </Field>
  );
}

function CategoryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [mode, setMode] = useState<"select" | "custom">("select");
  const t = useT();

  return (
    <Field>
      <FieldLabel>{t("বিভাগ", "Category")}</FieldLabel>
      {mode === "select" ? (
        <div className="flex gap-1.5">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("বিভাগ", "Category")} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              {value && !CATEGORY_OPTIONS.includes(value) ? (
                <SelectItem value={value}>{value}</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setMode("custom")}
            title={t("নতুন বিভাগ তৈরি করুন", "Create a custom category")}
            aria-label={t("নতুন বিভাগ তৈরি করুন", "Create a custom category")}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-1.5">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("নতুন বিভাগ", "New category")}
          />
          <button
            type="button"
            onClick={() => setMode("select")}
            title={t("তালিকা থেকে বেছে নিন", "Pick from the list")}
            aria-label={t("তালিকা থেকে বেছে নিন", "Pick from the list")}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Field>
  );
}

function PartsOfSpeechField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();

  function toggle(pos: string) {
    onChange(
      value.includes(pos) ? value.filter((p) => p !== pos) : [...value, pos]
    );
  }

  return (
    <Field>
      <FieldLabel>{t("পদের ধরন", "Part of speech")}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {POS_OPTIONS.map((pos) => {
          const active = value.includes(pos);
          return (
            <button
              key={pos}
              type="button"
              onClick={() => toggle(pos)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              {t(...posI18n(pos))}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function WordEditor({
  value,
  onChange,
  defaultOptionalOpen = false,
}: {
  value: DraftWord;
  onChange: (next: DraftWord) => void;
  defaultOptionalOpen?: boolean;
}) {
  const [optionalOpen, setOptionalOpen] = useState(defaultOptionalOpen);
  const t = useT();

  const optionalFilled =
    (value.examplesEn.some((s) => s.trim()) ? 1 : 0) +
    (value.examplesBn.some((s) => s.trim()) ? 1 : 0) +
    (value.synonyms.some((s) => s.trim()) ? 1 : 0) +
    (value.antonyms.some((s) => s.trim()) ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Field>
          <FieldLabel>{t("শব্দ", "Word")}</FieldLabel>
          <Input
            value={value.word}
            placeholder={t("যেমন: serendipity", "e.g. serendipity")}
            onChange={(e) => onChange({ ...value, word: e.target.value })}
          />
        </Field>

        <StringListEditor
          label={t("অর্থ (বাংলা)", "Meaning (Bangla)")}
          values={value.meaningBn}
          onChange={(meaningBn) => onChange({ ...value, meaningBn })}
          placeholder={t("শব্দের বাংলা অর্থ", "Word's Bangla meaning")}
        />
      </div>

      <div className="border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>{t("সংজ্ঞা (ইংরেজি)", "Definition (English)")}</FieldLabel>
            <Textarea
              rows={3}
              value={value.definitionEn}
              placeholder={t(
                "সংক্ষিপ্ত ইংরেজি সংজ্ঞা…",
                "A short English definition…"
              )}
              onChange={(e) =>
                onChange({ ...value, definitionEn: e.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>{t("সংজ্ঞা (বাংলা)", "Definition (Bangla)")}</FieldLabel>
            <Textarea
              rows={3}
              value={value.definitionBn}
              placeholder={t(
                "সংক্ষিপ্ত বাংলা সংজ্ঞা…",
                "A short Bangla definition…"
              )}
              onChange={(e) =>
                onChange({ ...value, definitionBn: e.target.value })
              }
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>{t("লেভেল", "Level")}</FieldLabel>
            <Select
              value={value.level}
              onValueChange={(level) =>
                onChange({ ...value, level: level as WordLevelValue })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(...levelI18n(option.value))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <CategoryField
            value={value.category}
            onChange={(category) => onChange({ ...value, category })}
          />
        </div>

        <div className="mt-4">
          <PartsOfSpeechField
            value={value.wordType}
            onChange={(wordType) => onChange({ ...value, wordType })}
          />
        </div>
      </div>

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
              {t("উদাহরণ, সমার্থক ও বিপরীত শব্দ", "Examples, synonyms & antonyms")}
            </span>
          </span>
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
            {optionalFilled > 0
              ? t(`${optionalFilled}টি পূরণ হয়েছে`, `${optionalFilled} filled`)
              : t("ঐচ্ছিক", "Optional")}
          </span>
        </button>
        {optionalOpen ? (
          <div className="space-y-4 border-t border-black/[0.06] p-4 dark:border-white/[0.08]">
            <StringListEditor
              label={t("উদাহরণ বাক্য (ইংরেজি)", "Example sentences (English)")}
              values={value.examplesEn}
              onChange={(examplesEn) => onChange({ ...value, examplesEn })}
              placeholder={t(
                "যেমন: Finding the lost ring was a serendipity.",
                "e.g. Finding the lost ring was a serendipity."
              )}
            />

            <StringListEditor
              label={t("উদাহরণ বাক্য (বাংলা)", "Example sentences (Bangla)")}
              values={value.examplesBn}
              onChange={(examplesBn) => onChange({ ...value, examplesBn })}
              placeholder={t(
                "বাংলায় একটি উদাহরণ বাক্য",
                "An example sentence in Bangla"
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <StringListEditor
                label={t("সমার্থক শব্দ", "Synonyms")}
                values={value.synonyms}
                onChange={(synonyms) => onChange({ ...value, synonyms })}
                placeholder={t("যেমন: luck, chance", "e.g. luck, chance")}
              />
              <StringListEditor
                label={t("বিপরীত শব্দ", "Antonyms")}
                values={value.antonyms}
                onChange={(antonyms) => onChange({ ...value, antonyms })}
                placeholder={t("যেমন: misfortune", "e.g. misfortune")}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type WordDraftValidationError =
  | "word-required"
  | "meaning-required"
  | "duplicate-in-list";

export function validateWordDraft(d: DraftWord): WordDraftValidationError | null {
  if (!d.word.trim()) return "word-required";
  if (d.meaningBn.every((m) => !m.trim()))
    return "meaning-required";
  return null;
}

export const WORD_DRAFT_ERROR_I18N: Record<
  WordDraftValidationError,
  [string, string]
> = {
  "word-required": ["শব্দটি আবশ্যক।", "Word is required."],
  "meaning-required": [
    "কমপক্ষে একটি বাংলা অর্থ আবশ্যক।",
    "At least one Bangla meaning is required.",
  ],
  "duplicate-in-list": [
    "এই শব্দটি আপনার পর্যালোচনা তালিকায় ইতিমধ্যেই আছে।",
    "This word is already in your review list.",
  ],
};