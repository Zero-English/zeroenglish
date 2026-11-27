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
  Bookmark,
  ListTree,
  Split,
  BookMarked,
  HelpCircle,
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
  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    isCompleted,
    isBookmarked,
    toggleCompleted,
    toggleBookmark,
    markVisited,
    getCategoryStats,
  } = useGrammarProgress();

  const rulesList = categoryRules.length > 0 ? categoryRules : [rule];
  const completed = isCompleted(rule.id);
  const bookmarked = isBookmarked(rule.id);
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
      toast.success(t("পাঠটি সম্পন্ন হয়েছে!", "Lesson completed!"), {
        description: navigation.nextRule
          ? `${t("পরবর্তী পাঠ:", "Next up:")} ${navigation.nextRule.titleEn}`
          : t("আপনি এই ক্যাটাগরি সম্পন্ন করেছেন!", "You completed this grammar unit!"),
      });
    } else {
      toast.info(t("পাঠটি অসম্পূর্ণ হিসেবে চিহ্নিত করা হয়েছে।", "Lesson marked as incomplete."));
    }
  };

  const handleToggleBookmark = () => {
    const isNowBookmarked = toggleBookmark(rule.id);
    if (isNowBookmarked) {
      toast.success(t("রুলটি বুকমার্ক করা হয়েছে!", "Rule saved to bookmarks!"));
    } else {
      toast.info(t("বুকমার্ক থেকে সরানো হয়েছে।", "Removed from bookmarks."));
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
    if (!sentence) return "";
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
            className="inline-block rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20 border border-emerald-500/20"
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
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header / Breadcrumbs & Action Bar */}
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

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Quick Complete Button */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] shadow-2xs",
              completed
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500/20 text-emerald-500" />
                <span>{t("সম্পন্ন", "Completed")}</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{t("সম্পন্ন করুন", "Mark as Done")}</span>
              </>
            )}
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.98] shadow-2xs",
              bookmarked
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "border-black/[0.06] bg-card text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/[0.08]"
            )}
            title={bookmarked ? t("বুকমার্ক থেকে সরান", "Remove bookmark") : t("বুকমার্ক করুন", "Bookmark rule")}
          >
            <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-amber-500 text-amber-500")} />
            <span className="hidden xs:inline">{bookmarked ? t("সংরক্ষিত", "Saved") : t("বুকমার্ক", "Bookmark")}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/[0.08] transition-colors shadow-2xs active:scale-[0.98]"
            title={t("লিংক কপি করুন", "Copy link to rule")}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">{t("কপি হয়েছে", "Copied")}</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">{t("শেয়ার", "Share")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Lesson Roadmap Trigger (< lg screens) */}
      <div className="lg:hidden">
        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-[18px] border border-black/[0.06] bg-card/80 backdrop-blur-xl hover:bg-card dark:border-white/[0.08] transition-all shadow-xs"
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
                      • {category.titleEn}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {stats.completedCount} of {stats.totalCount} {t("সম্পন্ন", "completed")} ({stats.percent}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span>{t("সকল পাঠ", "Roadmap")}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] rounded-t-[24px]">
            <DrawerHeader className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] text-left">
              <DrawerTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>{category.titleEn} {t("পাঠতালিকা", "Curriculum")}</span>
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground text-left">
                {t(
                  "এই অধ্যায়ের সকল পাঠ ও অগ্রগতির তালিকা।",
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
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left: Sticky Desktop Timeline Sidebar */}
        <div className="hidden lg:block sticky top-20 z-10">
          <GrammarTimelineSidebar
            category={category}
            rules={rulesList}
            currentRuleSlug={rule.slug}
            sectionSlug={targetSectionSlug}
          />
        </div>

        {/* Right: Focused Lesson Content */}
        <main className="space-y-6 min-w-0">
          {/* Hero Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href={`/grammar/${targetSectionSlug}/${category.slug}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Layers className="h-3 w-3" />
                <span>{category.titleEn}</span>
              </Link>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
                  difficultyColors[rule.difficulty].badge
                )}
              >
                {rule.difficulty}
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3" />
                <span>{rule.estimatedMinutes} {t("মিনিট", "min")}</span>
              </span>
              <span className="text-muted-foreground font-mono text-[11px] ml-auto">
                {t("পাঠ", "Rule")} {navigation.currentIndex} / {navigation.totalRules}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {rule.titleEn}
              </h1>
              <p className="mt-1 text-base sm:text-lg font-medium text-muted-foreground font-bengali">
                {rule.titleBn}
              </p>
            </div>

            {/* Core Concept / Introduction Card */}
            <div className="rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl p-5 sm:p-6 space-y-3 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
              <p className="text-sm sm:text-base text-foreground leading-relaxed font-normal">
                {rule.introduction.en}
              </p>
              {rule.introduction.bn && (
                <div className="rounded-xl bg-[#f8f8f9] dark:bg-white/[0.04] p-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-bengali border-l-2 border-primary/50">
                  <span className="font-semibold text-foreground mr-1.5">
                    {t("সহজ ব্যাখ্যা:", "Key Takeaway:")}
                  </span>
                  {rule.introduction.bn}
                </div>
              )}
            </div>
          </div>

          {/* Prerequisite Alert if any */}
          {prerequisites.length > 0 && (
            <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3 shadow-2xs">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm flex-1">
                <h4 className="font-semibold text-foreground">
                  {t("পূর্বশর্তীয় সুপারিশ", "Prerequisite Concept")}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {t(
                    "এই পাঠটি ভালোভাবে বোঝার জন্য আগে নিচের বিষয়টি জেনে নেওয়া ভালো:",
                    "Before mastering this rule, review:"
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

          {/* Formula / Pattern Box (if available) */}
          {rule.explanation.formulaOrPattern && (
            <div className="rounded-[20px] border border-black/[0.06] bg-[#f8f8f9] dark:bg-zinc-900/60 p-4 sm:p-5 space-y-2 dark:border-white/[0.08] shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{t("মূল সূত্র / প্যাটার্ন", "Core Structure / Formula")}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-semibold text-foreground bg-white dark:bg-zinc-800 p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs overflow-x-auto">
                {rule.explanation.formulaOrPattern}
              </div>
            </div>
          )}

          {/* Rules & Mechanics Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                {t("নিয়ম ও প্রয়োগ কৌশল", "Rules & Principles")}
              </h2>
            </div>

            {/* Overview Card */}
            {(rule.explanation.summaryEn || rule.explanation.summaryBn) && (
              <div className="rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl p-5 space-y-3 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
                {rule.explanation.summaryEn && (
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      {t("নিয়ম সারসংক্ষেপ", "Rule Summary")}
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {rule.explanation.summaryEn}
                    </p>
                  </div>
                )}
                {rule.explanation.summaryBn && (
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                    <p className="text-xs sm:text-sm text-muted-foreground font-bengali leading-relaxed">
                      {rule.explanation.summaryBn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Key Rules Detailed Breakdown */}
            {rule.explanation.keyRules.length > 0 && (
              <div className="rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
                {rule.explanation.keyRules.map((keyRule, i) => (
                  <div
                    key={i}
                    className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 p-4 sm:p-5 space-y-2 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold font-mono">
                        {i + 1}
                      </span>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {keyRule.ruleEn}
                        </p>
                        {keyRule.ruleBn && (
                          <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                            {keyRule.ruleBn}
                          </p>
                        )}
                      </div>
                    </div>

                    {(keyRule.exampleEn || keyRule.exampleBn) && (
                      <div className="ml-9 rounded-xl bg-[#f8f8f9] dark:bg-white/[0.03] px-3.5 py-2.5 text-xs space-y-0.5 border border-black/[0.04] dark:border-white/[0.04]">
                        {keyRule.exampleEn && (
                          <div className="font-mono text-foreground font-medium text-xs">
                            <span className="text-muted-foreground font-sans mr-1.5 font-normal">
                              {t("উদাহরণ:", "Example:")}
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
            )}
          </section>

          {/* Contextual Examples */}
          {rule.examples.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("বাস্তব উদাহরণ ও বাক্যে প্রয়োগ", "Real-World Examples")}
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({rule.examples.length})
                </span>
              </div>

              <div className="rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {rule.examples.map((example) => {
                  const sentenceEn = example.sentenceEn || (example as any).en || "";
                  const sentenceBn = example.sentenceBn || (example as any).bn || "";
                  const noteEn = example.noteEn || (example as any).explanation || "";
                  const noteBn = example.noteBn || "";

                  return (
                    <div
                      key={example.id}
                      className="p-4 sm:p-5 space-y-2 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {example.badge && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {example.badge}
                        </span>
                      )}

                      <div className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                        {renderHighlightedSentence(sentenceEn, example.highlights || [])}
                      </div>

                      {sentenceBn && (
                        <p className="text-xs sm:text-sm text-muted-foreground font-bengali">
                          {sentenceBn}
                        </p>
                      )}

                      {(noteEn || noteBn) && (
                        <div className="pt-2 mt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-start gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                          <div>
                            {noteEn && <span>{noteEn} </span>}
                            {noteBn && (
                              <span className="font-bengali">
                                ({noteBn})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Common Mistakes & Traps */}
          {rule.commonMistakes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("সাধারণ ভুলত্রুটি ও সংশোধন", "Common Mistakes & Fixes")}
                </h2>
              </div>

              <div className="rounded-[22px] border border-rose-500/20 bg-rose-500/[0.02] overflow-hidden shadow-xs divide-y divide-rose-500/15">
                {rule.commonMistakes.map((mistake) => {
                  const mistakeEn = mistake.mistakeEn || (mistake as any).incorrect || "";
                  const mistakeBn = mistake.mistakeBn || (mistake as any).reasonBn || "";
                  const whyEn = mistake.whyEn || (mistake as any).reasonEn || "";
                  const whyBn = mistake.whyBn || (mistake as any).reasonBn || "";
                  const correctionEn = mistake.correctionEn || (mistake as any).correct || "";

                  return (
                    <div
                      key={mistake.id}
                      className="p-4 sm:p-5 space-y-3 hover:bg-rose-500/[0.04] transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        {/* Incorrect Box */}
                        <div className="rounded-xl border border-rose-500/20 bg-card p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                            <span className="text-sm">✕</span>
                            <span>{t("ভুল প্রয়োগ", "Incorrect")}</span>
                          </div>
                          <p className="font-medium text-foreground line-through decoration-rose-500/50">
                            {mistakeEn}
                          </p>
                          {mistakeBn && mistakeBn !== mistakeEn && (
                            <p className="text-[11px] text-muted-foreground font-bengali">
                              {mistakeBn}
                            </p>
                          )}
                        </div>

                        {/* Correct Box */}
                        <div className="rounded-xl border border-emerald-500/20 bg-card p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <Check className="h-3.5 w-3.5" />
                            <span>{t("সঠিক প্রয়োগ", "Correct")}</span>
                          </div>
                          <p className="font-semibold text-foreground">
                            {correctionEn}
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      {(whyEn || whyBn) && (
                        <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
                          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                          <p>
                            <span className="font-medium text-foreground mr-1">
                              {t("কেন এই ভুল হয়:", "Why:")}
                            </span>
                            {whyEn}{" "}
                            {whyBn && whyBn !== whyEn && (
                              <span className="font-bengali">({whyBn})</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Conceptual Comparisons & Contrasts (if any) */}
          {rule.comparisons && rule.comparisons.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Split className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("ধারণাগত তুলনা ও পার্থক্য", "Conceptual Comparisons")}
                </h2>
              </div>

              <div className="rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {rule.comparisons.map((comp) => {
                  const conceptA = (comp as any).conceptA || (comp as any).incorrect || "";
                  const conceptB = (comp as any).conceptB || (comp as any).correct || "";
                  const contrastEn = (comp as any).contrastEn || comp.explanationEn || (comp as any).explanation || "";
                  const contrastBn = (comp as any).contrastBn || comp.explanationBn || "";

                  return (
                    <div
                      key={comp.id}
                      className="p-4 sm:p-5 space-y-3 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-muted/40 p-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            {t("ধারণা ১", "Concept A")}
                          </span>
                          <p className="font-semibold text-foreground text-xs sm:text-sm">
                            {conceptA}
                          </p>
                        </div>
                        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-muted/40 p-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                            {t("ধারণা ২", "Concept B")}
                          </span>
                          <p className="font-semibold text-foreground text-xs sm:text-sm">
                            {conceptB}
                          </p>
                        </div>
                      </div>

                      {(contrastEn || contrastBn) && (
                        <div className="rounded-xl bg-[#f8f8f9] dark:bg-white/[0.03] p-3 text-xs space-y-1 border border-black/[0.04] dark:border-white/[0.04]">
                          {contrastEn && (
                            <p className="text-foreground leading-relaxed">
                              <strong className="text-muted-foreground mr-1">
                                {t("পার্থক্য:", "Difference:")}
                              </strong>
                              {contrastEn}
                            </p>
                          )}
                          {contrastBn && (
                            <p className="text-muted-foreground font-bengali leading-relaxed">
                              {contrastBn}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Prerequisites Component if any */}
          {prerequisites.length > 0 && (
            <section className="pt-2">
              <GrammarDependencyList prerequisites={prerequisites} />
            </section>
          )}

          {/* Prev / Next Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl p-4 sm:p-5 dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs">
            {navigation.prevRule ? (
              <Link
                href={`/grammar/${navigation.prevRule.sectionSlug || targetSectionSlug}/${navigation.prevRule.categorySlug}/${navigation.prevRule.slug}`}
                className="group flex items-center gap-3 text-left w-full sm:w-auto p-2 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-card group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary dark:border-white/[0.08] transition-all shadow-2xs">
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
                className="group flex items-center gap-3 text-right justify-end w-full sm:w-auto p-2 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    {t("পরবর্তী পাঠ", "Next Rule")}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {navigation.nextRule.titleEn}
                  </span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-card group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary dark:border-white/[0.08] transition-all shadow-2xs">
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ) : (
              <Link
                href={`/grammar/${targetSectionSlug}/${category.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline p-2"
              >
                <span>{t("অধ্যায় সমাপ্ত - তালিকায় ফিরুন", "Unit Completed · Return to Overview")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  </div>
  );
}
