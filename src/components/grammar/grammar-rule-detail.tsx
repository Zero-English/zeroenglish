"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  RotateCcw,
  ListTree,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarDependencyList } from "./grammar-dependency-list";
import { GrammarTimelineSidebar } from "./grammar-timeline-sidebar";
import { useGrammarProgress } from "@/lib/grammar-progress";
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
}

export function GrammarRuleDetail({
  category,
  rule,
  categoryRules = [],
  prerequisites,
  relatedRules,
  navigation,
}: GrammarRuleDetailProps) {
  const [activeTab, setActiveTab] = useState<"all" | "en" | "bn">("all");
  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    isCompleted,
    toggleCompleted,
    markVisited,
    getCategoryStats,
    progress,
  } = useGrammarProgress();

  const rulesList = categoryRules.length > 0 ? categoryRules : [rule];
  const completed = isCompleted(rule.id);
  const completedTimestamp = progress.completedTimestamps[rule.id];
  const stats = getCategoryStats(rulesList);

  useEffect(() => {
    markVisited(rule.id);
  }, [rule.id, markVisited]);

  const difficultyColors: Record<DifficultyLevel, { badge: string; dot: string }> = {
    Beginner: {
      badge: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      dot: "bg-emerald-500",
    },
    Intermediate: {
      badge: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      dot: "bg-amber-500",
    },
    Advanced: {
      badge: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10",
      dot: "bg-rose-500",
    },
  };

  const handleToggleComplete = () => {
    const isNowCompleted = toggleCompleted(rule.id);
    if (isNowCompleted) {
      toast.success("Lesson marked as completed! Timeline updated.", {
        description: navigation.nextRule
          ? `Ready for next: ${navigation.nextRule.titleEn}`
          : "You completed this grammar unit!",
      });
    } else {
      toast.info("Lesson marked as incomplete.");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard!");
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header / Breadcrumbs & Global Lesson Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <GrammarBreadcrumb
          items={[
            {
              labelEn: "Parts of Speech",
              labelBn: "পদ প্রকরণ",
              href: "/grammar/parts-of-speech",
            },
            {
              labelEn: category.titleEn,
              labelBn: category.titleBn,
              href: `/grammar/parts-of-speech/${category.slug}`,
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
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            )}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500 fill-emerald-500/20" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>Mark as Done</span>
              </>
            )}
          </Button>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Copy link to rule"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Timeline Toggle Bar (< lg screens) */}
      <div className="lg:hidden">
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/50 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2 text-left">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ListTree className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Lesson {navigation.currentIndex} of {navigation.totalRules}</span>
                    <span className="text-muted-foreground font-normal">
                      • {category.titleEn} Timeline
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Progress: {stats.completedCount}/{stats.totalCount} completed ({stats.percent}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span>View Timeline</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 overflow-y-auto">
            <SheetHeader className="p-4 border-b border-border/60">
              <SheetTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                {category.titleEn} Timeline
              </SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <GrammarTimelineSidebar
                category={category}
                rules={rulesList}
                currentRuleSlug={rule.slug}
                className="border-0 shadow-none"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Split Layout: Timeline Sidebar + Rule Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-4 items-start">
        {/* Left: Sticky Desktop Timeline Sidebar */}
        <div className="hidden lg:block sticky top-20">
          <GrammarTimelineSidebar
            category={category}
            rules={rulesList}
            currentRuleSlug={rule.slug}
          />
        </div>

        {/* Right: Comprehensive Lesson Content */}
        <main className="space-y-8 min-w-0">
          {/* Previously Completed Banner if already completed */}
          {completed && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    You previously completed this lesson!
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Great job! You can review the key rules below or advance to the next rule in the timeline.
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
                    href={`/grammar/parts-of-speech/${navigation.nextRule.categorySlug}/${navigation.nextRule.slug}`}
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Hero Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/grammar/parts-of-speech/${category.slug}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <Layers className="h-3 w-3" />
                {category.titleEn}
              </Link>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold",
                  difficultyColors[rule.difficulty].badge
                )}
              >
                {rule.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {rule.estimatedMinutes} min study time
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Rule {navigation.currentIndex} of {navigation.totalRules}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {rule.titleEn}
              </h1>
              <p className="mt-1 text-lg sm:text-xl font-medium text-muted-foreground font-bengali">
                {rule.titleBn}
              </p>
            </div>

            {/* Introduction Cards */}
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                {rule.introduction.en}
              </p>
              <div className="rounded-lg bg-muted/50 p-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-bengali border-l-2 border-primary/60">
                <strong className="text-foreground font-medium block mb-1">
                  সহজ সারসংক্ষেপ:
                </strong>
                {rule.introduction.bn}
              </div>
            </div>
          </div>

          {/* Prerequisite Alert if any */}
          {prerequisites.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm flex-1">
                <h4 className="font-semibold text-foreground">
                  Prerequisite Recommendation
                </h4>
                <p className="text-muted-foreground">
                  This rule builds on fundamental concepts from{" "}
                  {prerequisites.map((p, idx) => (
                    <span key={p.id}>
                      {idx > 0 && ", "}
                      <Link
                        href={`/grammar/parts-of-speech/${p.categorySlug}/${p.slug}`}
                        className="font-medium text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:opacity-80"
                      >
                        {p.titleEn}
                      </Link>
                    </span>
                  ))}
                  . Feel free to review if needed!
                </p>
              </div>
            </div>
          )}

          {/* Core Rules & Explanation Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Rules & Mechanics
                </h2>
              </div>

              {/* Bilingual view filter pills */}
              <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Bilingual
                </button>
                <button
                  onClick={() => setActiveTab("en")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    activeTab === "en"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTab("bn")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    activeTab === "bn"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Formula / Pattern box */}
            {rule.explanation.formulaOrPattern && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Core Formula / Pattern</span>
                </div>
                <div className="font-mono text-sm sm:text-base font-semibold text-foreground bg-card/80 p-3 rounded-lg border border-primary/20">
                  {rule.explanation.formulaOrPattern}
                </div>
              </div>
            )}

            {/* Explanation Summary */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
              {(activeTab === "all" || activeTab === "en") && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    English Overview
                  </h3>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {rule.explanation.summaryEn}
                  </p>
                </div>
              )}

              {(activeTab === "all" || activeTab === "bn") && (
                <div
                  className={
                    activeTab === "all" ? "pt-3 border-t border-border/60" : ""
                  }
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    সহজ বাংলা ব্যাখ্যা
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/90 font-bengali leading-relaxed">
                    {rule.explanation.summaryBn}
                  </p>
                </div>
              )}
            </div>

            {/* Key Rules Breakdown */}
            {rule.explanation.keyRules.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Detailed Rule Points
                </h3>
                <div className="grid gap-3">
                  {rule.explanation.keyRules.map((keyRule, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-border/80 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="space-y-1 flex-1">
                          {(activeTab === "all" || activeTab === "en") && (
                            <p className="text-sm font-semibold text-foreground">
                              {keyRule.ruleEn}
                            </p>
                          )}
                          {(activeTab === "all" || activeTab === "bn") && (
                            <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                              {keyRule.ruleBn}
                            </p>
                          )}
                        </div>
                      </div>

                      {(keyRule.exampleEn || keyRule.exampleBn) && (
                        <div className="ml-7 rounded-lg bg-muted/40 px-3 py-2 text-xs space-y-0.5 border border-border/40">
                          {keyRule.exampleEn && (
                            <div className="font-mono text-foreground font-medium">
                              <span className="text-muted-foreground font-sans mr-1">
                                Ex:
                              </span>
                              {keyRule.exampleEn}
                            </div>
                          )}
                          {keyRule.exampleBn && (
                            <div className="text-muted-foreground font-bengali">
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

          {/* Contextual Examples */}
          {rule.examples.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Contextual Examples
                </h2>
                <span className="text-xs text-muted-foreground">
                  (উদাহরণ ও শব্দের প্রয়োগ)
                </span>
              </div>

              <div className="grid gap-3.5">
                {rule.examples.map((example) => (
                  <div
                    key={example.id}
                    className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2.5 transition-all hover:border-emerald-500/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {example.badge || "Example Sentence"}
                      </span>
                    </div>

                    <div className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                      {renderHighlightedSentence(
                        example.sentenceEn,
                        example.highlights
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                      {example.sentenceBn}
                    </p>

                    {(example.noteEn || example.noteBn) && (
                      <div className="pt-2 mt-2 border-t border-border/60 flex items-start gap-2 text-xs text-muted-foreground">
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

          {/* Common Mistakes & Traps */}
          {rule.commonMistakes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Common Mistakes & Exam Traps
                </h2>
                <span className="text-xs text-muted-foreground">
                  (সাধারণ ভুলত্রুটি)
                </span>
              </div>

              <div className="grid gap-3.5">
                {rule.commonMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-5 space-y-2.5"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{mistake.mistakeEn}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground font-bengali pl-5">
                        {mistake.mistakeBn}
                      </p>
                    </div>

                    <div className="pl-5 text-xs text-muted-foreground space-y-1 border-l-2 border-rose-500/30 ml-2">
                      <p>
                        <strong className="text-foreground">Why it happens: </strong>
                        {mistake.whyEn}{" "}
                        <span className="font-bengali">({mistake.whyBn})</span>
                      </p>
                      <p className="pt-1 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        <span className="text-foreground font-sans font-medium">
                          Correct usage:{" "}
                        </span>
                        {mistake.correctionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisite Knowledge (if any) */}
          {prerequisites.length > 0 && (
            <section className="pt-4 border-t border-border/60 space-y-4">
              <GrammarDependencyList prerequisites={prerequisites} />
            </section>
          )}

          {/* Prev / Next Pagination Bar with Completion Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
            {navigation.prevRule ? (
              <Link
                href={`/grammar/parts-of-speech/${navigation.prevRule.categorySlug}/${navigation.prevRule.slug}`}
                className="group flex items-center gap-3 text-left w-full sm:w-auto"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Previous Rule
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {navigation.prevRule.titleEn}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={completed ? "outline" : "default"}
                size="sm"
                onClick={handleToggleComplete}
                className={cn(
                  "text-xs font-semibold",
                  completed
                    ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                {completed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Mark as Done
                  </>
                )}
              </Button>

              <Link
                href={`/grammar/parts-of-speech/${category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                All {category.titleEn}
              </Link>
            </div>

            {navigation.nextRule ? (
              <Link
                href={`/grammar/parts-of-speech/${navigation.nextRule.categorySlug}/${navigation.nextRule.slug}`}
                className="group flex items-center gap-3 text-right justify-end w-full sm:w-auto"
              >
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Next Rule
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {navigation.nextRule.titleEn}
                  </span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
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
