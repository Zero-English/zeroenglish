"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Link2,
  Eye,
  Check,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GrammarBreadcrumb } from "./grammar-breadcrumb";
import { GrammarRulePreviewModal } from "./grammar-rule-preview-modal";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { cn } from "@/lib/utils";

interface GrammarRuleListProps {
  category: GrammarCategory;
  rules: GrammarRule[];
}

export function GrammarRuleList({ category, rules }: GrammarRuleListProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "All"
  >("All");
  const [previewRule, setPreviewRule] = useState<GrammarRule | null>(null);

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
        "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      dot: "bg-emerald-500",
    },
    Intermediate: {
      badge:
        "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
      dot: "bg-amber-500",
    },
    Advanced: {
      badge:
        "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10",
      dot: "bg-rose-500",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumbs */}
      <GrammarBreadcrumb
        items={[
          {
            labelEn: "Parts of Speech",
            labelBn: "পদ প্রকরণ",
            href: "/grammar/parts-of-speech",
          },
          { labelEn: category.titleEn, labelBn: category.titleBn },
        ]}
      />

      {/* Category Header Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-card to-background p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs uppercase tracking-wider font-semibold"
              >
                Parts of Speech • Lesson {category.order}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {rules.length}{" "}
                {rules.length === 1 ? "Grammar Rule" : "Grammar Rules"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {category.titleEn}{" "}
              <span className="text-xl sm:text-2xl font-normal text-muted-foreground">
                ({category.titleBn})
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {category.descriptionEn}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/90 font-bengali">
              {category.descriptionBn}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <Link
              href="/grammar/parts-of-speech"
              className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              All Categories
            </Link>
          </div>
        </div>

        {/* Category Learning Progress Bar */}
        <div className="rounded-xl border border-border/70 bg-background/80 p-3.5 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-foreground">
                Learning Progress:
              </span>
              <span className="text-muted-foreground">
                {stats.completedCount} of {stats.totalCount} rules completed (
                {stats.percent}%)
              </span>
            </div>

            {stats.completedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Reset completed progress for ${category.titleEn}?`
                    )
                  ) {
                    resetCategoryProgress(rules);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-rose-500 transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Progress
              </button>
            )}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Filter by Level */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Filter Level:
          </span>
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
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{level}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px]",
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

      {/* Rules List Section (Cards View) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Available Rules in {category.titleEn}
          </h2>
          <span className="text-xs text-muted-foreground">
            Showing {filteredRules.length} of {rules.length} rules
          </span>
        </div>

        {filteredRules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No rules found for the selected difficulty level.
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {filteredRules.map((rule) => {
              const colors = difficultyColors[rule.difficulty];
              const completed = isCompleted(rule.id);
              const hasPrereq = rule.prerequisiteRuleIds.length > 0;
              const hasRelated = rule.relatedRuleIds.length > 0;

              return (
                <div
                  key={rule.id}
                  className={cn(
                    "group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 sm:p-5 transition-all duration-150",
                    completed
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                  )}
                >
                  <div className="space-y-1.5 sm:pr-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                        {rule.order}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-medium px-2 py-0.5",
                          colors.badge
                        )}
                      >
                        {rule.difficulty}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {rule.estimatedMinutes} min read
                      </span>
                      {completed && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3 mr-0.5" />
                          Completed
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/grammar/parts-of-speech/${category.slug}/${rule.slug}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {rule.titleEn}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium font-bengali">
                        {rule.titleBn}
                      </p>
                    </Link>

                    <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed pt-0.5">
                      {rule.shortDescriptionEn}
                    </p>

                    {(hasPrereq || hasRelated) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        {hasPrereq && (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {rule.prerequisiteRuleIds.length} Prerequisite
                          </span>
                        )}
                        {hasRelated && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Link2 className="h-3 w-3" />
                            {rule.relatedRuleIds.length} Related
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewRule(rule)}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </Button>
                    <Link
                      href={`/grammar/parts-of-speech/${category.slug}/${rule.slug}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
