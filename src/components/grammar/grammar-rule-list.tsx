"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
  type GrammarSection,
} from "@/data/grammar-data";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Sparkles,
  Link2,
  Eye,
  Check,
  RotateCcw,
  BookOpen,
  Layers,
  Lightbulb,
  AlertCircle,
  Zap,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_GUIDES, type CategoryGuideInfo } from "@/data/grammar-category-guide";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarRulePreviewModal } from "./grammar-rule-preview-modal";
import { GrammarSubcategorySidebar } from "./grammar-subcategory-sidebar";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

interface GrammarRuleListProps {
  category: GrammarCategory;
  rules: GrammarRule[];
  allCategories?: GrammarCategory[];
  guide?: CategoryGuideInfo;
  section?: GrammarSection;
}

export function GrammarRuleList({
  category,
  rules,
  allCategories = [],
  guide: propGuide,
  section,
}: GrammarRuleListProps) {
  const t = useT();
  const targetSectionSlug =
    section?.slug || category.sectionId || "parts-of-speech";
  const sectionTitleEn = section?.titleEn || "Parts of Speech";
  const sectionTitleBn =
    section?.titleBn?.split("(")[1]?.replace(")", "") || section?.titleBn || "পদ প্রকরণ";
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [previewRule, setPreviewRule] = useState<GrammarRule | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const {
    isCompleted,
    toggleCompleted,
    getCategoryStats,
    resetCategoryProgress,
  } = useGrammarProgress();

  const stats = getCategoryStats(rules);

  const filteredRules = rules.filter((rule) => {
    if (selectedDifficulty === "All") return true;
    return rule.difficulty === selectedDifficulty;
  });

  const difficultyColors: Record<
    DifficultyLevel,
    { badge: string; dot: string }
  > = {
    Beginner: {
      badge:
        "border-emerald-500/25 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      dot: "bg-emerald-500",
    },
    Intermediate: {
      badge:
        "border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      dot: "bg-amber-500",
    },
    Advanced: {
      badge:
        "border-rose-500/25 text-rose-600 dark:text-rose-400 bg-rose-500/10",
      dot: "bg-rose-500",
    },
  };

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  const guide = propGuide || CATEGORY_GUIDES[category.slug] || CATEGORY_GUIDES[category.id];

  const currentIndex = allCategories.findIndex(
    (c) => c.id === category.id || c.slug === category.slug
  );
  const prevCategory =
    currentIndex > 0 ? allCategories[currentIndex - 1] : null;
  const nextCategory =
    currentIndex >= 0 && currentIndex < allCategories.length - 1
      ? allCategories[currentIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumbs */}
      <GrammarBreadcrumb
        items={[
          {
            labelEn: sectionTitleEn,
            labelBn: sectionTitleBn,
            href: `/grammar/${targetSectionSlug}`,
          },
          { labelEn: category.titleEn, labelBn: titleBanglaRaw },
        ]}
      />

      {/* Mobile Companion Trigger (< lg screens) */}
      <div className="lg:hidden">
        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl hover:bg-card hover:border-primary/40 dark:border-white/[0.08] dark:bg-zinc-900/60 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>
                      {category.titleEn} {t("সহায়িকা ও পরিচিতি", "Companion & Facts")}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {stats.completedCount}/{stats.totalCount} {t("সম্পন্ন", "done")} • ~{rules.reduce((acc, r) => acc + (r.estimatedMinutes || 5), 0)} {t("মিনিট", "mins")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                <span>{t("তথ্য দেখুন", "View Facts")}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] rounded-t-2xl">
            <DrawerHeader className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] text-left">
              <DrawerTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>
                  {category.titleEn} {t("সহায়িকা ও ডায়াগনস্টিক তথ্য", "Companion & Diagnostics")}
                </span>
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-3 overflow-y-auto max-h-[calc(85vh-80px)]">
              <GrammarSubcategorySidebar
                category={category}
                rules={rules}
                allCategories={allCategories}
                guide={guide}
                sectionSlug={targetSectionSlug}
                sectionTitleEn={sectionTitleEn}
                sectionTitleBn={sectionTitleBn}
                className="border-0 shadow-none bg-transparent p-0 sm:p-0"
                onSelectCategory={() => setMobileDrawerOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Main Split Layout: Left Content + Right Companion Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left: Main Content (Category Header Hero & Rules List) */}
        <div className="space-y-6 min-w-0">
          {/* Category Header Hero */}
          <section className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-5 sm:p-7 dark:border-white/[0.08] dark:bg-zinc-900/60 space-y-5 shadow-xs">
        {/* Top Accent Gradient Bar */}
        <span
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
          aria-hidden
        />

        {/* Sibling Word Classes Switcher */}
        {allCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
            {allCategories.map((cat) => {
              const isActive = cat.slug === category.slug || cat.id === category.id;
              const catTitleBn =
                cat.titleBn.split("(")[1]?.replace(")", "") || cat.titleBn;
              return (
                <Link
                  key={cat.id}
                  href={`/grammar/${targetSectionSlug}/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    {cat.order}
                  </span>
                  <span>{cat.titleEn}</span>
                  <span className="text-[10px] opacity-75 font-bengali">
                    ({catTitleBn})
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Layers className="h-3.5 w-3.5" />
                <span>
                  {section ? t(sectionTitleBn, sectionTitleEn) : t("পদ প্রকরণ", "Parts of Speech")} • {t("শাখা", "Class")} {category.order}/{allCategories.length || 8}
                </span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {rules.length} {t("টি নিয়ম", rules.length === 1 ? "Rule" : "Rules")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2 flex-wrap">
              <span>{category.titleEn}</span>
              <span className="text-base sm:text-lg font-normal text-muted-foreground font-bengali">
                ({titleBanglaRaw})
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-foreground/90 font-medium">
              {guide ? t(guide.headlineBn, guide.headlineEn) : t(category.descriptionBn, category.descriptionEn)}
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {guide ? t(guide.overviewBn, guide.overviewEn) : t(category.descriptionBn, category.descriptionEn)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-start shrink-0">
            <Link
              href={`/grammar/${targetSectionSlug}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:border-white/[0.08] transition-colors shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{t(`সকল ${sectionTitleBn}`, `All ${sectionTitleEn}`)}</span>
            </Link>
          </div>
        </div>

        {/* Subcategory Educational Guide Tabs */}
        {guide && (
          <div className="rounded-xl border border-black/[0.06] bg-card/70 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <Tabs defaultValue="types" className="w-full space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{category.titleEn} {t("সংক্ষিপ্ত সহায়িকা", "Guide:")}</span>
                </span>

                <TabsList className="bg-muted/70 p-1 rounded-xl !h-auto flex flex-wrap gap-1">
                  <TabsTrigger
                    value="types"
                    className="rounded-lg px-2.5 py-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Layers className="h-3 w-3 text-sky-500" />
                    <span>{t("প্রধান প্রকারভেদ", "Key Types")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="roles-clues"
                    className="rounded-lg px-2.5 py-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    <span>{t("ভূমিকা ও চেনার উপায়", "Roles & Clues")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="traps"
                    className="rounded-lg px-2.5 py-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <AlertCircle className="h-3 w-3 text-rose-500" />
                    <span>{t("সাধারণ ভুল", "Common Trap")}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Types Bento */}
              <TabsContent value="types" className="m-0 outline-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {guide.keyTypes.map((type, idx) => {
                    const nameEn = type.nameEn || (type as any).name || "";
                    const nameBn = type.nameBn || (type as any).bangla || "";
                    const descEn = type.descriptionEn || (type as any).description || "";
                    const descBn = type.descriptionBn || (type as any).description || "";

                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-black/[0.06] bg-background/80 p-3 space-y-1.5 dark:border-white/[0.08]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {nameEn}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bengali">
                            {nameBn}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {t(descBn, descEn)}
                        </p>
                        {Array.isArray(type.examples) && type.examples.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {type.examples.map((ex, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 font-mono font-normal"
                              >
                                {ex}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Tab 2: Roles in Sentence & Identification Hacks */}
              <TabsContent value="roles-clues" className="m-0 space-y-3 outline-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Sentence Roles */}
                  <div className="rounded-lg border border-black/[0.06] bg-background/80 p-3.5 space-y-2 dark:border-white/[0.08]">
                    <span className="text-xs font-bold text-foreground block">
                      {t("বাক্যে ব্যবহারের অবস্থানসমূহ:", "Positions & Roles in a Sentence:")}
                    </span>
                    <div className="space-y-2">
                      {guide.sentenceRoles.map((role, idx) => {
                        const roleEn = role.roleEn || (role as any).role || "";
                        const roleBn = role.roleBn || (role as any).banglaRole || "";
                        const example = role.exampleSentence || (role as any).example || "";
                        const targetWord = role.targetWord || (role as any).explanation || "";

                        return (
                          <div key={idx} className="text-xs space-y-0.5 border-l-2 border-primary/40 pl-2">
                            <span className="text-[11px] font-semibold text-primary block">
                              {t(roleBn, roleEn)}
                            </span>
                            <p className="text-xs font-medium text-foreground">
                              {example && targetWord && example.includes(targetWord) ? (
                                <>
                                  &quot;{example.split(targetWord).map((part: string, i: number, arr: string[]) => (
                                    <span key={i}>
                                      {part}
                                      {i < arr.length - 1 && (
                                        <span className="underline decoration-primary font-bold text-primary">
                                          {targetWord}
                                        </span>
                                      )}
                                    </span>
                                  ))}&quot;
                                </>
                              ) : (
                                <span>&quot;{example}&quot;</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Identification Hacks */}
                  <div className="rounded-lg border border-black/[0.06] bg-background/80 p-3.5 space-y-2.5 dark:border-white/[0.08]">
                    <span className="text-xs font-bold text-foreground block">
                      {t("সহজে চেনার উপায় ও প্রশ্ন:", "Diagnostic Question & Identification Clues:")}
                    </span>
                    <div className="rounded-md bg-muted/60 p-2 text-xs font-semibold text-foreground">
                      {t(guide.identificationHacks.questionBn, guide.identificationHacks.questionEn)}
                    </div>
                    {(guide.identificationHacks.clueBn || guide.identificationHacks.clueEn) && (
                      <p className="text-xs text-muted-foreground">
                        {t(guide.identificationHacks.clueBn, guide.identificationHacks.clueEn)}
                      </p>
                    )}
                    {Array.isArray(guide.identificationHacks.suffixes) && guide.identificationHacks.suffixes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          {t("সাধারণ প্রত্যয় (Suffixes):", "Common Suffix Endings:")}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {guide.identificationHacks.suffixes.map((sfx, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] font-mono px-1.5 py-0"
                            >
                              {sfx}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Common Trap */}
              <TabsContent value="traps" className="m-0 outline-hidden">
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.03] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {t(
                        guide.commonTrap.titleBn || (guide.commonTrap as any).reality || "সতর্কতা",
                        guide.commonTrap.titleEn || (guide.commonTrap as any).misconception || "Common Trap"
                      )}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-rose-500/20 bg-background/80 p-2.5 space-y-1">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                        ❌ {t("ভুল প্রয়োগ", "Incorrect")}
                      </span>
                      <p className="line-through text-muted-foreground font-mono">
                        {guide.commonTrap.incorrect || (guide.commonTrap as any).testSentence}
                      </p>
                    </div>
                    <div className="rounded-md border border-emerald-500/20 bg-background/80 p-2.5 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        ✔️ {t("সঠিক প্রয়োগ", "Correct")}
                      </span>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        {guide.commonTrap.correct || (guide.commonTrap as any).reality}
                      </p>
                    </div>
                  </div>
                  {(guide.commonTrap.explanationBn || guide.commonTrap.explanationEn || (guide.commonTrap as any).explanation) && (
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      {t(
                        guide.commonTrap.explanationBn || (guide.commonTrap as any).explanation || "",
                        guide.commonTrap.explanationEn || (guide.commonTrap as any).explanation || ""
                      )}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Next / Prev Word Class Navigation */}
        {(prevCategory || nextCategory) && (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs">
            {prevCategory ? (
              <Link
                href={`/grammar/${targetSectionSlug}/${prevCategory.slug}`}
                className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>
                  {t("পূর্ববর্তী পদ:", "Previous Class:")} {prevCategory.titleEn}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextCategory && (
              <Link
                href={`/grammar/${targetSectionSlug}/${nextCategory.slug}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary/80 transition-colors group ml-auto"
              >
                <span>
                  {t("পরবর্তী পদ:", "Next Class:")} {nextCategory.titleEn}
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Rules List Section (One Frame Grid Pattern) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
              {category.titleEn} {t("এর নিয়মাবলি", "Rules & Lessons")}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({rules.length})
            </span>
          </div>

          {/* Filter by Level */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(
              (level) => {
                const count =
                  level === "All"
                    ? rules.length
                    : rules.filter((r) => r.difficulty === level).length;

                if (level !== "All" && count === 0) return null;

                const isActive = selectedDifficulty === level;

                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{level === "All" ? t("সব", "All") : level}</span>
                    <span
                      className={cn(
                        "rounded-md px-1 py-0.2 text-[10px]",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/[0.1] bg-card/40 p-8 text-center dark:border-white/[0.1]">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t(
                "এই লেভেলের অধীনে কোনো নিয়ম পাওয়া যায়নি।",
                "No rules found for the selected difficulty level."
              )}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
            <StaggerContainer className="flex flex-col">
              {filteredRules.map((rule) => {
                const colors = difficultyColors[rule.difficulty];
                const completed = isCompleted(rule.id);
                const hasPrereq = rule.prerequisiteRuleIds.length > 0;
                const hasRelated = rule.relatedRuleIds.length > 0;

                return (
                  <StaggerItem
                    key={rule.id}
                    className={cn(
                      "group relative border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                      completed
                        ? "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]"
                        : "hover:bg-black/[0.02] active:bg-black/[0.03] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
                    )}
                  >
                    {/* Left: Metadata, Title & Description */}
                    <div className="space-y-1.5 sm:pr-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                          {rule.order}
                        </span>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5",
                            colors.badge
                          )}
                        >
                          {rule.difficulty}
                        </Badge>

                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {rule.estimatedMinutes} {t("মিনিট", "min read")}
                          </span>
                        </span>

                        {completed && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3 mr-0.5" />
                            <span>{t("সম্পন্ন", "Completed")}</span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                        className="block group-hover:text-primary transition-colors pt-0.5"
                      >
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {rule.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground font-bengali">
                          {rule.titleBn}
                        </p>
                      </Link>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t(rule.shortDescriptionBn, rule.shortDescriptionEn)}
                      </p>

                      {(hasPrereq || hasRelated) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                          {hasPrereq && (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              <span>
                                {rule.prerequisiteRuleIds.length} {t("টি পূর্বশর্ত", "Prerequisite")}
                              </span>
                            </span>
                          )}
                          {hasRelated && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Link2 className="h-3 w-3" />
                              <span>
                                {rule.relatedRuleIds.length} {t("টি সম্পর্কিত", "Related")}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/[0.06] dark:border-white/[0.08]">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewRule(rule)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>{t("প্রিভিউ", "Preview")}</span>
                      </Button>

                      <Link
                        href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-2xs"
                        aria-label={t("পাঠটি পড়ুন", "Read lesson")}
                      >
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </section>
        </div>

        {/* Right: Sticky Desktop Companion Sidebar */}
        <div className="hidden lg:block sticky top-20 z-10">
          <GrammarSubcategorySidebar
            category={category}
            rules={rules}
            allCategories={allCategories}
            guide={guide}
            sectionSlug={targetSectionSlug}
            sectionTitleEn={sectionTitleEn}
            sectionTitleBn={sectionTitleBn}
          />
        </div>
      </div>

      {/* Quick Preview Modal */}
      <GrammarRulePreviewModal
        rule={previewRule}
        open={Boolean(previewRule)}
        onOpenChange={(open) => !open && setPreviewRule(null)}
        isCompleted={previewRule ? isCompleted(previewRule.id) : false}
        onToggleCompleted={toggleCompleted}
      />
    </div>
  );
}

