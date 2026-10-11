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
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  BookOpenCheck,
  Split,
  FileText,
  ArrowRight,
  Filter,
  CheckCircle2,
  X,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrammarCategoryCard } from "./grammar-category-card";
import { searchRules } from "@/lib/grammar";
import { cn } from "@/lib/utils";

interface GrammarOverviewProps {
  sections: GrammarSection[];
  categories: GrammarCategory[];
  allRules: GrammarRule[];
}

const SECTION_ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Clock,
  BookOpenCheck,
  Split,
  FileText,
};

export function GrammarOverview({
  sections,
  categories,
  allRules,
}: GrammarOverviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");

  const isFiltering =
    searchQuery.trim() !== "" ||
    selectedDifficulty !== "All" ||
    selectedCategoryId !== "All";

  const searchResults = isFiltering
    ? searchRules({
        query: searchQuery,
        difficulty: selectedDifficulty,
        categoryId: selectedCategoryId,
      })
    : [];

  const primarySection = sections.find((s) => s.id === "parts-of-speech");
  const upcomingSections = sections.filter((s) => s.id !== "parts-of-speech");

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedCategoryId("All");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/10">
                <Sparkles className="h-3 w-3 mr-1" />
                Grammar Lab Prototype
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                Interactive Learning Model
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Zero English Grammar
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Structured, rule-based English grammar lessons tailored for bilingual learners with crystal-clear rules, examples, and common mistake breakdowns.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-bengali">
              সহজ বাংলা ব্যাখ্যা, বাস্তব উদাহরণ এবং কমন মিস্টেকসহ ইংরেজি ব্যাকরণের নিয়মাবলি।
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center min-w-[110px] shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">
                {allRules.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Core Rules
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center min-w-[110px] shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {categories.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Word Classes
              </div>
            </div>
          </div>
        </div>

        {/* Global Search & Filter Bar */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search grammar rules (e.g., plural, fanboys, modals, prepositions)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown/Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                <span className="text-muted-foreground font-medium">Level:</span>
                {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 font-medium transition-colors",
                      selectedDifficulty === lvl
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {isFiltering && (
                <button
                  onClick={clearFilters}
                  className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Search Results when filtering */}
      {isFiltering && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span>Search Results ({searchResults.length})</span>
            </h2>
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-2">
              <p className="text-base font-medium text-foreground">
                No matching grammar rules found.
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for general terms like "noun", "agreement", "apostrophe", or "preposition".
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((rule) => (
                <Link
                  key={rule.id}
                  href={`/grammar/parts-of-speech/${rule.categorySlug}/${rule.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary capitalize">
                        {rule.categorySlug}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {rule.difficulty}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {rule.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {rule.shortDescriptionEn}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-end text-xs font-medium text-muted-foreground group-hover:text-primary">
                    <span>Study rule</span>
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Content: Parts of Speech Section (Core Curriculum) */}
      {!isFiltering && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Parts of Speech Curriculum
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                The 8 core word classes. Select any category to view its grammar rules and lessons.
              </p>
            </div>

            <Link
              href="/grammar/parts-of-speech"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              <span>View all categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 8 Category Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <GrammarCategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Curriculum Modules Section */}
      {!isFiltering && (
        <section className="space-y-6 pt-6">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-muted-foreground" />
              <span>Future Learning Modules</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Additional comprehensive sections planned for the Zero English Grammar suite.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingSections.map((section) => {
              const IconComp = SECTION_ICON_MAP[section.icon] || BookOpen;

              return (
                <div
                  key={section.id}
                  className="relative flex flex-col justify-between rounded-xl border border-dashed border-border bg-card/50 p-5 opacity-85 hover:opacity-100 transition-opacity"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold tracking-wider uppercase">
                        {section.badgeText || "Planned"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {section.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground font-bengali">
                        {section.titleBn}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {section.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Est. {section.ruleCount} Rules</span>
                    <span className="italic">Preview</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
