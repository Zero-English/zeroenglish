"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type GrammarSection,
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import {
  Search,
  Sparkles,
  LayoutGrid,
  BookOpenCheck,
  CheckCircle2,
  Target,
  Flame,
  ArrowRight,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrammarSectionCard } from "./grammar-section-card";
import { searchRules } from "@/lib/grammar";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { cn } from "@/lib/utils";

const CARD =
  "relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

const ICON_CHIP =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]";

function ProgressRing({
  pct,
  size = 56,
  stroke = 5.5,
  gradientId = "grammar-hero-progress-ring",
  from = "#f97316",
  to = "#e11d48",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  gradientId?: string;
  from?: string;
  to?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c - (clamped / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        className="fill-none stroke-black/[0.06] dark:stroke-white/[0.08]"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        stroke={`url(#${gradientId})`}
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="fill-none transition-all duration-700 ease-out"
      />
    </svg>
  );
}

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");

  const completedRulesCount = progress.completedRuleIds.length;
  const progressPercent =
    allRules.length > 0
      ? Math.round((completedRulesCount / allRules.length) * 100)
      : 0;

  const isFiltering =
    searchQuery.trim() !== "" ||
    selectedDifficulty !== "All" ||
    selectedCategoryId !== "All";

  const searchResults = isFiltering
    ? searchRules(allRules, {
        query: searchQuery,
        difficulty: selectedDifficulty,
        categoryId: selectedCategoryId,
      })
    : [];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedCategoryId("All");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header & Bento Quick Metrics Card */}
      <section className={cn(CARD, "overflow-hidden")}>
        {/* Top Accent Gradient Bar */}
        <span
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
          aria-hidden
        />

        {/* Hero Header Content */}
        <div className="p-5 sm:p-7 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              <span>{t("ব্যাকরণ ল্যাব", "Grammar Lab")}</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-black/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04] font-mono">
              {t("দ্বিভাষিক নিয়ম ও ব্যাখ্যা", "Bilingual Rules Engine")}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("জিরো ইংলিশ ব্যাকরণ গাইড", "Zero English Grammar Guide")}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {t(
              "দ্বিভাষিক সহজ ব্যাখ্যা, স্পষ্ট নিয়মাবলি, বাস্তব বাক্য প্রয়োগ এবং কমন ভুলত্রুটি বিশ্লেষণের মাধ্যমে ইংরেজি ব্যাকরণ আয়ত্ত করুন।",
              "Structured, rule-based English grammar lessons tailored for bilingual learners with crystal-clear rules, examples, and common mistake breakdowns."
            )}
          </p>
        </div>

        {/* Circular Progress Gauge Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-6 py-4 bg-black/[0.015] dark:bg-white/[0.015]">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0">
              <ProgressRing pct={progressPercent} size={56} stroke={5.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("সামগ্রিক ব্যাকরণ অগ্রগতি", "Grammar Mastery Progress")}
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {completedRulesCount}{" "}
                <span className="font-normal text-zinc-400 dark:text-zinc-500">
                  / {allRules.length} {t("টি সম্পন্ন", "rules completed")}
                </span>
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {allRules.length - completedRulesCount > 0
                  ? t(
                      `${allRules.length - completedRulesCount}টি নিয়ম বাকি রয়েছে`,
                      `${allRules.length - completedRulesCount} rules remaining`
                    )
                  : t("সব নিয়ম সম্পন্ন হয়েছে!", "All rules completed!")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground dark:border-white/[0.08] shadow-2xs">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{t("৮টি পদ প্রকরণ সক্রিয়", "8 Word Classes Active")}</span>
            </div>
          </div>
        </div>

        {/* 4-Metric Grid with One Frame Internal Cell Dividers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          {/* Metric 1: Modules */}
          <div className="flex items-center gap-3 p-4 sm:p-5">
            <div className={cn(ICON_CHIP, "text-orange-500 bg-orange-500/10 ring-orange-500/20")}>
              <LayoutGrid className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("পাঠ্যক্রম মডিউল", "Curriculum Modules")}
              </p>
              <p className="mt-0.5 text-lg sm:text-xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                {sections.length}
              </p>
              <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("৫টি মূল অধ্যায়", "5 Core Modules")}
              </p>
            </div>
          </div>

          {/* Metric 2: Grammar Rules */}
          <div className="flex items-center gap-3 p-4 sm:p-5 border-l border-black/[0.06] dark:border-white/[0.08]">
            <div className={cn(ICON_CHIP, "text-sky-500 bg-sky-500/10 ring-sky-500/20")}>
              <BookOpenCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("ব্যাকরণ নিয়ম", "Grammar Rules")}
              </p>
              <p className="mt-0.5 text-lg sm:text-xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                {allRules.length}
              </p>
              <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("বাস্তব উদাহরণ সহ", "With Examples")}
              </p>
            </div>
          </div>

          {/* Metric 3: Completed Rules */}
          <div className="flex items-center gap-3 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-black/[0.06] dark:border-white/[0.08]">
            <div className={cn(ICON_CHIP, "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20")}>
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("সম্পন্ন নিয়ম", "Completed Rules")}
              </p>
              <p className="mt-0.5 text-lg sm:text-xl font-semibold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                {completedRulesCount}
              </p>
              <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("অর্জিত দক্ষতা", "Mastered Lessons")}
              </p>
            </div>
          </div>

          {/* Metric 4: Mastery Rate */}
          <div className="flex items-center gap-3 p-4 sm:p-5 border-t lg:border-t-0 border-l border-black/[0.06] dark:border-white/[0.08]">
            <div className={cn(ICON_CHIP, "text-amber-500 bg-amber-500/10 ring-amber-500/20")}>
              <Target className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("সামগ্রিক অর্জন", "Mastery Rate")}
              </p>
              <p className="mt-0.5 text-lg sm:text-xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
                {progressPercent}%
              </p>
              <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("অগ্রগতি স্কোর", "Progress Score")}
              </p>
            </div>
          </div>
        </div>

        {/* Global Search & Filter Shelf */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.08] p-4 sm:p-5 bg-black/[0.015] dark:bg-white/[0.015]">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t(
                  "নিয়ম খুঁজুন (যেমন: plural, fanboys, modals, prepositions)...",
                  "Search grammar rules (e.g., plural, fanboys, modals, prepositions)..."
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-black/[0.06] bg-background/80 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 dark:border-white/[0.08] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label={t("অনুসন্ধান মুছুন", "Clear search")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                <span className="text-muted-foreground font-medium text-[11px] mr-0.5">
                  {t("লেভেল:", "Level:")}
                </span>
                {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedDifficulty(lvl)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                        selectedDifficulty === lvl
                          ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {lvl === "All" ? t("সব", "All") : lvl}
                    </button>
                  )
                )}
              </div>

              {isFiltering && (
                <button
                  onClick={clearFilters}
                  className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  {t("রিসেট", "Reset")}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Search Results when filtering */}
      {isFiltering && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span>
                {t("অনুসন্ধানের ফলাফল", "Search Results")} ({searchResults.length})
              </span>
            </h2>
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t("ক্লিয়ার করুন", "Clear Search")}
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/[0.1] bg-card/40 p-8 text-center space-y-1.5 dark:border-white/[0.1]">
              <p className="text-sm font-medium text-foreground">
                {t("কোনো ব্যাকরণ নিয়ম পাওয়া যায়নি।", "No matching grammar rules found.")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "\"noun\", \"agreement\", \"apostrophe\" বা \"preposition\" লিখে চেষ্টা করুন।",
                  "Try searching for general terms like \"noun\", \"agreement\", \"apostrophe\", or \"preposition\"."
                )}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
                {searchResults.map((rule) => (
                  <StaggerItem
                    key={rule.id}
                    className="border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0 hover:bg-black/[0.02] active:bg-black/[0.03] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04] transition-colors p-4 sm:p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary capitalize">
                          {rule.categorySlug}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-medium"
                        >
                          {rule.difficulty}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {rule.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground font-bengali">
                        {rule.titleBn}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t(rule.shortDescriptionBn, rule.shortDescriptionEn)}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end text-xs font-medium text-muted-foreground group-hover:text-primary">
                      <Link
                        href={`/grammar/${rule.sectionSlug || "parts-of-speech"}/${rule.categorySlug}/${rule.slug}`}
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <span>{t("নিয়মটি পড়ুন", "Study rule")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}
        </section>
      )}

      {/* Main Content: Parent Grammar Modules (One Frame Grid Pattern) */}
      {!isFiltering && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("ব্যাকরণ পাঠ্যক্রমসমূহ", "Grammar Curriculum Modules")}
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t(
                  "ইংরেজি ব্যাকরণের মূল বিষয়ভিত্তিক অধ্যায়সমূহ। পদ প্রকরণ, কাল, রূপান্তর ও যতিচিহ্নের নিয়মাবলি।",
                  "Structured curriculum modules from core parts of speech to tenses, sentence structure, and mechanics."
                )}
              </p>
            </div>

            <span className="text-xs text-muted-foreground font-mono self-start sm:self-auto">
              {sections.length} {t("টি মূল মডিউল", "Core Modules")}
            </span>
          </div>

          {/* Parent Categories in One Frame Grid */}
          <div className="rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 overflow-hidden shadow-xs">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2">
              {sections.map((section) => (
                <StaggerItem key={section.id}>
                  <GrammarSectionCard
                    section={section}
                    completedRulesCount={
                      section.id === "parts-of-speech" ? completedRulesCount : 0
                    }
                    isGridCell={true}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </div>
  );
}


