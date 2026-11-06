"use client";

import {
  BookOpen,
  GraduationCap,
  NotebookPen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import type { NoteColor } from "@/utils/validation/zod";

export interface NoteTemplate {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: LucideIcon;
  color: NoteColor;
  noteTitleEn: string;
  noteTitleBn: string;
  content: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "vocabulary",
    titleEn: "Vocabulary note",
    titleBn: "শব্দ শেখার নোট",
    descriptionEn: "Word, meaning, examples and your own sentences",
    descriptionBn: "শব্দ, অর্থ, উদাহরণ ও নিজের বাক্য",
    icon: BookOpen,
    color: "amber",
    noteTitleEn: "Vocabulary note",
    noteTitleBn: "শব্দ শেখার নোট",
    content: `## Word / Phrase

**Bangla meaning:** 

**English definition:** 

### Example sentences

- 
- 

### My notes

`,
  },
  {
    id: "grammar",
    titleEn: "Grammar rule",
    titleBn: "গ্রামার রুল",
    descriptionEn: "Structure, usage, examples and common mistakes",
    descriptionBn: "গঠন, ব্যবহার, উদাহরণ ও সাধারণ ভুল",
    icon: GraduationCap,
    color: "violet",
    noteTitleEn: "Grammar rule",
    noteTitleBn: "গ্রামার রুল",
    content: `## Rule name

**Structure:** 

### When to use it

- 

### Examples

- 
- 

### Common mistakes

- 
`,
  },
  {
    id: "class",
    titleEn: "Class notes",
    titleBn: "ক্লাসের নোট",
    descriptionEn: "Topic, key points and homework in one place",
    descriptionBn: "টপিক, মূল পয়েন্ট ও হোমওয়ার্ক একসাথে",
    icon: NotebookPen,
    color: "sky",
    noteTitleEn: "Class notes",
    noteTitleBn: "ক্লাসের নোট",
    content: `## Topic

**Date:** 

### Key points

- 

### Homework

- 
`,
  },
  {
    id: "practice",
    titleEn: "Practice journal",
    titleBn: "প্র্যাকটিস জার্নাল",
    descriptionEn: "Track what you practised and what to review",
    descriptionBn: "কী প্র্যাকটিস করলেন ও কী রিভিশন দরকার",
    icon: Sparkles,
    color: "emerald",
    noteTitleEn: "Practice journal",
    noteTitleBn: "প্র্যাকটিস জার্নাল",
    content: `## Today's practice

**Date:** 

### What I practised

- 

### Words to review

- 

### Tomorrow

- 
`,
  },
];

interface NotesEmptyProps {
  variant: "no-notes" | "no-selection";
  onCreateTemplate: (template: NoteTemplate) => void;
  creating?: boolean;
}

export function NotesEmpty({
  variant,
  onCreateTemplate,
  creating = false,
}: NotesEmptyProps) {
  const { lang, t } = useLanguage();

  if (variant === "no-selection") {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <NotebookPen className="size-6" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {t("একটি নোট নির্বাচন করুন", "Select a note")}
        </h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {t(
            "বাম দিকের তালিকা থেকে একটি নোট বেছে নিন, অথবা নতুন নোট তৈরি করুন।",
            "Pick a note from the list, or create a new one to start writing."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center px-4 py-10 text-center">
      <div className="relative">
        <div className="absolute -left-6 -top-4 size-14 rotate-[-12deg] rounded-lg border border-amber-500/20 bg-amber-500/10" />
        <div className="absolute -right-7 -top-2 size-12 rotate-[10deg] rounded-lg border border-sky-500/20 bg-sky-500/10" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <NotebookPen className="size-7 text-primary" />
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">
        {t("আপনার প্রথম নোট লিখুন", "Write your first note")}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {t(
          "শব্দ, গ্রামার রুল, ক্লাসের পয়েন্ট বা যেকোনো কিছু লিখে রাখুন। সবকিছু আপনার অ্যাকাউন্টে সেভ থাকবে।",
          "Capture words, grammar rules, class points, or anything else. Everything stays saved to your account."
        )}
      </p>

      <div className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {NOTE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              type="button"
              disabled={creating}
              onClick={() => onCreateTemplate(template)}
              className="group flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {lang === "en" ? template.titleEn : template.titleBn}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {lang === "en"
                    ? template.descriptionEn
                    : template.descriptionBn}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
