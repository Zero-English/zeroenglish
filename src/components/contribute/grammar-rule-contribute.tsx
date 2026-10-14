"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BookOpenCheck, ListChecks, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/language-provider";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type GrammarLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type RuleStatus = "PENDING" | "APPROVED" | "REJECTED";
type Category = { id: number; name: string };
type RuleOption = { id: number; title: string; level: GrammarLevel };
type GrammarRule = {
  id: number;
  title: string;
  description: string;
  grammarCategoryId: number;
  grammarCategory: Category | null;
  level: GrammarLevel;
  examples: string[];
  commonMistakes: string[];
  status: RuleStatus;
  prerequisites: RuleOption[];
  prerequisiteIds: number[];
};

type RulePayload = {
  title: string;
  description: string;
  grammarCategoryId: number;
  level: GrammarLevel;
  examples: string[];
  commonMistakes: string[];
  prerequisites: number[];
};

const LEVELS: GrammarLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PAGE_SIZE = 10;
const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

function responseMessage(json: { message?: string }, fallback: string) {
  return json.message || fallback;
}

export function GrammarRuleContributeFlow() {
  const t = useT();
  const [formKey, setFormKey] = useState(0);

  async function createRule(payload: RulePayload) {
    const response = await fetch("/api/v1/grammar-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(responseMessage(json, "Could not submit grammar rule."));
    }
    toast.success(t("ব্যাকরণ নিয়মটি পর্যালোচনার জন্য জমা হয়েছে।", "Grammar rule submitted for review."));
    setFormKey((key) => key + 1);
  }

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="flex items-center gap-3 border-b border-black/[0.06] p-5 dark:border-white/[0.08] sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <BookOpenCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {t("ব্যাকরণ নিয়ম যোগ করুন", "Create a grammar rule")}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("জমা দেওয়ার পর একজন এডমিন পর্যালোচনা করবেন।", "Submissions stay pending until reviewed by an admin.")}
          </p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <GrammarRuleForm key={formKey} onSubmit={createRule} submitLabel={t("পর্যালোচনার জন্য জমা দিন", "Submit for review")} />
      </div>
    </section>
  );
}

export function MyGrammarRuleSubmissions() {
  const t = useT();
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GrammarRule | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/grammar-rule/mine?page=${page}&limit=${PAGE_SIZE}`)
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) {
          throw new Error(responseMessage(json, "Could not load grammar rules."));
        }
        if (cancelled) return;
        setRules(json.data);
        setTotal(json.pagination?.total ?? json.data.length);
        setTotalPages(json.pagination?.totalPages ?? 1);
        setError(null);
        setLoadedPage(page);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load grammar rules.");
          setLoadedPage(page);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const loading = loadedPage !== page;
  const visibleError = loadedPage === page ? error : null;

  async function saveRule(payload: RulePayload) {
    if (!editing) return;
    const response = await fetch(`/api/v1/grammar-rule/mine/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(responseMessage(json, "Could not update grammar rule."));
    }
    setRules((current) =>
      current.map((rule) => (rule.id === editing.id ? json.data : rule)),
    );
    setEditing(null);
    toast.success(t("ব্যাকরণ নিয়ম আপডেট হয়েছে।", "Grammar rule updated."));
  }

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] p-5 dark:border-white/[0.08] sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ListChecks className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t("আমার ব্যাকরণ নিয়ম", "My grammar rules")}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(`${total}টি মোট`, `${total} total`)}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          {t("অপেক্ষমাণ — এডমিন পর্যালোচনা", "Pending — awaiting admin review")}
        </span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {visibleError ? (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {visibleError}
          </p>
        ) : null}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : rules.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("আপনি এখনো কোনো ব্যাকরণ নিয়ম জমা দেননি।", "You haven't submitted any grammar rules yet.")}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {rules.map((rule) => (
                <li key={rule.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{rule.title}</span>
                      <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">{rule.level}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", rule.status === "PENDING" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : rule.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")}>
                        {rule.status === "PENDING" ? t("অপেক্ষমাণ", "Pending") : rule.status === "APPROVED" ? t("অনুমোদিত", "Approved") : t("প্রত্যাখ্যাত", "Rejected")}
                      </span>
                    </div>
                    {rule.status === "PENDING" ? (
                      <Button variant="outline" size="sm" onClick={() => setEditing(rule)}>
                        <Pencil className="mr-1.5 size-4" />
                        {t("সম্পাদনা", "Edit")}
                      </Button>
                    ) : null}
                  </div>
                  {rule.grammarCategory ? <p className="text-xs text-zinc-500">{rule.grammarCategory.name}</p> : null}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{rule.description}</p>
                  {rule.examples.length ? <p className="text-xs text-zinc-500"><strong>{t("উদাহরণ:", "Examples:")}</strong> {rule.examples.join(" · ")}</p> : null}
                  {rule.commonMistakes.length ? <p className="text-xs text-zinc-500"><strong>{t("সাধারণ ভুল:", "Common mistakes:")}</strong> {rule.commonMistakes.join(" · ")}</p> : null}
                </li>
              ))}
            </ul>
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{t("আগের", "Previous")}</Button>
                <span className="text-xs text-zinc-500">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>{t("পরের", "Next")}</Button>
              </div>
            ) : null}
          </>
        )}
      </div>
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("ব্যাকরণ নিয়ম সম্পাদনা", "Edit grammar rule")}</DialogTitle>
            <DialogDescription>{t("আপডেটটি আবার এডমিন পর্যালোচনার অপেক্ষায় থাকবে।", "Your changes will remain pending for admin review.")}</DialogDescription>
          </DialogHeader>
          {editing ? (
            <GrammarRuleForm
              key={editing.id}
              initial={editing}
              onSubmit={saveRule}
              submitLabel={t("আপডেট সংরক্ষণ করুন", "Save changes")}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function GrammarRuleForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: GrammarRule;
  onSubmit: (payload: RulePayload) => Promise<void>;
  submitLabel: string;
}) {
  const t = useT();
  const [categories, setCategories] = useState<Category[]>([]);
  const [prerequisites, setPrerequisites] = useState<RuleOption[]>([]);
  const [prerequisitesError, setPrerequisitesError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial ? String(initial.grammarCategoryId) : "");
  const [level, setLevel] = useState<GrammarLevel | "">(initial?.level ?? "");
  const [examples, setExamples] = useState(initial?.examples.join("\n") ?? "");
  const [commonMistakes, setCommonMistakes] = useState(initial?.commonMistakes.join("\n") ?? "");
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>(initial?.prerequisiteIds ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const categoryRequest =
      fetch("/api/v1/quiz-type").then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) {
          throw new Error(responseMessage(json, "Could not load grammar categories."));
        }
        return json.data as Category[];
      });
    const prerequisiteRequest =
      fetch("/api/v1/grammar-rule/options").then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) {
          throw new Error(responseMessage(json, "Could not load prerequisite rules."));
        }
        return json.data as RuleOption[];
      });

    Promise.allSettled([categoryRequest, prerequisiteRequest])
      .then(([categoryResult, prerequisiteResult]) => {
        if (cancelled) return;
        if (categoryResult.status === "fulfilled") {
          setCategories(categoryResult.value);
        } else {
          setOptionsError(
            categoryResult.reason instanceof Error
              ? categoryResult.reason.message
              : "Could not load grammar categories.",
          );
        }
        if (prerequisiteResult.status === "fulfilled") {
          setPrerequisites(prerequisiteResult.value);
        } else {
          setPrerequisitesError(
            prerequisiteResult.reason instanceof Error
              ? prerequisiteResult.reason.message
              : "Could not load prerequisite rules.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim() || !categoryId || !level) {
      setError(t("শিরোনাম, বর্ণনা, বিভাগ ও লেভেল পূরণ করুন।", "Title, description, category and level are required."));
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        grammarCategoryId: Number(categoryId),
        level,
        examples: examples.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        commonMistakes: commonMistakes.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        prerequisites: prerequisiteIds,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save grammar rule.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {optionsError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{optionsError}</p> : null}
      <Field>
        <FieldLabel>{t("শিরোনাম", "Title")} *</FieldLabel>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={300} required />
      </Field>
      <Field>
        <FieldLabel>{t("বর্ণনা", "Description")} *</FieldLabel>
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={10000} rows={5} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t("বিভাগ", "Category")} *</FieldLabel>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingOptions || !!optionsError}>
            <SelectTrigger className="w-full"><SelectValue placeholder={t("বিভাগ নির্বাচন করুন", "Select a category")} /></SelectTrigger>
            <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>{t("লেভেল", "Level")} *</FieldLabel>
          <Select value={level} onValueChange={(value) => setLevel(value as GrammarLevel)}>
            <SelectTrigger className="w-full"><SelectValue placeholder={t("লেভেল নির্বাচন করুন", "Select a level")} /></SelectTrigger>
            <SelectContent>{LEVELS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Field>
        <FieldLabel>{t("উদাহরণ", "Examples")}</FieldLabel>
        <Textarea value={examples} onChange={(event) => setExamples(event.target.value)} placeholder={t("প্রতি লাইনে একটি উদাহরণ", "One example per line")} rows={3} />
      </Field>
      <Field>
        <FieldLabel>{t("সাধারণ ভুল", "Common mistakes")}</FieldLabel>
        <Textarea value={commonMistakes} onChange={(event) => setCommonMistakes(event.target.value)} placeholder={t("প্রতি লাইনে একটি ভুল", "One mistake per line")} rows={3} />
      </Field>
      {prerequisitesError ? (
        <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
          {t("পূর্বশর্তের তালিকা লোড করা যায়নি। পূর্বশর্ত ছাড়াই জমা দিতে পারেন।", `Prerequisites could not be loaded: ${prerequisitesError}. You can still submit without them.`)}
        </p>
      ) : null}
      {loadingOptions ? <Skeleton className="h-16 rounded-xl" /> : prerequisites.length ? (
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("পূর্বশর্ত (ঐচ্ছিক)", "Prerequisites (optional)")}</legend>
          {prerequisites.filter((option) => option.id !== initial?.id).map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={prerequisiteIds.includes(option.id)}
                onChange={(event) => setPrerequisiteIds((current) => event.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id))}
                className="size-4 accent-emerald-600"
              />
              {option.title} <span className="text-xs text-zinc-400">({option.level})</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p> : null}
      <Button type="submit" disabled={submitting || loadingOptions || !!optionsError || categories.length === 0} className="w-full gap-2 sm:w-auto sm:justify-self-end">
        {initial ? <Save className="size-4" /> : <BookOpenCheck className="size-4" />}
        {submitting ? t("সংরক্ষণ হচ্ছে…", "Saving…") : submitLabel}
      </Button>
    </form>
  );
}
