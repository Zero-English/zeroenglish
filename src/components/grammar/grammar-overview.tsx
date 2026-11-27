"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  type GrammarSection,
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import {
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowUpDown,
  RotateCcw,
  Layers,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GrammarSectionCard } from "./grammar-section-card";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

export type GrammarStatusFilter = "all" | "completed" | "uncompleted";
export type GrammarSortOption = "default" | "az" | "za";

const CARD =
  "rounded-[24px] sm:rounded-[26px] border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#1c1c1e] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)]";

interface GrammarOverviewProps {
  sections: GrammarSection[];
  categories: GrammarCategory[];
  allRules: GrammarRule[];
}

export function GrammarOverview({
  sections,
  categories,
  allRules,
}: GrammarOverviewProps) {
  const t = useT();
  const { progress } = useGrammarProgress();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] =
    useState<GrammarStatusFilter>("all");
  const [sortOption, setSortOption] = useState<GrammarSortOption>("default");

  // Filter Dialog Modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Pending filter state for dialog
  const [pendingSection, setPendingSection] = useState(selectedSection);
  const [pendingDifficulty, setPendingDifficulty] =
    useState(selectedDifficulty);
  const [pendingStatus, setPendingStatus] = useState(selectedStatus);
  const [pendingSort, setPendingSort] = useState(sortOption);

  const openFilterModal = () => {
    setPendingSection(selectedSection);
    setPendingDifficulty(selectedDifficulty);
    setPendingStatus(selectedStatus);
    setPendingSort(sortOption);
    setFilterModalOpen(true);
  };

  const applyPendingFilters = () => {
    setSelectedSection(pendingSection);
    setSelectedDifficulty(pendingDifficulty);
    setSelectedStatus(pendingStatus);
    setSortOption(pendingSort);
    setFilterModalOpen(false);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedSection("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
    setSortOption("default");
    setPendingSection("all");
    setPendingDifficulty("all");
    setPendingStatus("all");
    setPendingSort("default");
  };

  // Has active filters
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSection !== "all" ||
    selectedDifficulty !== "all" ||
    selectedStatus !== "all" ||
    sortOption !== "default";

  // Count active non-search filters
  const activeFilterCount =
    (selectedSection !== "all" ? 1 : 0) +
    (selectedDifficulty !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (sortOption !== "default" ? 1 : 0);

  // Overall progress
  const completedRulesCount = progress.completedRuleIds.length;
  const progressPercent =
    allRules.length > 0
      ? Math.round((completedRulesCount / allRules.length) * 100)
      : 0;

  // Filtered Sections
  const displayedSections = useMemo(() => {
    let list = sections.filter((sec) => {
      // 1. Section Filter
      if (
        selectedSection !== "all" &&
        sec.slug !== selectedSection &&
        sec.id !== selectedSection
      ) {
        return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "all") {
        const secRules = allRules.filter(
          (r) => r.sectionSlug === sec.slug || r.sectionSlug === sec.id,
        );
        const doneCount = secRules.filter((r) =>
          progress.completedRuleIds.includes(r.id),
        ).length;

        if (selectedStatus === "completed" && doneCount === 0) return false;
        if (
          selectedStatus === "uncompleted" &&
          doneCount === secRules.length &&
          secRules.length > 0
        )
          return false;
      }

      return true;
    });

    // Sort
    if (sortOption === "az") {
      list = [...list].sort((a, b) => a.titleEn.localeCompare(b.titleEn));
    } else if (sortOption === "za") {
      list = [...list].sort((a, b) => b.titleEn.localeCompare(a.titleEn));
    }

    return list;
  }, [
    sections,
    allRules,
    selectedSection,
    selectedStatus,
    sortOption,
    progress.completedRuleIds,
  ]);

  // Matching rules when user searches or filters by difficulty
  const isRuleSearchActive =
    searchQuery.trim() !== "" || selectedDifficulty !== "all";

  const matchingRules = useMemo(() => {
    if (!isRuleSearchActive) return [];

    return allRules.filter((rule) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          rule.titleEn.toLowerCase().includes(q) ||
          rule.titleBn.toLowerCase().includes(q) ||
          rule.slug.toLowerCase().includes(q) ||
          rule.categorySlug.toLowerCase().includes(q) ||
          (rule.shortDescriptionEn &&
            rule.shortDescriptionEn.toLowerCase().includes(q)) ||
          (rule.shortDescriptionBn &&
            rule.shortDescriptionBn.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Difficulty
      if (
        selectedDifficulty !== "all" &&
        rule.difficulty !== selectedDifficulty
      ) {
        return false;
      }

      // Section
      if (selectedSection !== "all") {
        const matchesSec =
          rule.sectionSlug === selectedSection ||
          categories.some(
            (c) =>
              (c.id === rule.categoryId || c.slug === rule.categorySlug) &&
              (c.sectionId === selectedSection ||
                sections.find((s) => s.slug === selectedSection)?.id ===
                  c.sectionId),
          );
        if (!matchesSec) return false;
      }

      // Status
      if (selectedStatus !== "all") {
        const isDone = progress.completedRuleIds.includes(rule.id);
        if (selectedStatus === "completed" && !isDone) return false;
        if (selectedStatus === "uncompleted" && isDone) return false;
      }

      return true;
    });
  }, [
    allRules,
    categories,
    sections,
    isRuleSearchActive,
    searchQuery,
    selectedDifficulty,
    selectedSection,
    selectedStatus,
    progress.completedRuleIds,
  ]);

  return (
    <div className="min-h-dvh bg-[#f8f8f6] dark:bg-[#0c0c0e] text-[#242423] dark:text-[#f4f4f5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-7">
        {/* ========================================================= */}
        {/* 1. QUIET HEADER WITH MASTERY STAT                         */}
        {/* ========================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
              {t("ইংরেজি ব্যাকরণ", "English Grammar")}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#242423]/60 dark:text-zinc-400 max-w-lg leading-relaxed">
              {t(
                "ইংরেজি ব্যাকরণের মৌলিক নিয়মাবলি, পদ প্রকরণ ও কাল সম্বন্ধীয় সহজ পাঠ।",
                "Structured lessons covering English parts of speech, tenses, sentence mechanics, and usage rules.",
              )}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-semibold tabular-nums text-[#1c1c1e] dark:text-[#f4f4f5]">
              {completedRulesCount} / {allRules.length}{" "}
              <span className="font-normal text-[#242423]/50 dark:text-zinc-400">
                {t("নিয়ম সম্পন্ন", "rules completed")}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-36 sm:w-44 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. VOCABULARY-STYLE SEARCH & FILTER BAR                   */}
        {/* ========================================================= */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-black/[0.06] bg-white p-2 shadow-xs dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-2.5">
            {/* Search Input Field */}
            <div className="relative min-w-[12rem] flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#242423]/40 dark:text-zinc-500"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "ব্যাকরণ নিয়ম বা অধ্যায় খুঁজুন...",
                  "Search grammar rules, sections, concepts...",
                )}
                aria-label={t("ব্যাকরণ নিয়ম খুঁজুন", "Search grammar rules")}
                className="h-9.5 w-full rounded-full border-0 bg-[#f1f1ef] pl-10 pr-4 text-[13px] font-medium text-[#242423] placeholder:text-[#242423]/40 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#242423]/30 dark:bg-[#252528] dark:text-[#f3f3f2] dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Filter Modal Trigger Button */}
            <button
              type="button"
              onClick={openFilterModal}
              className={cn(
                "inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-[12.5px] font-semibold transition-all active:scale-95",
                activeFilterCount > 0
                  ? "border-[#242423] bg-[#242423] text-white dark:border-white dark:bg-white dark:text-[#242423]"
                  : "border-black/[0.06] bg-[#f1f1ef] text-[#242423] hover:bg-[#eaeae8] dark:border-white/[0.08] dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2c2c30]",
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>{t("ফিল্টার", "Filter")}</span>
              {activeFilterCount > 0 && (
                <span
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                    "bg-white text-[#242423] dark:bg-[#1c1c1e] dark:text-[#f3f3f2]",
                  )}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex h-9.5 items-center gap-1 rounded-full px-3 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 active:scale-95 dark:text-rose-400 cursor-pointer"
                title={t("সব ফিল্টার মুছুন", "Clear all filters")}
              >
                <X className="size-3.5" />
                <span>{t("রিসেট", "Reset")}</span>
              </button>
            )}
          </div>

          {/* Quick Filter Status Pills (Desktop Quick Select) */}

          {/* Active Filter Quick-Dismiss Chips Strip */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 px-1 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#242423]/40 dark:text-zinc-500 mr-1">
                {t("সক্রিয় ফিল্টার:", "Active:")}
              </span>

              {/* Search query chip */}
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <X className="size-3 opacity-60" />
                </button>
              )}

              {/* Section chip */}
              {selectedSection !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedSection("all")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                  <span>
                    {sections.find((s) => s.slug === selectedSection)
                      ?.titleEn || selectedSection}
                  </span>
                  <X className="size-3 opacity-60" />
                </button>
              )}

              {/* Difficulty chip */}
              {selectedDifficulty !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedDifficulty("all")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                  <span>{selectedDifficulty}</span>
                  <X className="size-3 opacity-60" />
                </button>
              )}

              {/* Status chip */}
              {selectedStatus !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedStatus("all")}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 hover:bg-rose-50 hover:text-rose-600 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                  <span>
                    {selectedStatus === "completed"
                      ? t("সম্পন্ন", "Mastered")
                      : t("অসম্পূর্ণ", "In Progress")}
                  </span>
                  <X className="size-3 opacity-60" />
                </button>
              )}

              {/* Sort chip */}
              {sortOption !== "default" && (
                <button
                  type="button"
                  onClick={() => setSortOption("default")}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                  <span>{sortOption === "az" ? "A → Z" : "Z → A"}</span>
                  <X className="size-3 opacity-60" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. DYNAMIC RULE SEARCH RESULTS (If active rule query)     */}
        {/* ========================================================= */}
        {isRuleSearchActive && (
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-[#242423]/60 dark:text-zinc-400">
              <span className="font-medium">
                {t(
                  `${matchingRules.length}টি মিলে যাওয়া নিয়ম`,
                  `${matchingRules.length} matching rules`,
                )}
              </span>
            </div>

            {matchingRules.length > 0 ? (
              <div className={CARD}>
                <StaggerContainer className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {matchingRules.map((rule) => {
                    const isCompleted = progress.completedRuleIds.includes(
                      rule.id,
                    );
                    return (
                      <StaggerItem key={rule.id}>
                        <Link
                          href={`/grammar/${rule.sectionSlug || "parts-of-speech"}/${rule.categorySlug}/${rule.slug}`}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[#242423]/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="size-3.5" />
                                  <span>{t("সম্পন্ন", "Done")}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#242423]/40 dark:text-zinc-500">
                                  <Circle className="size-3" />
                                  <span>{t("শেখা বাকি", "Study")}</span>
                                </span>
                              )}
                              <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-[#242423]/70 dark:text-zinc-300 capitalize">
                                {rule.categorySlug}
                              </span>
                              <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10.5px] font-semibold">
                                {rule.difficulty}
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:underline">
                              {rule.titleEn}
                            </h3>

                            <p className="text-xs text-[#242423]/55 dark:text-zinc-400 font-bengali">
                              {rule.titleBn}
                            </p>

                            <p className="text-xs text-[#242423]/60 dark:text-zinc-400 line-clamp-1">
                              {t(
                                rule.shortDescriptionBn,
                                rule.shortDescriptionEn,
                              )}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] shrink-0 self-start sm:self-center">
                            <span>{t("পড়ুন", "Study")}</span>
                            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-black/[0.1] bg-white/40 p-8 text-center space-y-1 dark:border-white/[0.1] dark:bg-[#1c1c1e]/40">
                <p className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f4f4f5]">
                  {t(
                    "কোনো ব্যাকরণ নিয়ম পাওয়া যায়নি।",
                    "No matching grammar rules found.",
                  )}
                </p>
                <p className="text-xs text-[#242423]/50 dark:text-zinc-400">
                  {t(
                    "অন্য কোনো শব্দ দিয়ে খুঁজুন অথবা নিচের অধ্যায়গুলো দেখুন।",
                    "Try another search term or browse the curriculum sections below.",
                  )}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* 4. CURRICULUM SECTION CARDS                               */}
        {/* ========================================================= */}
        <section className="space-y-4 pt-1">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5]">
              {t("পাঠ্যক্রম অধ্যায়সমূহ", "Curriculum Sections")}
            </h2>

            <span className="text-xs font-semibold tabular-nums text-[#242423]/50 dark:text-zinc-400">
              {displayedSections.length} {t("টি অধ্যায়", "Sections")}
            </span>
          </div> */}

          {displayedSections.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-black/[0.1] bg-white/40 p-10 text-center space-y-1.5 dark:border-white/[0.1] dark:bg-[#1c1c1e]/40">
              <p className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f4f4f5]">
                {t(
                  "কোনো অধ্যায় পাওয়া যায়নি।",
                  "No sections match your filter.",
                )}
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#1c1c1e] text-white dark:bg-white dark:text-[#1c1c1e] px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <span>{t("ফিল্টার রিসেট করুন", "Reset Filters")}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {displayedSections.map((section) => {
                const sectionCompletedCount = allRules.filter(
                  (r) =>
                    (r.sectionSlug === section.slug ||
                      r.sectionSlug === section.id) &&
                    progress.completedRuleIds.includes(r.id),
                ).length;

                return (
                  <GrammarSectionCard
                    key={section.id}
                    section={section}
                    completedRulesCount={sectionCompletedCount}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. FILTER MODAL DIALOG (Matches /vocabulary/[level])      */}
        {/* ========================================================= */}
        <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DialogContent
            showCloseButton={false}
            className="max-w-md sm:max-w-lg rounded-[28px] sm:rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] max-h-[88vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                  {t("ব্যাকরণ ফিল্টার", "Filter Grammar")}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-[#242423]/55 dark:text-zinc-400">
                  {t(
                    "অধ্যায়, কঠিনতার মাত্রা ও শেখার স্ট্যাটাস নির্বাচন করুন।",
                    "Refine lessons by section, level, and study status.",
                  )}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30] cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-5 pt-3">
              {/* 1. Study Status */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                  <CheckCircle2 className="size-3.5" />
                  <span>{t("শেখার স্ট্যাটাস", "Study Status")}</span>
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "all", label: "All Rules", labelBn: "সব নিয়ম" },
                    {
                      value: "uncompleted",
                      label: "In Progress",
                      labelBn: "অসম্পূর্ণ",
                    },
                    {
                      value: "completed",
                      label: "Mastered",
                      labelBn: "সম্পন্ন",
                    },
                  ].map((st) => {
                    const isActive = pendingStatus === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() =>
                          setPendingStatus(st.value as GrammarStatusFilter)
                        }
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-full py-2 px-2.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer",
                          isActive
                            ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                            : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]",
                        )}
                      >
                        <span>{t(st.labelBn, st.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sections / Modules */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                  <Layers className="size-3.5" />
                  <span>
                    {t(
                      "ব্যাকরণ অধ্যায় (Curriculum Section)",
                      "Curriculum Section",
                    )}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPendingSection("all")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer",
                      pendingSection === "all"
                        ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                        : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]",
                    )}
                  >
                    {t("সব অধ্যায়", "All Sections")}
                  </button>
                  {sections.map((sec) => {
                    const isActive = pendingSection === sec.slug;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setPendingSection(sec.slug)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer",
                          isActive
                            ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                            : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]",
                        )}
                      >
                        {sec.titleEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Difficulty Level */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                  <GraduationCap className="size-3.5" />
                  <span>{t("কঠিনতার মাত্রা", "Difficulty Level")}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    ["all", "Beginner", "Intermediate", "Advanced"] as const
                  ).map((lvl) => {
                    const isActive = pendingDifficulty === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPendingDifficulty(lvl)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer",
                          isActive
                            ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                            : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]",
                        )}
                      >
                        {lvl === "all" ? t("সব লেভেল", "All Levels") : lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Sort Order */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                  <ArrowUpDown className="size-3.5" />
                  <span>{t("সাজানোর ক্রম", "Sort Order")}</span>
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      value: "default",
                      label: "Curriculum",
                      labelBn: "কারিকুলাম",
                    },
                    { value: "az", label: "A → Z", labelBn: "A → Z" },
                    { value: "za", label: "Z → A", labelBn: "Z → A" },
                  ].map((s) => {
                    const isActive = pendingSort === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() =>
                          setPendingSort(s.value as GrammarSortOption)
                        }
                        className={cn(
                          "rounded-full py-2 px-2.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer",
                          isActive
                            ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                            : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]",
                        )}
                      >
                        {t(s.labelBn, s.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingSection("all");
                  setPendingDifficulty("all");
                  setPendingStatus("all");
                  setPendingSort("default");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>{t("রিসেট", "Reset")}</span>
              </button>

              <button
                type="button"
                onClick={applyPendingFilters}
                className="rounded-full bg-[#1c1c1e] text-white dark:bg-white dark:text-[#1c1c1e] px-5 py-2 text-xs font-semibold tracking-tight shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                {t("ফিল্টার প্রয়োগ করুন", "Apply Filters")}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
