"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BookOpenCheck, Clock3, ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type GrammarCategory = {
  id: number;
  titleEn: string;
  titleBn: string;
  sectionTitleEn: string;
};
type RuleSubmission = {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isPublished: boolean;
  createdAt: string;
  category: { titleEn: string; titleBn: string };
};

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";
const DIFFICULTIES: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function lines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function messageFrom(response: { message?: string }, fallback: string) {
  return response.message || fallback;
}

export function GrammarCurriculumContributeFlow() {
  const t = useT();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-5">
      <section className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-center gap-3 border-b border-border/60 p-5 sm:px-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookOpenCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">
              {t("নতুন ব্যাকরণ নিয়ম যোগ করুন", "Add a New Grammar Rule")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t(
                "জমা দেওয়ার পর নিয়মটি এডমিন অনুমোদনের অপেক্ষায় থাকবে।",
                "Every submission stays pending and unpublished until an admin approves it."
              )}
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <GrammarCurriculumRuleForm
            onSubmitted={() => setRefreshKey((key) => key + 1)}
          />
        </div>
      </section>
      <MyCurriculumGrammarRuleSubmissions key={refreshKey} />
    </div>
  );
}

function GrammarCurriculumRuleForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const t = useT();
  const [categories, setCategories] = useState<GrammarCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("BEGINNER");
  const [estimatedMinutes, setEstimatedMinutes] = useState("5");
  const [shortDescriptionEn, setShortDescriptionEn] = useState("");
  const [shortDescriptionBn, setShortDescriptionBn] = useState("");
  const [formulaOrPattern, setFormulaOrPattern] = useState("");
  const [introductionEn, setIntroductionEn] = useState("");
  const [introductionBn, setIntroductionBn] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryBn, setSummaryBn] = useState("");
  const [keyRulesEn, setKeyRulesEn] = useState("");
  const [keyRulesBn, setKeyRulesBn] = useState("");
  const [examplesEn, setExamplesEn] = useState("");
  const [examplesBn, setExamplesBn] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [corrections, setCorrections] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/grammar/sections")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) {
          throw new Error(messageFrom(json, "Could not load grammar categories."));
        }

        const options: GrammarCategory[] = json.data.flatMap(
          (section: {
            titleEn: string;
            categories?: Array<{
              id: number;
              titleEn: string;
              titleBn: string;
            }>;
          }) =>
            (section.categories ?? []).map((category) => ({
              ...category,
              sectionTitleEn: section.titleEn,
            }))
        );
        if (!cancelled) {
          setCategories(options);
          if (options[0]) setCategoryId(String(options[0].id));
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setCategoryError(
            reason instanceof Error
              ? reason.message
              : "Could not load grammar categories."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const keyEn = lines(keyRulesEn);
    const keyBn = lines(keyRulesBn);
    const exampleEn = lines(examplesEn);
    const exampleBn = lines(examplesBn);
    const incorrect = lines(mistakes);
    const correct = lines(corrections);

    if (!titleEn.trim() || !titleBn.trim() || !slug.trim() || !categoryId) {
      setError(
        t(
          "ইংরেজি ও বাংলা শিরোনাম, স্লাগ এবং বিভাগ পূরণ করুন।",
          "English title, Bangla title, slug, and category are required."
        )
      );
      return;
    }
    if (keyEn.length !== keyBn.length) {
      setError(t("প্রতিটি ইংরেজি নিয়মের বাংলা অনুবাদ দিন।", "Add one Bangla translation for each English key rule."));
      return;
    }
    if (incorrect.length !== correct.length) {
      setError(t("প্রতিটি ভুলের জন্য সঠিক বাক্য দিন।", "Add one correction for each common mistake."));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/v1/grammar/contributor/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          categoryId: Number(categoryId),
          titleEn: titleEn.trim(),
          titleBn: titleBn.trim(),
          shortDescriptionEn: shortDescriptionEn.trim(),
          shortDescriptionBn: shortDescriptionBn.trim(),
          difficulty,
          estimatedMinutes: Number(estimatedMinutes),
          formulaOrPattern: formulaOrPattern.trim(),
          introductionEn: introductionEn.trim(),
          introductionBn: introductionBn.trim(),
          summaryEn: summaryEn.trim(),
          summaryBn: summaryBn.trim(),
          keyRules: keyEn.map((ruleEn, index) => ({
            ruleEn,
            ruleBn: keyBn[index],
          })),
          examples: Array.from(
            { length: Math.max(exampleEn.length, exampleBn.length) },
            (_, index) => ({ en: exampleEn[index] ?? "", bn: exampleBn[index] ?? "" })
          ),
          commonMistakes: incorrect.map((incorrectText, index) => ({
            incorrect: incorrectText,
            correct: correct[index],
          })),
          comparisons: [],
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(messageFrom(json, "Could not submit grammar rule."));
      }

      toast.success(
        t("ব্যাকরণ নিয়মটি এডমিন পর্যালোচনার জন্য জমা হয়েছে।", "Grammar rule submitted for admin review.")
      );
      setCategoryId(categories[0] ? String(categories[0].id) : "");
      setSlug("");
      setTitleEn("");
      setTitleBn("");
      setDifficulty("BEGINNER");
      setEstimatedMinutes("5");
      setShortDescriptionEn("");
      setShortDescriptionBn("");
      setFormulaOrPattern("");
      setIntroductionEn("");
      setIntroductionBn("");
      setSummaryEn("");
      setSummaryBn("");
      setKeyRulesEn("");
      setKeyRulesBn("");
      setExamplesEn("");
      setExamplesBn("");
      setMistakes("");
      setCorrections("");
      onSubmitted();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not submit grammar rule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {categoryError ? (
        <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          {categoryError}
        </p>
      ) : null}
      {!loadingCategories && !categoryError && categories.length === 0 ? (
        <p role="alert" className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          {t("এখন কোনো প্রকাশিত ব্যাকরণ বিভাগ নেই। পরে আবার চেষ্টা করুন।", "There are no published grammar categories available yet. Please try again later.")}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("শ্রেণি", "Category")} required>
          <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCategories || categories.length === 0}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingCategories ? t("লোড হচ্ছে...", "Loading...") : t("বিভাগ নির্বাচন করুন", "Select a category")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.sectionTitleEn} — {category.titleEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("কঠিনতার স্তর", "Difficulty")}>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((value) => <SelectItem key={value} value={value}>{value.toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("ইংরেজি শিরোনাম", "English title")} required>
          <Input value={titleEn} onChange={(event) => setTitleEn(event.target.value)} placeholder="e.g. Present Perfect Tense" />
        </Field>
        <Field label={t("বাংলা শিরোনাম", "Bangla title")} required>
          <Input value={titleBn} onChange={(event) => setTitleBn(event.target.value)} placeholder="যেমন: Present Perfect Tense" />
        </Field>
        <Field label={t("স্লাগ", "Rule slug")} required>
          <div className="flex gap-2">
            <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="present-perfect-tense" className="font-mono" />
            <Button type="button" variant="outline" onClick={() => setSlug(createSlug(titleEn))}>
              {t("তৈরি", "Generate")}
            </Button>
          </div>
        </Field>
        <Field label={t("আনুমানিক সময় (মিনিট)", "Estimated minutes")}>
          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="number" min={1} max={60} value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} className="pl-9" />
          </div>
        </Field>
        <Field label={t("সংক্ষিপ্ত বিবরণ (ইংরেজি)", "Short description (English)")}>
          <Textarea value={shortDescriptionEn} onChange={(event) => setShortDescriptionEn(event.target.value)} rows={2} />
        </Field>
        <Field label={t("সংক্ষিপ্ত বিবরণ (বাংলা)", "Short description (Bangla)")}>
          <Textarea value={shortDescriptionBn} onChange={(event) => setShortDescriptionBn(event.target.value)} rows={2} />
        </Field>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">{t("নিয়মের ব্যাখ্যা", "Rule explanation")}</h3>
        <Field label={t("সূত্র / গঠন", "Formula / pattern")}>
          <Input value={formulaOrPattern} onChange={(event) => setFormulaOrPattern(event.target.value)} placeholder="Subject + have/has + past participle" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("ভূমিকা (ইংরেজি)", "Introduction (English)")}>
            <Textarea value={introductionEn} onChange={(event) => setIntroductionEn(event.target.value)} rows={4} />
          </Field>
          <Field label={t("ভূমিকা (বাংলা)", "Introduction (Bangla)")}>
            <Textarea value={introductionBn} onChange={(event) => setIntroductionBn(event.target.value)} rows={4} />
          </Field>
          <Field label={t("সারাংশ (ইংরেজি)", "Summary (English)")}>
            <Textarea value={summaryEn} onChange={(event) => setSummaryEn(event.target.value)} rows={3} />
          </Field>
          <Field label={t("সারাংশ (বাংলা)", "Summary (Bangla)")}>
            <Textarea value={summaryBn} onChange={(event) => setSummaryBn(event.target.value)} rows={3} />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">{t("মূল নিয়ম", "Key rules")}</h3>
        <p className="text-xs text-muted-foreground">{t("প্রতিটি লাইনের ক্রম একই রাখুন।", "Enter one rule per line; matching lines are paired by order.")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("নিয়ম (ইংরেজি)", "Rules (English)")}>
            <Textarea value={keyRulesEn} onChange={(event) => setKeyRulesEn(event.target.value)} rows={4} />
          </Field>
          <Field label={t("নিয়ম (বাংলা)", "Rules (Bangla)")}>
            <Textarea value={keyRulesBn} onChange={(event) => setKeyRulesBn(event.target.value)} rows={4} />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">{t("উদাহরণ", "Examples")}</h3>
        <p className="text-xs text-muted-foreground">{t("প্রতিটি লাইনের ক্রম একই রাখুন।", "Enter one example per line; matching lines are paired by order.")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("উদাহরণ (ইংরেজি)", "Examples (English)")}>
            <Textarea value={examplesEn} onChange={(event) => setExamplesEn(event.target.value)} rows={4} />
          </Field>
          <Field label={t("উদাহরণ (বাংলা)", "Examples (Bangla)")}>
            <Textarea value={examplesBn} onChange={(event) => setExamplesBn(event.target.value)} rows={4} />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">{t("সাধারণ ভুল", "Common mistakes")}</h3>
        <p className="text-xs text-muted-foreground">{t("ভুল ও সঠিক বাক্য একই ক্রমে লিখুন।", "Enter incorrect and corrected sentences in matching order.")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("ভুল বাক্য", "Incorrect sentences")}>
            <Textarea value={mistakes} onChange={(event) => setMistakes(event.target.value)} rows={4} />
          </Field>
          <Field label={t("সঠিক বাক্য", "Corrections")}>
            <Textarea value={corrections} onChange={(event) => setCorrections(event.target.value)} rows={4} />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Sparkles className="size-3.5" />
          {t("অ্যাডমিন অনুমোদনের অপেক্ষায়", "Pending admin approval")}
        </span>
        <Button type="submit" disabled={saving || loadingCategories || categories.length === 0}>
          <BookOpenCheck className="mr-2 size-4" />
          {saving ? t("জমা হচ্ছে...", "Submitting...") : t("পর্যালোচনার জন্য জমা দিন", "Submit for review")}
        </Button>
      </div>
    </form>
  );
}

function MyCurriculumGrammarRuleSubmissions() {
  const t = useT();
  const [rules, setRules] = useState<RuleSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/grammar/contributor/rules")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success || !Array.isArray(json.data)) {
          throw new Error(messageFrom(json, "Could not load your grammar submissions."));
        }
        if (!cancelled) setRules(json.data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load your grammar submissions.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={cn(CARD, "overflow-hidden")}>
      <div className="flex items-center gap-3 border-b border-border/60 p-5 sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <ListChecks className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{t("আপনার জমা দেওয়া নিয়ম", "Your grammar submissions")}</h2>
          <p className="text-xs text-muted-foreground">{t("এডমিন পর্যালোচনা না করা পর্যন্ত সব নিয়ম অপ্রকাশিত থাকবে।", "Submissions remain unpublished until reviewed by an admin.")}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("লোড হচ্ছে...", "Loading...")}</p>
        ) : error ? null : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("আপনি এখনো কোনো নিয়ম জমা দেননি।", "You haven't submitted any curriculum rules yet.")}</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {rules.map((rule) => (
              <li key={rule.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{rule.titleEn} <span className="text-muted-foreground">/ {rule.titleBn}</span></p>
                  <p className="text-xs text-muted-foreground">{rule.category.titleEn} · {new Date(rule.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  rule.status === "PENDING" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
                  rule.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
                  "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                )}>
                  {rule.status === "PENDING"
                    ? t("অপেক্ষমাণ", "Pending")
                    : rule.status === "APPROVED"
                      ? t("অনুমোদিত", "Approved")
                      : t("প্রত্যাখ্যাত", "Rejected")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-foreground">
      <span>{label}{required ? <span className="ml-1 text-rose-500">*</span> : null}</span>
      {children}
    </label>
  );
}
