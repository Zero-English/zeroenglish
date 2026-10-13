"use client";

import { useState } from "react";
import Link from "next/link";
import { type GrammarCategory, type GrammarSection } from "@/data/grammar-data";

const getTokenColorClass = (color?: string) => {
  switch (color) {
    case "pink": return "text-pink-600 dark:text-pink-400";
    case "blue": return "text-blue-600 dark:text-blue-400";
    case "rose": return "text-rose-600 dark:text-rose-400";
    case "amber": return "text-amber-600 dark:text-amber-400";
    case "violet": return "text-violet-600 dark:text-violet-400";
    case "cyan": return "text-cyan-600 dark:text-cyan-400";
    case "emerald": return "text-emerald-600 dark:text-emerald-400";
    case "teal": return "text-teal-600 dark:text-teal-400";
    default: return "text-muted-foreground";
  }
};
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
  section?: GrammarSection;
}

export function PartsOfSpeechOverview({
  categories,
  section,
}: PartsOfSpeechOverviewProps) {
  const t = useT();
  const totalRules = categories.reduce((sum, c) => sum + c.ruleCount, 0);
  const guide = section?.learningGuide;
  const hasGoldenRule = Boolean(guide?.goldenRule);
  const hasCoreRoles = Boolean(guide?.coreRoles && guide.coreRoles.length > 0);
  const hasSentenceAnatomy = Boolean(guide?.sentenceAnatomy);
  const hasGuide = Boolean(section?.hasLearningGuide && (hasGoldenRule || hasCoreRoles || hasSentenceAnatomy));

  const defaultTab = hasGoldenRule ? "golden-rule" : hasCoreRoles ? "four-roles" : "sentence-anatomy";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const isPartsOfSpeech = !section || section.slug === "parts-of-speech";
  const sectionTitleBn =
    section?.titleBn || "পদ প্রকরণ (Parts of Speech)";
  const sectionTitleEn =
    section?.titleEn || "Parts of Speech (The 8 Word Classes)";
  const sectionDescBn =
    section?.descriptionBn ||
    "ইংরেজি ভাষায় প্রতিটি অর্থপূর্ণ শব্দ বাক্যে তার ব্যাকরণগত কাজ ও ভূমিকার ভিত্তিতে এই ৮টি ভিন্ন শ্রেণিতে ভাগ করা হয়। সঠিক বাক্য গঠন, সাবজেক্ট-ভার্ব এগ্রিমেন্ট ও শুদ্ধ ইংরেজি ভাব প্রকাশের মূল চাবিকাঠি হলো পদের সঠিক ব্যবহার জানা।";
  const sectionDescEn =
    section?.descriptionEn ||
    "In the English language, every single word belongs to one of eight core word classes based on its syntactic function. Mastering parts of speech establishes the bedrock for grammatical accuracy, verb agreement, and fluent sentence construction.";

  const breadcrumbLabelBn =
    section?.titleBn?.split("(")[1]?.replace(")", "") || section?.titleBn || "পদ প্রকরণ";
  const breadcrumbLabelEn = section?.titleEn || "Parts of Speech";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <GrammarBreadcrumb
        items={[{ labelEn: breadcrumbLabelEn, labelBn: breadcrumbLabelBn }]}
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
              <span>
                {section?.badgeText
                  ? t("মডিউল", section.badgeText)
                  : t("ব্যাকরণ মূলভিত্তি", "Grammar Foundation")}
              </span>
            </span>
            <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04] font-mono">
              {categories.length}{" "}
              {isPartsOfSpeech
                ? t("টি শ্রেণি", "Word Classes")
                : t("টি ক্যাটাগরি", "Categories")}{" "}
              • {totalRules} {t("টি নিয়ম", "Interactive Rules")}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t(sectionTitleBn, sectionTitleEn)}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {t(sectionDescBn, sectionDescEn)}
          </p>
        </div>

        {/* Interactive Pedagogical Tabs: Displayed dynamically for any section with a configured Learning Guide */}
        {hasGuide && (
          <div className="border-t border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-6 bg-black/[0.015] dark:bg-white/[0.015]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{t("শেখার সহায়িকা:", "Learning Guide:")}</span>
                </span>

                <TabsList className="bg-muted/70 p-1 rounded-xl !h-auto flex flex-wrap gap-1">
                  {hasGoldenRule && (
                    <TabsTrigger
                      value="golden-rule"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>{t(guide?.goldenRule?.titleBn?.split(":")[0] || "সোনালী নিয়ম", "The Golden Rule")}</span>
                    </TabsTrigger>
                  )}
                  {hasCoreRoles && (
                    <TabsTrigger
                      value="four-roles"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <LayoutGrid className="h-3.5 w-3.5 text-sky-500" />
                      <span>{t(`${guide?.coreRoles?.length || 4}টি মূল ভূমিকা`, `${guide?.coreRoles?.length || 4} Core Roles`)}</span>
                    </TabsTrigger>
                  )}
                  {hasSentenceAnatomy && (
                    <TabsTrigger
                      value="sentence-anatomy"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      <Split className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{t("বাক্য ব্যবচ্ছেদ", "Sentence Anatomy")}</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Tab 1: The Golden Rule (Core Principle) */}
              {hasGoldenRule && guide?.goldenRule && (
                <TabsContent value="golden-rule" className="m-0 space-y-3.5 outline-hidden">
                  <div className="rounded-xl border border-black/[0.06] bg-card/80 p-4 sm:p-5 dark:border-white/[0.08] space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className={cn(ICON_CHIP, "text-amber-500 bg-amber-500/10 ring-amber-500/20")}>
                        <Lightbulb className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {t(guide.goldenRule.titleBn, guide.goldenRule.titleEn)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {t(guide.goldenRule.descriptionBn, guide.goldenRule.descriptionEn)}
                        </p>
                      </div>
                    </div>

                    {guide.goldenRule.examples && guide.goldenRule.examples.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {guide.goldenRule.examples.map((ex, idx) => {
                          const colors = [
                            { border: "border-blue-500/20", bg: "bg-blue-500/[0.04]", badgeBg: "bg-blue-500/10", badgeText: "text-blue-600 dark:text-blue-400" },
                            { border: "border-rose-500/20", bg: "bg-rose-500/[0.04]", badgeBg: "bg-rose-500/10", badgeText: "text-rose-600 dark:text-rose-400" },
                            { border: "border-amber-500/20", bg: "bg-amber-500/[0.04]", badgeBg: "bg-amber-500/10", badgeText: "text-amber-600 dark:text-amber-400" },
                          ];
                          const c = colors[idx % colors.length];
                          return (
                            <div key={idx} className={cn("rounded-lg border p-3 space-y-1", c.border, c.bg)}>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-foreground">{ex.word}</span>
                                <Badge variant="outline" className={cn(c.badgeBg, c.badgeText, "border-transparent text-[10px] px-1.5 py-0 font-semibold")}>
                                  {t(ex.badgeBn, ex.badgeEn)}
                                </Badge>
                              </div>
                              <p className="text-xs font-medium text-foreground">
                                &quot;{ex.sentence}&quot;
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t(ex.explanationBn, ex.explanationEn)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(guide.goldenRule.proTipEn || guide.goldenRule.proTipBn) && (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary shrink-0" />
                        <p>
                          <strong className="text-foreground">{t("প্রো টিপ:", "Pro Tip:")} </strong>
                          {t(guide.goldenRule.proTipBn || "", guide.goldenRule.proTipEn || "")}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Tab 2: Core Roles Framework */}
              {hasCoreRoles && guide?.coreRoles && (
                <TabsContent value="four-roles" className="m-0 space-y-3.5 outline-hidden">
                  <div className="rounded-xl border border-black/[0.06] bg-card/80 overflow-hidden dark:border-white/[0.08] shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] dark:divide-white/[0.08]">
                      {guide.coreRoles.slice(0, 2).map((role, idx) => (
                        <div key={idx} className="p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono">
                              {role.number || idx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-foreground">
                              {t(role.titleBn, role.titleEn)}
                            </h4>
                          </div>
                          {role.badges && role.badges.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {role.badges.map((b, bi) => (
                                <Badge key={bi} variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border-0">
                                  {b}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t(role.descriptionBn, role.descriptionEn)}
                          </p>
                          {role.examples && (
                            <p className="text-[11px] font-mono text-muted-foreground/80">
                              {role.examples}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {guide.coreRoles.length > 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] dark:divide-white/[0.08] border-t border-black/[0.06] dark:border-white/[0.08]">
                        {guide.coreRoles.slice(2).map((role, idx) => (
                          <div key={idx} className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
                                {role.number || idx + 3}
                              </span>
                              <h4 className="text-xs font-bold text-foreground">
                                {t(role.titleBn, role.titleEn)}
                              </h4>
                            </div>
                            {role.badges && role.badges.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {role.badges.map((b, bi) => (
                                  <Badge key={bi} variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border-0">
                                    {b}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {t(role.descriptionBn, role.descriptionEn)}
                            </p>
                            {role.examples && (
                              <p className="text-[11px] font-mono text-muted-foreground/80">
                                {role.examples}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Tab 3: Sentence Anatomy Strip */}
              {hasSentenceAnatomy && guide?.sentenceAnatomy && (
                <TabsContent value="sentence-anatomy" className="m-0 space-y-3.5 outline-hidden">
                  <div className="rounded-xl border border-black/[0.06] bg-card/80 p-4 sm:p-5 dark:border-white/[0.08] space-y-3 shadow-2xs">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Split className="h-4 w-4 text-emerald-500" />
                        <span>{t(guide.sentenceAnatomy.titleBn, guide.sentenceAnatomy.titleEn)}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t(guide.sentenceAnatomy.descriptionBn, guide.sentenceAnatomy.descriptionEn)}
                      </p>
                    </div>

                    {guide.sentenceAnatomy.tokens && guide.sentenceAnatomy.tokens.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 p-3.5 sm:p-4 rounded-xl border border-black/[0.06] bg-background/80 dark:border-white/[0.08]">
                        {guide.sentenceAnatomy.tokens.map((token, ti) => {
                          const tokenColorClass = getTokenColorClass(token.color);
                          return (
                            <div key={ti} className="flex flex-col items-center">
                              <span className={cn("font-bold text-xs sm:text-sm", tokenColorClass)}>
                                {token.word}
                              </span>
                              <span className={cn("text-[9px] font-mono font-bold uppercase", tokenColorClass)}>
                                {token.tag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(guide.sentenceAnatomy.translationEn || guide.sentenceAnatomy.translationBn) && (
                      <p className="text-xs text-muted-foreground italic font-bengali">
                        {t(guide.sentenceAnatomy.translationBn, guide.sentenceAnatomy.translationEn)}
                      </p>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* Footer Prompt Strip */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>
              {section
                ? t(
                    `নিচের ${categories.length}টি ক্যাটাগরি থেকে যেকোনো একটি নির্বাচন করে বিস্তারিত নিয়ম শিখুন।`,
                    `Select any of the ${categories.length} categories below to study its rules and examples.`
                  )
                : t(
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
            <span>{t("শুরু করতে একটি শ্রেণি নির্বাচন করুন", "Select a Category to Begin")}</span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {categories.length} {t("টি ক্যাটাগরি", "Categories")}
          </span>
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
          {categories.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                {t("এই সেকশনের পাঠ শীঘ্রই যুক্ত হবে", "Categories Coming Soon")}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {t(
                  "এই সেকশনের আওতাধীন ক্যাটাগরি ও নিয়মাবলি দ্রুত যুক্ত করা হবে।",
                  "Educational categories and grammar rules for this section are being prepared."
                )}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
              {categories.map((category) => (
                <StaggerItem key={category.id}>
                  <GrammarCategoryCard
                    category={category}
                    sectionSlug={section?.slug || "parts-of-speech"}
                    isGridCell={true}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
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
