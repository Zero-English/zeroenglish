"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Send,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

import { toast } from "sonner";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WrittenMarkdownEditor } from "@/components/written/written-markdown-editor";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

const BTN_PRIMARY =
  "shrink-0 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-10 text-sm font-semibold shadow-xs transition-colors cursor-pointer";

type WrittenType = {
  id: number;
  name: string;
};

export function WrittenContributeFlow() {
  const t = useT();

  const [types, setTypes] = useState<WrittenType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [writtenTypeId, setWrittenTypeId] = useState<number | null>(null);
  const [keywords, setKeywords] = useState("");

  // 6 Markdown Content states
  const [contentEnEasy, setContentEnEasy] = useState("");
  const [contentEnMedium, setContentEnMedium] = useState("");
  const [contentEnHard, setContentEnHard] = useState("");
  const [contentBnEasy, setContentBnEasy] = useState("");
  const [contentBnMedium, setContentBnMedium] = useState("");
  const [contentBnHard, setContentBnHard] = useState("");

  // Active tab selection
  const [langTab, setLangTab] = useState<"en" | "bn">("en");
  const [tierTab, setTierTab] = useState<"easy" | "medium" | "hard">("easy");

  useEffect(() => {
    fetch("/api/v1/written/types")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTypes(json.data);
          if (json.data.length > 0 && !writtenTypeId) {
            setWrittenTypeId(json.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEn.trim() || !titleBn.trim()) {
      toast.error(
        t(
          "অনুগ্রহ করে ইংরেজি ও বাংলা শিরোনাম পূরণ করুন",
          "Please enter both English and Bangla titles"
        )
      );
      return;
    }
    if (!writtenTypeId) {
      toast.error(
        t(
          "একটি লেখার ধরণ নির্বাচন করুন",
          "Please select a writing type"
        )
      );
      return;
    }

    // Ensure at least one tier has content
    const hasAnyContent =
      contentEnEasy.trim() ||
      contentEnMedium.trim() ||
      contentEnHard.trim() ||
      contentBnEasy.trim() ||
      contentBnMedium.trim() ||
      contentBnHard.trim();

    if (!hasAnyContent) {
      toast.error(
        t(
          "অনুগ্রহ করে অন্তত একটি লেভেলে কনটেন্ট লিখুন",
          "Please provide markdown content for at least one difficulty tier"
        )
      );
      return;
    }

    setSubmitting(true);

    const payload = {
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      writtenTypeId,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      contentEnEasy,
      contentEnMedium,
      contentEnHard,
      contentBnEasy,
      contentBnMedium,
      contentBnHard,
    };

    try {
      const res = await fetch("/api/v1/written", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to submit content");
        return;
      }

      toast.success(
        t(
          "আপনার কনটেন্ট পর্যালোচনার জন্য জমা দেওয়া হয়েছে!",
          "Your written content has been submitted for review!"
        )
      );

      // Reset form
      setTitleEn("");
      setTitleBn("");
      setKeywords("");
      setContentEnEasy("");
      setContentEnMedium("");
      setContentEnHard("");
      setContentBnEasy("");
      setContentBnMedium("");
      setContentBnHard("");
    } catch {
      toast.error("Failed to submit written content");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className={cn(CARD, "p-5 sm:p-6")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={ICON_CHIP}>
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t("লিখিত কনটেন্ট জমা দিন", "Contribute Written Content")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                {t(
                  "প্রবন্ধ, অনুচ্ছেদ, চিঠি, সংলাপ বা যেকোনো লিখিত বিষয় Markdown ফরম্যাটে তৈরি করুন। সহজ, মধ্যম ও কঠিন ৩টি স্তরে ইংরেজি ও বাংলা কনটেন্ট যুক্ত করা যাবে।",
                  "Submit essays, paragraphs, letters, dialogues, and reports with Markdown. You can compose Easy, Medium, and Hard versions in English and Bengali."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              {t("পর্যালোচনা প্রয়োজন", "Review Required")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className={cn(CARD, "p-5 sm:p-6 space-y-4")}>
          <h3 className="font-semibold text-sm flex items-center gap-2 border-b border-border/70 pb-2">
            <Sparkles className="size-4 text-primary" />
            {t("মৌলিক তথ্য", "Basic Information")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="text-xs font-semibold">
                {t("ইংরেজি শিরোনাম *", "English Title *")}
              </FieldLabel>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Benefits of Early Rising"
                className="h-10 text-sm"
                required
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold">
                {t("বাংলা শিরোনাম *", "Bangla Title *")}
              </FieldLabel>
              <Input
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="e.g. ভোরে ওঠার উপকারিতা"
                className="h-10 text-sm"
                required
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold">
                {t("লেখার ধরণ *", "Writing Type *")}
              </FieldLabel>
              <Select
                value={writtenTypeId ? String(writtenTypeId) : ""}
                onValueChange={(val) => setWrittenTypeId(Number(val))}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold">
                {t("কি-ওয়ার্ডস (কমা দিয়ে আলাদা করুন)", "Keywords (comma separated)")}
              </FieldLabel>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="paragraph, morning walk, health, english"
                className="h-10 text-sm"
              />
            </Field>
          </div>
        </div>

        {/* Multi-Tier Markdown Content Editor */}
        <div className={cn(CARD, "p-5 sm:p-6 space-y-4")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                {t("Markdown কনটেন্ট লিখুন", "Markdown Content Editor")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "ভাষা ও স্তর নির্বাচন করে আপনার লেখা তৈরি করুন। Visual, Raw Markdown বা Live Preview ব্যবহার করতে পারেন।",
                  "Switch between languages and difficulty tiers. Use Visual, Markdown or Preview mode."
                )}
              </p>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangTab("en")}
                className={cn(
                  "h-7 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                  langTab === "en"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground"
                )}
              >
                English
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangTab("bn")}
                className={cn(
                  "h-7 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                  langTab === "bn"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground"
                )}
              >
                বাংলা (Bengali)
              </Button>
            </div>
          </div>

          {/* Difficulty Tier Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              {t("কঠিনতার স্তর:", "Difficulty Level:")}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTierTab("easy")}
              className={cn(
                "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                tierTab === "easy"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <span className="size-2 rounded-full bg-emerald-500" />
              Easy (সহজ)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTierTab("medium")}
              className={cn(
                "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                tierTab === "medium"
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <span className="size-2 rounded-full bg-amber-500" />
              Medium (মধ্যম)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTierTab("hard")}
              className={cn(
                "h-8 text-xs font-medium gap-1.5 cursor-pointer",
                tierTab === "hard"
                  ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <span className="size-2 rounded-full bg-rose-500" />
              Hard (উন্নত)
            </Button>
          </div>

          {/* Content Editor Component */}
          <div className="pt-1">
            {langTab === "en" && tierTab === "easy" && (
              <WrittenMarkdownEditor
                key="contrib-editor-en-easy"
                editorKey="contrib-editor-en-easy"
                value={contentEnEasy}
                onChange={setContentEnEasy}
                placeholder="Write Easy English content in Markdown..."
              />
            )}
            {langTab === "en" && tierTab === "medium" && (
              <WrittenMarkdownEditor
                key="contrib-editor-en-medium"
                editorKey="contrib-editor-en-medium"
                value={contentEnMedium}
                onChange={setContentEnMedium}
                placeholder="Write Medium English content in Markdown..."
              />
            )}
            {langTab === "en" && tierTab === "hard" && (
              <WrittenMarkdownEditor
                key="contrib-editor-en-hard"
                editorKey="contrib-editor-en-hard"
                value={contentEnHard}
                onChange={setContentEnHard}
                placeholder="Write Advanced/Hard English content in Markdown..."
              />
            )}

            {langTab === "bn" && tierTab === "easy" && (
              <WrittenMarkdownEditor
                key="contrib-editor-bn-easy"
                editorKey="contrib-editor-bn-easy"
                value={contentBnEasy}
                onChange={setContentBnEasy}
                placeholder="সহজ ভাষায় বাংলায় লিখুন (Markdown)..."
              />
            )}
            {langTab === "bn" && tierTab === "medium" && (
              <WrittenMarkdownEditor
                key="contrib-editor-bn-medium"
                editorKey="contrib-editor-bn-medium"
                value={contentBnMedium}
                onChange={setContentBnMedium}
                placeholder="মধ্যম মানের ভাষায় বাংলায় লিখুন (Markdown)..."
              />
            )}
            {langTab === "bn" && tierTab === "hard" && (
              <WrittenMarkdownEditor
                key="contrib-editor-bn-hard"
                editorKey="contrib-editor-bn-hard"
                value={contentBnHard}
                onChange={setContentBnHard}
                placeholder="উন্নত মানের ভাষায় বাংলায় লিখুন (Markdown)..."
              />
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className={BTN_PRIMARY}
          >
            <Send className="size-4" />
            {submitting
              ? t("জমা দেওয়া হচ্ছে...", "Submitting...")
              : t("জমা দিন", "Submit for Review")}
          </Button>
        </div>
      </form>
    </div>
  );
}

