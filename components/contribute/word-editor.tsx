"use client";

import { Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
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
  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  return (
    <Field>
      <FieldLabel className="w-full">
        <span className="flex items-center justify-between">
          {label}
          <button
            type="button"
            onClick={() => onChange([...values, ""])}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-[0.6875rem] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </span>
      </FieldLabel>
      <div className="space-y-2">
        {values.length === 0 ? (
          <p className="text-xs text-zinc-400">No items yet.</p>
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
                title="Remove"
                aria-label="Remove item"
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

  return (
    <Field>
      <FieldLabel>Category</FieldLabel>
      {mode === "select" ? (
        <div className="flex gap-1.5">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
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
            title="Create a custom category"
            aria-label="Create a custom category"
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
            placeholder="New category"
          />
          <button
            type="button"
            onClick={() => setMode("select")}
            title="Pick from the list"
            aria-label="Pick from the list"
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
  function toggle(pos: string) {
    onChange(
      value.includes(pos) ? value.filter((p) => p !== pos) : [...value, pos]
    );
  }

  return (
    <Field>
      <FieldLabel>Part of speech</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {POS_OPTIONS.map((pos) => {
          const active = value.includes(pos);
          return (
            <button
              key={pos}
              type="button"
              onClick={() => toggle(pos)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              {pos}
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
}: {
  value: DraftWord;
  onChange: (next: DraftWord) => void;
}) {
  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>Word</FieldLabel>
        <Input
          value={value.word}
          placeholder="e.g. serendipity"
          onChange={(e) => onChange({ ...value, word: e.target.value })}
        />
      </Field>

      <StringListEditor
        label="Meaning (Bangla)"
        values={value.meaningBn}
        onChange={(meaningBn) => onChange({ ...value, meaningBn })}
        placeholder="Word's Bangla meaning"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Definition (English)</FieldLabel>
          <Textarea
            rows={3}
            value={value.definitionEn}
            placeholder="A short English definition…"
            onChange={(e) =>
              onChange({ ...value, definitionEn: e.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel>Definition (Bangla)</FieldLabel>
          <Textarea
            rows={3}
            value={value.definitionBn}
            placeholder="A short Bangla definition…"
            onChange={(e) =>
              onChange({ ...value, definitionBn: e.target.value })
            }
          />
        </Field>
      </div>

      <StringListEditor
        label="Example sentences (English)"
        values={value.examplesEn}
        onChange={(examplesEn) => onChange({ ...value, examplesEn })}
        placeholder="e.g. Finding the lost ring was a serendipity."
      />

      <StringListEditor
        label="Example sentences (Bangla)"
        values={value.examplesBn}
        onChange={(examplesBn) => onChange({ ...value, examplesBn })}
        placeholder="An example sentence in Bangla"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StringListEditor
          label="Synonyms"
          values={value.synonyms}
          onChange={(synonyms) => onChange({ ...value, synonyms })}
          placeholder="e.g. luck, chance"
        />
        <StringListEditor
          label="Antonyms"
          values={value.antonyms}
          onChange={(antonyms) => onChange({ ...value, antonyms })}
          placeholder="e.g. misfortune, misfortune"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Level</FieldLabel>
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
                  {option.label}
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

      <PartsOfSpeechField
        value={value.wordType}
        onChange={(wordType) => onChange({ ...value, wordType })}
      />
    </div>
  );
}

export function validateWordDraft(d: DraftWord): string | null {
  if (!d.word.trim()) return "Word is required.";
  if (d.meaningBn.every((m) => !m.trim()))
    return "At least one Bangla meaning is required.";
  return null;
}