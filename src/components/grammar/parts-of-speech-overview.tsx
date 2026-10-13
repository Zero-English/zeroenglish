"use client";

import { useState } from "react";
import Link from "next/link";
import { type GrammarCategory } from "@/data/grammar-data";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarCategoryCard } from "./grammar-category-card";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { useT } from "@/components/language-provider";
import {
  LayoutGrid,
  ArrowLeft,
  Layers,
  Sparkles,
  Lightbulb,
  Zap,
  Split,
  MessageSquareQuote,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CARD =
  "relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

interface PartsOfSpeechOverviewProps {
  categories: GrammarCategory[];
}

export function PartsOfSpeechOverview({ categories }: PartsOfSpeechOverviewProps) {
  const t = useT();
  const totalRules = categories.reduce((sum, c) => sum + c.ruleCount, 0);
  const [activeTab, setActiveTab] = useState("golden-rule");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <GrammarBreadcrumb
        items={[{ labelEn: "Parts of Speech", labelBn: "পদ প্রকরণ" }]}
      />

      {/* Comprehensive Parent Category Hero Section */}
      <section className={cn(CARD, "overflow-hidden")}>
        {/* Top Accent Gradient Bar */}
        <span
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
          aria-hidden
        />

        {/* Hero Header & Core Definition */}
        <div className="p-5 sm:p-7 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              <span>{t("ব্যাকরণ মূলভিত্তি", "Grammar Foundation")}</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04] font-mono">
              8 {t("টি শ্রেণি", "Word Classes")} • {totalRules} {t("টি নিয়ম", "Interactive Rules")}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("পদ প্রকরণ (Parts of Speech)", "Parts of Speech (The 8 Word Classes)")}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {t(
              "ইংরেজি ভাষায় প্রতিটি অর্থপূর্ণ শব্দ বাক্যে তার ব্যাকরণগত কাজ ও ভূমিকার ভিত্তিতে এই ৮টি ভিন্ন শ্রেণিতে ভাগ করা হয়। সঠিক বাক্য গঠন, সাবজেক্ট-ভার্ব এগ্রিমেন্ট ও শুদ্ধ ইংরেজি ভাব প্রকাশের মূল চাবিকাঠি হলো পদের সঠিক ব্যবহার জানা।",
              "In the English language, every single word belongs to one of eight core word classes based on its syntactic function. Mastering parts of speech establishes the bedrock for grammatical accuracy, verb agreement, and fluent sentence construction."
            )}
          </p>
        </div>

        {/* Interactive Pedagogical Tabs: Golden Rule, 4 Roles, Sentence Anatomy */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-6 bg-black/[0.015] dark:bg-white/[0.015]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>{t("শেখার সহায়িকা:", "Learning Guide:")}</span>
              </span>

              <TabsList className="bg-muted/70 p-1 rounded-xl !h-auto flex flex-wrap gap-1">
                <TabsTrigger
                  value="golden-rule"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>{t("সোনালী নিয়ম", "The Golden Rule")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="four-roles"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <LayoutGrid className="h-3.5 w-3.5 text-sky-500" />
                  <span>{t("৪টি মূল ভূমিকা", "4 Core Roles")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sentence-anatomy"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <Split className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t("বাক্য ব্যবচ্ছেদ", "Sentence Anatomy")}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: The Golden Rule (Function over Form) */}
            <TabsContent value="golden-rule" className="m-0 space-y-3.5 outline-hidden">
              <div className="rounded-xl border border-black/[0.06] bg-card/80 p-4 sm:p-5 dark:border-white/[0.08] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className={cn(ICON_CHIP, "text-amber-500 bg-amber-500/10 ring-amber-500/20")}>
                    <Lightbulb className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t(
                        "সোনালী নিয়ম: শব্দের অর্থ নয়, বাক্যে কাজের ভূমিকাই মুখ্য",
                        "The Golden Rule: Function Determines Classification"
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "ইংরেজি ভাষায় কোনো শব্দ চিরতরে একটি নির্দিষ্ট পদে বাঁধা থাকে না। একই শব্দ বাক্যের ব্যবহারের ওপর ভিত্তি করে ভিন্ন পদে রূপান্তরিত হতে পারে।",
                        "In English, a word is rarely locked into a single part of speech forever. Its category is determined entirely by how it functions in that particular sentence."
                      )}
                    </p>
                  </div>
                </div>

                {/* Real-life Multi-role Example: "water" */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">water</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0 font-semibold">
                        Noun (বিশেষ্য)
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      &quot;I drink cold <span className="underline decoration-blue-500 font-semibold">water</span>.&quot;
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("তরল বা বস্তুর নাম হিসেবে ব্যবহৃত।", "Functioning as the name of a liquid/substance.")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.04] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">water</span>
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] px-1.5 py-0 font-semibold">
                        Verb (ক্রিয়া)
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      &quot;I <span className="underline decoration-rose-500 font-semibold">water</span> the plants daily.&quot;
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("গাছে পানি দেওয়ার কাজ বা অ্যাকশন।", "Functioning as the action of watering.")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">water</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0 font-semibold">
                        Adjective (বিশেষণ)
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      &quot;Bring me a <span className="underline decoration-amber-500 font-semibold">water</span> bottle.&quot;
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("বোতলটির বৈশিষ্ট্য বা প্রকার বর্ণনা করছে।", "Modifying and describing the noun 'bottle'.")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <p>
                    <strong className="text-foreground">{t("প্রো টিপ:", "Pro Tip:")} </strong>
                    {t(
                      "যেকোনো শব্দের পদ নির্ণয় করতে সর্বদা নিজেকে প্রশ্ন করুন: 'এই বাক্যে শব্দটি কী কাজ করছে?' (নাম বলছে, কাজ করছে, নাকি কোনো বর্ণনা দিচ্ছে?)",
                      "To identify any word's part of speech, always ask: 'What job is this word performing in this sentence?' (Naming, acting, modifying, or connecting?)"
                    )}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: 4 Core Roles Framework */}
            <TabsContent value="four-roles" className="m-0 space-y-3.5 outline-hidden">
              <div className="rounded-xl border border-black/[0.06] bg-card/80 overflow-hidden dark:border-white/[0.08] shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] dark:divide-white/[0.08]">
                  {/* Pillar 1: Naming & Identification */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono">
                        1
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("নাম ও বিকল্প (Naming & Identity)", "Naming & Identity")}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                        Noun
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                        Pronoun
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(
                        "বাক্যের মূল কর্তা বা কর্ম — কে বা কী সম্পর্কে আলোচনা হচ্ছে তা চিহ্নিত করে।",
                        "The primary subjects and objects — establishes who or what the sentence is about."
                      )}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground/80">
                      যেমন: Rahim, city, wisdom, he, they, someone
                    </p>
                  </div>

                  {/* Pillar 2: Action & Existence */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                        2
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("কাজ ও অবস্থা (Action & State)", "Action & State")}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0">
                        Verb
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(
                        "বাক্যের প্রাণকেন্দ্র — কোনো কাজ সম্পন্ন হওয়া, ঘটে থাকা বা অস্তিত্ব বোঝায়।",
                        "The core engine — expresses physical action, mental state, or existence. A sentence cannot exist without it."
                      )}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground/80">
                      যেমন: run, build, understand, is, become
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] dark:divide-white/[0.08] border-t border-black/[0.06] dark:border-white/[0.08]">
                  {/* Pillar 3: Descriptors & Modifiers */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
                        3
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("দোষ, গুণ ও রূপ (Modifiers)", "Modifiers & Descriptors")}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                        Adjective
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0">
                        Adverb
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(
                        "বিশেষ্য বা ক্রিয়াকে স্পষ্ট ও গভীর করে — কেমন, কতটা, কখন বা কোথায় তা জানায়।",
                        "Adds color, precision, degree, time, and manner to nouns, verbs, or clauses."
                      )}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground/80">
                      যেমন: brilliant, dangerous, quickly, very, often
                    </p>
                  </div>

                  {/* Pillar 4: Connectors & Expressions */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold font-mono">
                        4
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("সংযোগ ও অনুভূতি (Connectors)", "Connectors & Emotion")}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border-0">
                        Preposition
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-0">
                        Conjunction
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border-0">
                        Interjection
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(
                        "শব্দগুলোর মাঝে অবস্থানগত সম্পর্ক তৈরি করে, বাক্য জোড়া দেয় ও আবেগ প্রকাশ করে।",
                        "Maps spatial and temporal relationships, bridges clauses, and injects spontaneous emotion."
                      )}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground/80">
                      যেমন: in, under, because, but, wow!, alas!
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Sentence Anatomy Strip */}
            <TabsContent value="sentence-anatomy" className="m-0 space-y-3.5 outline-hidden">
              <div className="rounded-xl border border-black/[0.06] bg-card/80 p-4 sm:p-5 dark:border-white/[0.08] space-y-3 shadow-2xs">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Split className="h-4 w-4 text-emerald-500" />
                    <span>{t("একটি পূর্ণাঙ্গ বাক্যে ৮টি পদের সমন্বিত প্রয়োগ", "8 Word Classes Coordinating in One Sentence")}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "লক্ষ্য করুন: একটি পূর্ণাঙ্গ ভাব প্রকাশের জন্য বিভিন্ন শ্রেণির পদসমূহ কীভাবে পরস্পর সুসংগঠিতভাবে কাজ করে:",
                      "Observe how all distinct word classes coordinate harmoniously to deliver a complete, vivid idea:"
                    )}
                  </p>
                </div>

                {/* Visual Sentence Block with Color-coded Word Tags */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 p-3.5 sm:p-4 rounded-xl border border-black/[0.06] bg-background/80 dark:border-white/[0.08]">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-pink-600 dark:text-pink-400">Bravo!</span>
                    <span className="text-[9px] font-mono font-bold text-pink-600 dark:text-pink-400 uppercase">Interj</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-medium text-xs sm:text-sm text-muted-foreground">The</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Article</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">clever</span>
                    <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">Adjective</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">student</span>
                    <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">Noun</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400">solved</span>
                    <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">Verb</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-medium text-xs sm:text-sm text-muted-foreground">the</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Article</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">puzzle</span>
                    <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">Noun</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-violet-600 dark:text-violet-400">very</span>
                    <span className="text-[9px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">Adverb</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-violet-600 dark:text-violet-400">quickly</span>
                    <span className="text-[9px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase">Adverb</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">and</span>
                    <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">Conj</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400">shared</span>
                    <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">Verb</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">it</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Pronoun</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-teal-600 dark:text-teal-400">with</span>
                    <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase">Prep</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">us.</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Pronoun</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic font-bengali">
                  {t(
                    "বাংলা অনুবাদ: \"সাবাশ! চালাক শিক্ষার্থী ধাঁধাটি খুব দ্রুত সমাধান করল এবং আমাদের সাথে তা ভাগ করে নিল।\"",
                    "Translation: \"Bravo! The clever student solved the puzzle very quickly and shared it with us.\""
                  )}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Prompt Strip */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>
              {t(
                "নিচের ৮টি পদ থেকে যেকোনো একটি নির্বাচন করে বিস্তারিত নিয়ম ও উদাহরণ শিখুন।",
                "Select any of the 8 word classes below to master its comprehensive rules and practical usages."
              )}
            </span>
          </div>

          <span className="text-[11px] font-mono text-muted-foreground">
            {categories.length} {t("টি ক্যাটাগরি প্রস্তুত", "Categories Ready")}
          </span>
        </div>
      </section>

      {/* Subcategory One Frame Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>{t("শুরু করতে একটি পদ নির্বাচন করুন", "Select a Word Class to Begin")}</span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {categories.length} {t("টি ক্যাটাগরি", "Categories")}
          </span>
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <GrammarCategoryCard category={category} isGridCell={true} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Back to Overview link */}
      <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
        <Link
          href="/grammar"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("ব্যাকরণ ওভারভিউতে ফিরে যান", "Back to Grammar Overview")}</span>
        </Link>
      </div>
    </div>
  );
}
