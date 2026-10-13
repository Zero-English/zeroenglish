"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
  type GrammarSection,
} from "@/data/grammar-data";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ListTree,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarDependencyList } from "./grammar-dependency-list";
import { GrammarTimelineSidebar } from "./grammar-timeline-sidebar";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface GrammarRuleDetailProps {
  category: GrammarCategory;
  rule: GrammarRule;
  categoryRules?: GrammarRule[];
  prerequisites: GrammarRule[];
  relatedRules: GrammarRule[];
  navigation: {
    prevRule: GrammarRule | null;
    nextRule: GrammarRule | null;
    totalRules: number;
    currentIndex: number;
  };
  section?: GrammarSection;
}

export function GrammarRuleDetail({
  category,
  rule,
  categoryRules = [],
  prerequisites,
  relatedRules,
  navigation,
  section,
}: GrammarRuleDetailProps) {
  const t = useT();
  const targetSectionSlug =
    section?.slug || rule.sectionSlug || category.sectionId || "parts-of-speech";
  const sectionTitleEn = section?.titleEn || "Parts of Speech";
  const sectionTitleBn =
    section?.titleBn?.split("(")[1]?.replace(")", "") || section?.titleBn || "পদ প্রকরণ";
  const [activeTab, setActiveTab] = useState<"all" | "en" | "bn">("all");
  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    isCompleted,
    toggleCompleted,
    markVisited,
    getCategoryStats,
  } = useGrammarProgress();

  const rulesList = categoryRules.length > 0 ? categoryRules : [rule];
  const completed = isCompleted(rule.id);
  const stats = getCategoryStats(rulesList);

  useEffect(() => {
    markVisited(rule.id);
  }, [rule.id, markVisited]);

  const difficultyColors: Record<DifficultyLevel, { badge: string; dot: string }> = {
    Beginner: {
      badge: "border-emerald-500/25 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      dot: "bg-emerald-500",
    },
    Intermediate: {
      badge: "border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      dot: "bg-amber-500",
    },
    Advanced: {
      badge: "border-rose-500/25 text-rose-600 dark:text-rose-400 bg-rose-500/10",
      dot: "bg-rose-500",
    },
  };

  const handleToggleComplete = () => {
    const isNowCompleted = toggleCompleted(rule.id);
    if (isNowCompleted) {
      toast.success(t("পাঠটি সম্পন্ন হয়েছে!", "Lesson marked as completed!"), {
        description: navigation.nextRule
          ? `${t("পরবর্তী পাঠ:", "Next up:")} ${navigation.nextRule.titleEn}`
          : t("আপনি এই ক্যাটাগরি সম্পন্ন করেছেন!", "You completed this grammar unit!"),
      });
    } else {
      toast.info(t("পাঠটি অসম্পূর্ণ হিসেবে চিহ্নিত করা হয়েছে।", "Lesson marked as incomplete."));
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("লিংক কপি হয়েছে!", "Link copied to clipboard!"));
    }
  };

  // Function to highlight target words in sentence
  const renderHighlightedSentence = (sentence: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return sentence;

    const escaped = highlights
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const regex = new RegExp(`(${escaped})`, "gi");

    const parts = sentence.split(regex);

    return parts.map((part, i) => {
      const isMatch = highlights.some(
        (h) => h.toLowerCase() === part.toLowerCase()
      );

      if (isMatch) {
        return (
          <span
            key={i}
            className="inline-block rounded-md bg-primary/15 px-1.5 py-0.5 font-bold text-primary dark:bg-primary/25 border border-primary/20"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header / Breadcrumbs & Global Lesson Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
        <GrammarBreadcrumb
          items={[
            {
              labelEn: sectionTitleEn,
              labelBn: sectionTitleBn,
              href: `/grammar/${targetSectionSlug}`,
            },
            {
              labelEn: category.titleEn,
              labelBn: titleBanglaRaw,
              href: `/grammar/${targetSectionSlug}/${category.slug}`,
            },
            { labelEn: rule.titleEn, labelBn: rule.titleBn },
          ]}
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Complete Button */}
          <Button
            type="button"
            variant={completed ? "outline" : "default"}
            size="sm"
            onClick={handleToggleComplete}
            className={cn(
              "text-xs font-semibold transition-all",
              completed
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
            )}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500 fill-emerald-500/20" />
                <span>{t("সম্পন্ন", "Completed")}</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>{t("সম্পন্ন করুন", "Mark as Done")}</span>
              </>
            )}
          </Button>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-card/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/[0.08] transition-colors shadow-2xs"
            title={t("লিংক কপি করুন", "Copy link to rule")}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">{t("কপি হয়েছে!", "Copied!")}</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>{t("শেয়ার", "Share")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Timeline Toggle Bar (< lg screens) */}
      <div className="lg:hidden">
        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl hover:bg-card hover:border-primary/40 dark:border-white/[0.08] dark:bg-zinc-900/60 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                  <ListTree className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>
                      {t("পাঠ", "Lesson")} {navigation.currentIndex} / {navigation.totalRules}
                    </span>
                    <span className="text-muted-foreground font-normal">
                      • {category.titleEn} {t("টাইমলাইন", "Timeline")}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t("অগ্রগতি:", "Progress:")} {stats.completedCount}/{stats.totalCount}{" "}
                    {t("সম্পন্ন", "completed")} ({stats.percent}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span>{t("টাইমলাইন দেখুন", "View Timeline")}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] rounded-t-2xl">
            <DrawerHeader className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] text-left">
              <DrawerTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>{category.titleEn} {t("টাইমলাইন", "Timeline")}</span>
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground text-left">
                {t(
                  "এই অধ্যায়ের সকল পাঠ ও অগ্রগতির সময়রেখা।",
                  "Browse all rules and lessons in this category."
                )}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-3 overflow-y-auto max-h-[calc(85vh-90px)]">
              <GrammarTimelineSidebar
                category={category}
                rules={rulesList}
                currentRuleSlug={rule.slug}
                sectionSlug={targetSectionSlug}
                className="border-0 shadow-none bg-transparent"
                onSelectRule={() => setMobileDrawerOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Main Split Layout: Timeline Sidebar + Rule Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] xl:grid-cols-[330px_1fr] gap-6 items-start">
        {/* Left: Sticky Desktop Timeline Sidebar */}
        <div className="hidden lg:block sticky top-20 z-10">
          <GrammarTimelineSidebar
            category={category}
            rules={rulesList}
            currentRuleSlug={rule.slug}
            sectionSlug={targetSectionSlug}
          />
        </div>

        {/* Right: Comprehensive Lesson Content */}
        <main className="space-y-6 min-w-0">
          {/* Previously Completed Banner if already completed */}
          {completed && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 text-xs sm:text-sm shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {t("আপনি পূর্বে এই পাঠটি সম্পন্ন করেছেন!", "You previously completed this lesson!")}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "দারুণ! আপনি মূল নিয়মগুলো পুনরায় দেখতে পারেন বা পরবর্তী পাঠে এগিয়ে যেতে পারেন।",
                      "Great job! You can review the key rules below or advance to the next rule in the timeline."
                    )}
                  </p>
                </div>
              </div>

              {navigation.nextRule && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="hidden sm:inline-flex shrink-0 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Link
                    href={`/grammar/${navigation.nextRule.sectionSlug || targetSectionSlug}/${navigation.nextRule.categorySlug}/${navigation.nextRule.slug}`}
                  >
                    <span>{t("পরবর্তী পাঠ", "Next Lesson")}</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Hero Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/grammar/${targetSectionSlug}/${category.slug}`}
                className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Layers className="h-3 w-3" />
                <span>{category.titleEn}</span>
              </Link>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5",
                  difficultyColors[rule.difficulty].badge
                )}
              >
                {rule.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {rule.estimatedMinutes} {t("মিনিট অধ্যয়ন", "min study time")}
                </span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {t("পাঠ", "Rule")} {navigation.currentIndex} / {navigation.totalRules}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {rule.titleEn}
              </h1>
              <p className="mt-1 text-base sm:text-lg font-medium text-muted-foreground font-bengali">
                {rule.titleBn}
              </p>
            </div>

            {/* Introduction Container */}
            <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-4 sm:p-5 space-y-3 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {rule.introduction.en}
              </p>
              <div className="rounded-xl bg-primary/[0.04] p-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-bengali border-l-2 border-primary/60">
                <strong className="text-primary font-semibold block mb-0.5">
                  {t("সহজ সারসংক্ষেপ:", "Quick Summary:")}
                </strong>
                {rule.introduction.bn}
              </div>
            </div>
          </div>

          {/* Prerequisite Alert if any */}
          {prerequisites.length > 0 && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4 flex items-start gap-3 shadow-2xs">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm flex-1">
                <h4 className="font-semibold text-foreground">
                  {t("পূর্বশর্তীয় সুপারিশ", "Prerequisite Recommendation")}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "এই নিয়মটি বোঝার আগে নিচের মৌলিক বিষয়গুলো পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে:",
                    "This rule builds on fundamental concepts from"
                  )}{" "}
                  {prerequisites.map((p, idx) => (
                    <span key={p.id}>
                      {idx > 0 && ", "}
                      <Link
                        href={`/grammar/${p.sectionSlug || targetSectionSlug}/${p.categorySlug}/${p.slug}`}
                        className="font-semibold text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:opacity-85"
                      >
                        {p.titleEn}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              </div>
            </div>
          )}

          {/* Core Rules & Explanation Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("নিয়ম ও প্রয়োগ কৌশল", "Rules & Mechanics")}
                </h2>
              </div>

              {/* Bilingual view filter pills */}
              <div className="flex items-center rounded-lg border border-black/[0.06] bg-muted/40 p-0.5 text-xs dark:border-white/[0.08]">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors text-xs",
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("দ্বিভাষিক", "Bilingual")}
                </button>
                <button
                  onClick={() => setActiveTab("en")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors text-xs",
                    activeTab === "en"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTab("bn")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors text-xs",
                    activeTab === "bn"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Formula / Pattern box */}
            {rule.explanation.formulaOrPattern && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t("মূল সূত্র / প্যাটার্ন", "Core Formula / Pattern")}</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-foreground bg-card/90 p-3 rounded-xl border border-primary/15 shadow-2xs">
                  {rule.explanation.formulaOrPattern}
                </div>
              </div>
            )}

            {/* Explanation Summary */}
            <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-4 sm:p-5 space-y-3 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
              {(activeTab === "all" || activeTab === "en") && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    English Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    {rule.explanation.summaryEn}
                  </p>
                </div>
              )}

              {(activeTab === "all" || activeTab === "bn") && (
                <div
                  className={
                    activeTab === "all" ? "pt-3 border-t border-black/[0.06] dark:border-white/[0.08]" : ""
                  }
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                    সহজ বাংলা ব্যাখ্যা
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/90 font-bengali leading-relaxed">
                    {rule.explanation.summaryBn}
                  </p>
                </div>
              )}
            </div>

            {/* Key Rules Breakdown (One Frame Grid Pattern) */}
            {rule.explanation.keyRules.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  {t("বিস্তারিত নিয়মাবলি", "Detailed Rule Points")}
                </h3>

                <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
                  {rule.explanation.keyRules.map((keyRule, i) => (
                    <div
                      key={i}
                      className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 p-4 sm:p-5 space-y-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                          {i + 1}
                        </span>
                        <div className="space-y-1 flex-1">
                          {(activeTab === "all" || activeTab === "en") && (
                            <p className="text-xs sm:text-sm font-semibold text-foreground">
                              {keyRule.ruleEn}
                            </p>
                          )}
                          {(activeTab === "all" || activeTab === "bn") && (
                            <p className="text-xs text-muted-foreground font-bengali">
                              {keyRule.ruleBn}
                            </p>
                          )}
                        </div>
                      </div>

                      {(keyRule.exampleEn || keyRule.exampleBn) && (
                        <div className="ml-8 rounded-xl bg-muted/40 px-3 py-2 text-xs space-y-0.5 border border-border/50">
                          {keyRule.exampleEn && (
                            <div className="font-mono text-foreground font-medium text-xs">
                              <span className="text-muted-foreground font-sans mr-1">
                                Ex:
                              </span>
                              {keyRule.exampleEn}
                            </div>
                          )}
                          {keyRule.exampleBn && (
                            <div className="text-muted-foreground font-bengali text-xs">
                              {keyRule.exampleBn}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Contextual Examples (One Frame Grid Pattern) */}
          {rule.examples.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("বাস্তব উদাহরণ ও বাক্যে প্রয়োগ", "Contextual Examples")}
                </h2>
                <span className="text-xs text-muted-foreground font-bengali">
                  ({rule.examples.length} {t("টি উদাহরণ", "examples")})
                </span>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
                {rule.examples.map((example) => (
                  <div
                    key={example.id}
                    className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 p-4 sm:p-5 space-y-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {example.badge || t("বাক্য প্রয়োগ", "Example Sentence")}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                      {renderHighlightedSentence(
                        example.sentenceEn,
                        example.highlights
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                      {example.sentenceBn}
                    </p>

                    {(example.noteEn || example.noteBn) && (
                      <div className="pt-2 mt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-start gap-2 text-xs text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          {example.noteEn && <span>{example.noteEn} </span>}
                          {example.noteBn && (
                            <span className="font-bengali">
                              ({example.noteBn})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Common Mistakes & Traps (One Frame Warning Pattern) */}
          {rule.commonMistakes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("কমন ভুলত্রুটি ও সতর্কবার্তা", "Common Mistakes & Traps")}
                </h2>
                <span className="text-xs text-muted-foreground font-bengali">
                  (সাধারণ ভুলত্রুটি)
                </span>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] overflow-hidden shadow-xs">
                {rule.commonMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    className="border-t border-rose-500/15 first:border-t-0 p-4 sm:p-5 space-y-2 hover:bg-rose-500/[0.06] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>{mistake.mistakeEn}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground font-bengali pl-5">
                        {mistake.mistakeBn}
                      </p>
                    </div>

                    <div className="pl-5 text-xs text-muted-foreground space-y-1 border-l-2 border-rose-500/30 ml-1.5">
                      <p>
                        <strong className="text-foreground">
                          {t("কেন এই ভুল হয়:", "Why it happens:")}{" "}
                        </strong>
                        {mistake.whyEn}{" "}
                        <span className="font-bengali">({mistake.whyBn})</span>
                      </p>
                      <p className="pt-0.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-xs">
                        <span className="text-foreground font-sans font-medium">
                          {t("সঠিক প্রয়োগ:", "Correct usage:")}{" "}
                        </span>
                        {mistake.correctionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisite Knowledge Component if any */}
          {prerequisites.length > 0 && (
            <section className="pt-2">
              <GrammarDependencyList prerequisites={prerequisites} />
            </section>
          )}

          {/* Prev / Next Pagination Bar with Completion Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-4 sm:p-5 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
            {navigation.prevRule ? (
              <Link
                href={`/grammar/${navigation.prevRule.sectionSlug || targetSectionSlug}/${navigation.prevRule.categorySlug}/${navigation.prevRule.slug}`}
                className="group flex items-center gap-2.5 text-left w-full sm:w-auto"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary dark:border-white/[0.08] transition-all shadow-2xs">
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    {t("পূর্ববর্তী পাঠ", "Previous Rule")}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {navigation.prevRule.titleEn}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {navigation.nextRule ? (
              <Link
                href={`/grammar/${navigation.nextRule.sectionSlug || targetSectionSlug}/${navigation.nextRule.categorySlug}/${navigation.nextRule.slug}`}
                className="group flex items-center gap-2.5 text-right justify-end w-full sm:w-auto"
              >
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    {t("পরবর্তী পাঠ", "Next Rule")}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {navigation.nextRule.titleEn}
                  </span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary dark:border-white/[0.08] transition-all shadow-2xs">
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

