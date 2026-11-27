"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
  type GrammarSection,
} from "@/data/grammar-data";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CATEGORY_GUIDES, type CategoryGuideInfo } from "@/data/grammar-category-guide";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-[24px] sm:rounded-[26px] border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#1c1c1e] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)]";

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
    section?.titleBn?.split("(")[1]?.replace(")", "") ||
    section?.titleBn ||
    "পদ প্রকরণ";

  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const { isCompleted, toggleCompleted, getCategoryStats } =
    useGrammarProgress();

  const stats = getCategoryStats(rules);
  const totalRules = rules.length;
  const completedRulesCount = stats.completedCount;
  const progressPercent =
    totalRules > 0 ? Math.round((completedRulesCount / totalRules) * 100) : 0;

  const filteredRules = useMemo(() => {
    if (selectedDifficulty === "All") return rules;
    return rules.filter((rule) => rule.difficulty === selectedDifficulty);
  }, [rules, selectedDifficulty]);

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  const guide =
    propGuide ||
    CATEGORY_GUIDES[category.slug] ||
    CATEGORY_GUIDES[category.id];

  // Sibling categories index
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
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-7">
        {/* Breadcrumb Navigation */}
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

        {/* ========================================================= */}
        {/* TOPIC HERO (Learn What Matters)                           */}
        {/* ========================================================= */}
        <header className={cn(CARD, "p-5 sm:p-7 space-y-4")}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                  {category.titleEn}
                </h1>
                <span className="text-xs sm:text-sm font-medium text-[#242423]/50 dark:text-zinc-400 font-bengali">
                  ({titleBanglaRaw})
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#242423]/60 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {t(category.descriptionBn, category.descriptionEn)}
              </p>
            </div>

            {/* Focused Single Progress Metric */}
            <div className="shrink-0 self-start sm:self-auto text-left sm:text-right">
              <span className="text-xs font-semibold tabular-nums text-[#1c1c1e] dark:text-[#f4f4f5]">
                {completedRulesCount} / {totalRules}{" "}
                <span className="font-normal text-[#242423]/50 dark:text-zinc-400">
                  {t("সম্পন্ন", "done")}
                </span>
              </span>
              <div className="mt-1.5 h-1.5 w-32 sm:w-36 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Optional Topic Reference Guide Trigger (Keeps Hero Quiet) */}
          {guide && (
            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-[#242423]/50 dark:text-zinc-400">
                {t("অধ্যায়ের সারাংশ ও নিয়মাবলী নিচে সাজানো রয়েছে।", "Curriculum lessons arranged below.")}
              </span>

              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] hover:underline cursor-pointer"
              >
                <Info className="size-3.5" />
                <span>{t("সহায়িকা ও প্রকারভেদ দেখুন", "View Quick Guide")}</span>
              </button>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* 3. RULES & LESSONS DECK                                   */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                {category.titleEn} {t("এর নিয়মাবলি", "Rules & Lessons")}
              </h2>
              <span className="text-xs font-semibold tabular-nums text-[#242423]/50 dark:text-zinc-400">
                ({filteredRules.length})
              </span>
            </div>

            {/* Difficulty Level Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
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
                        "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                        isActive
                          ? "bg-[#1c1c1e] text-white dark:bg-white dark:text-[#1c1c1e] shadow-2xs"
                          : "bg-black/[0.04] text-[#242423]/60 hover:text-[#1c1c1e] dark:bg-white/[0.06] dark:text-zinc-400 dark:hover:text-zinc-100"
                      )}
                    >
                      <span>{level === "All" ? t("সব", "All") : level}</span>
                      <span className="ml-1 opacity-60 tabular-nums">({count})</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {filteredRules.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-black/[0.1] bg-white/40 p-8 text-center dark:border-white/[0.1] dark:bg-[#1c1c1e]/40">
              <p className="text-xs sm:text-sm text-[#242423]/60 dark:text-zinc-400">
                {t(
                  "এই লেভেলের অধীনে কোনো নিয়ম পাওয়া যায়নি।",
                  "No rules found for the selected difficulty level."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <StaggerContainer className="space-y-3">
                {filteredRules.map((rule) => {
                  const completed = isCompleted(rule.id);

                  return (
                    <StaggerItem key={rule.id}>
                      <div
                        className={cn(
                          "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] sm:rounded-[22px] border border-black/[0.06] bg-white p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] transition-all duration-150 hover:shadow-md hover:border-black/[0.1] dark:hover:border-white/[0.14] active:scale-[0.99]"
                        )}
                      >
                        {/* Left: Metadata, Title & Description */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[#242423]/40 dark:text-zinc-500">
                              0{rule.order}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCompleted(rule.id);
                              }}
                              className="cursor-pointer"
                              title={
                                completed
                                  ? t("অসম্পূর্ণ মার্ক করুন", "Mark incomplete")
                                  : t("সম্পন্ন মার্ক করুন", "Mark complete")
                              }
                            >
                              {completed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="size-3.5" />
                                  <span>{t("সম্পন্ন", "Done")}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#242423]/40 dark:text-zinc-500 hover:text-[#1c1c1e]">
                                  <Circle className="size-3.5" />
                                  <span>{t("শেখা বাকি", "Study")}</span>
                                </span>
                              )}
                            </button>

                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                                rule.difficulty === "Beginner" &&
                                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                                rule.difficulty === "Intermediate" &&
                                  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                                rule.difficulty === "Advanced" &&
                                  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                              )}
                            >
                              {rule.difficulty}
                            </span>

                            {rule.estimatedMinutes && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#242423]/45 dark:text-zinc-500 tabular-nums">
                                <Clock className="size-3" />
                                <span>{rule.estimatedMinutes} {t("মিনিট", "min")}</span>
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                            className="block group-hover:underline"
                          >
                            <h3 className="text-base sm:text-[17px] font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                              {rule.titleEn}
                            </h3>
                            <p className="text-xs text-[#242423]/50 dark:text-zinc-400 font-bengali">
                              {rule.titleBn}
                            </p>
                          </Link>

                          <p className="text-xs sm:text-[13px] text-[#242423]/60 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {t(rule.shortDescriptionBn, rule.shortDescriptionEn)}
                          </p>
                        </div>

                        {/* Right: Direct Study CTA */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <Link
                            href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-[#1c1c1e] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1c1c1e] px-4 py-2 text-xs font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] transition-all"
                          >
                            <span>{t("পাঠ শুরু করুন", "Study Rule")}</span>
                            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. PREV / NEXT TOPIC FOOTER NAVIGATION                    */}
        {/* ========================================================= */}
        {(prevCategory || nextCategory) && (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] text-xs">
            {prevCategory ? (
              <Link
                href={`/grammar/${targetSectionSlug}/${prevCategory.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-[#242423]/60 hover:text-[#1c1c1e] dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <ChevronLeft className="size-3.5" />
                <span>
                  {t("পূর্ববর্তী বিষয়:", "Previous:")} {prevCategory.titleEn}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextCategory && (
              <Link
                href={`/grammar/${targetSectionSlug}/${nextCategory.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] hover:underline transition-colors ml-auto"
              >
                <span>
                  {t("পরবর্তী বিষয়:", "Next:")} {nextCategory.titleEn}
                </span>
                <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. TOPIC REFERENCE GUIDE DIALOG (On Demand)               */}
        {/* ========================================================= */}
        {guide && (
          <Dialog open={guideModalOpen} onOpenChange={setGuideModalOpen}>
            <DialogContent
              showCloseButton={false}
              className="max-w-md sm:max-w-xl rounded-[28px] sm:rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
                    {category.titleEn} {t("সহায়িকা", "Quick Guide")}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[#242423]/55 dark:text-zinc-400 mt-0.5">
                    {t(guide.headlineBn, guide.headlineEn)}
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30] cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4 pt-3 text-xs leading-relaxed">
                {/* Overview */}
                <div className="rounded-[16px] bg-[#f1f1ef] dark:bg-[#252528] p-3.5 space-y-1">
                  <h4 className="font-bold text-[#1c1c1e] dark:text-[#f4f4f5]">
                    {t("মূল ধারণা (Overview)", "Core Concept")}
                  </h4>
                  <p className="text-[#242423]/70 dark:text-zinc-300">
                    {t(guide.overviewBn, guide.overviewEn)}
                  </p>
                </div>

                {/* Key Types */}
                {guide.keyTypes && guide.keyTypes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#242423]/50 dark:text-zinc-400">
                      {t("প্রধান প্রকারভেদ (Key Types)", "Key Types")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {guide.keyTypes.map((kt, i) => (
                        <div
                          key={i}
                          className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] p-3 space-y-1 bg-white/50 dark:bg-[#252528]/50"
                        >
                          <div className="font-bold text-[#1c1c1e] dark:text-[#f4f4f5]">
                            {kt.nameEn}{" "}
                            <span className="font-normal font-bengali text-[#242423]/50 dark:text-zinc-400">
                              ({kt.nameBn})
                            </span>
                          </div>
                          <p className="text-[11px] text-[#242423]/60 dark:text-zinc-400">
                            {t(kt.descriptionBn, kt.descriptionEn)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
