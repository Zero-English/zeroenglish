"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
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
  grammarLevelOptions,
  grammarRuleStatusOptions,
  type GrammarCategory,
  type GrammarLevelValue,
  type GrammarRuleDetail,
  type GrammarRuleOption,
  type GrammarRuleStatusValue,
} from "../_data/grammar";

export type GrammarRulePayload = {
  title: string;
  description: string;
  grammarCategoryId: number;
  level: GrammarLevelValue;
  examples: string[];
  commonMistakes: string[];
  prerequisites: number[];
  status: GrammarRuleStatusValue;
};

type GrammarFormState = {
  title: string;
  description: string;
  grammarCategoryId: string;
  level: GrammarLevelValue | "";
  examples: string[];
  commonMistakes: string[];
  prerequisites: number[];
  status: GrammarRuleStatusValue;
};

function emptyForm(): GrammarFormState {
  return {
    title: "",
    description: "",
    grammarCategoryId: "",
    level: "",
    examples: [],
    commonMistakes: [],
    prerequisites: [],
    status: "PENDING",
  };
}

export function GrammarRuleFormDialog({
  open,
  onOpenChange,
  editing,
  categories,
  options,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: GrammarRuleDetail | null;
  categories: GrammarCategory[];
  options: GrammarRuleOption[];
  onSave: (payload: GrammarRulePayload) => void;
}) {
  const [form, setForm] = useState<GrammarFormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState("");

  function resetForm() {
    setForm(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            grammarCategoryId: String(editing.grammarCategoryId),
            level: editing.level,
            examples: editing.examples ?? [],
            commonMistakes: editing.commonMistakes ?? [],
            prerequisites: editing.prerequisiteIds ?? [],
            status: editing.status,
          }
        : emptyForm()
    );
    setError(null);
  }

  const key = `${open ? "open" : "closed"}:${editing ? editing.id : "new"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) resetForm();
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!form.grammarCategoryId) {
      setError("Grammar category is required.");
      return;
    }
    if (!form.level) {
      setError("Level is required.");
      return;
    }

    const payload: GrammarRulePayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      grammarCategoryId: Number(form.grammarCategoryId),
      level: form.level,
      examples: form.examples.map((e) => e.trim()).filter(Boolean),
      commonMistakes: form.commonMistakes.map((e) => e.trim()).filter(Boolean),
      prerequisites: form.prerequisites,
      status: form.status,
    };
    onSave(payload);
  }

  const selectableOptions = options.filter(
    (o) => o.id !== editing?.id && !form.prerequisites.includes(o.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit grammar rule" : "Create grammar rule"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the grammar rule content, level and prerequisites."
              : "Add a new grammar rule to the library."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field>
            <FieldLabel className="flex items-center gap-0.5">
              Title
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Present Perfect Tense"
            />
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-0.5">
              Description
              <span className="text-rose-500">*</span>
            </FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Explain the rule, its usage and structure..."
              rows={4}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Category
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Select
                value={form.grammarCategoryId}
                onValueChange={(v) =>
                  setForm({ ...form, grammarCategoryId: v })
                }
              >
                <SelectTrigger className="w-full" aria-label="Category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Level
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  setForm({ ...form, level: v as GrammarLevelValue })
                }
              >
                <SelectTrigger className="w-full" aria-label="Level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {grammarLevelOptions.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as GrammarRuleStatusValue })
                }
              >
                <SelectTrigger className="w-full" aria-label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {grammarRuleStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <StringListEditor
            label="Examples"
            values={form.examples}
            onChange={(v) => setForm({ ...form, examples: v })}
            placeholder="e.g. I have lived here for five years."
          />

          <StringListEditor
            label="Common mistakes"
            values={form.commonMistakes}
            onChange={(v) => setForm({ ...form, commonMistakes: v })}
            placeholder="e.g. I have seen him yesterday."
          />

          <Field>
            <FieldLabel>Prerequisites</FieldLabel>
            <Select
              value=""
              onValueChange={(v) => {
                const id = Number(v);
                setForm((prev) =>
                  prev.prerequisites.includes(id)
                    ? prev
                    : { ...prev, prerequisites: [...prev.prerequisites, id] }
                );
              }}
            >
              <SelectTrigger className="w-full" aria-label="Add prerequisite">
                <SelectValue placeholder="Add a prerequisite rule..." />
              </SelectTrigger>
              <SelectContent>
                {selectableOptions.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No approved rules available
                  </SelectItem>
                ) : (
                  selectableOptions.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      [{o.level}] {o.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.prerequisites.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.prerequisites.map((id) => {
                  const option = options.find((o) => o.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {option ? `[${option.level}] ${option.title}` : `#${id}`}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            prerequisites: prev.prerequisites.filter(
                              (p) => p !== id
                            ),
                          }))
                        }
                        aria-label={`Remove prerequisite ${id}`}
                        className="text-primary/70 hover:text-primary"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
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
            {editing ? "Save changes" : "Create rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }
  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...values, ""]);
  }

  return (
    <Field>
      <FieldLabel className="flex items-center justify-between">
        {label}
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[0.6875rem] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </FieldLabel>
      <div className="space-y-2">
        {values.length === 0 && (
          <p className="text-xs text-muted-foreground/70">No items yet.</p>
        )}
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              title="Remove"
              aria-label="Remove item"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Field>
  );
}
