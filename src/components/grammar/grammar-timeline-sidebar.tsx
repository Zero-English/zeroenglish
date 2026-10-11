"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { GrammarRulePreviewModal } from "./grammar-rule-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  ChevronRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarTimelineSidebarProps {
  category: GrammarCategory;
  rules: GrammarRule[];
  currentRuleSlug?: string;
  className?: string;
  onSelectRule?: (rule: GrammarRule) => void;
}

export function GrammarTimelineSidebar({
  category,
  rules,
  currentRuleSlug,
  className,
}: GrammarTimelineSidebarProps) {
  const {
    progress,
    isCompleted,
    isVisited,
    toggleCompleted,
    getCategoryStats,
    resetCategoryProgress,
  } = useGrammarProgress();

  const [filterMode, setFilterMode] = useState<"all" | "completed" | "pending">("all");
  const [previewRule, setPreviewRule] = useState<GrammarRule | null>(null);

  const stats = getCategoryStats(rules);

  const difficultyDotColors: Record<DifficultyLevel, string> = {
    Beginner: "bg-emerald-500",
    Intermediate: "bg-amber-500",
    Advanced: "bg-rose-500",
  };

  const filteredRules = rules.filter((rule) => {
    const completed = isCompleted(rule.id);
    if (filterMode === "completed") return completed;
    if (filterMode === "pending") return !completed;
    return true;
  });

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card/95 overflow-hidden",
        className
      )}
    >
      {/* Category Header Card */}
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/50 via-card to-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/grammar/parts-of-speech/${category.slug}`}
            className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                {category.titleEn}
                <span className="text-xs font-normal text-muted-foreground font-bengali">
                  ({category.titleBn})
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Grammar Timeline • {rules.length} Lessons
              </p>
            </div>
          </Link>

          <Link
            href="/grammar/parts-of-speech"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            All Topics
          </Link>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5 rounded-xl bg-background/80 p-2.5 border border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Completed
            </span>
            <span className="font-semibold text-foreground">
              {stats.completedCount} / {stats.totalCount}{" "}
              <span className="text-muted-foreground font-normal">
                ({stats.percent}%)
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] pt-1">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition-colors",
              filterMode === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("completed")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition-colors",
              filterMode === "completed"
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Completed ({stats.completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("pending")}
            className={cn(
              "rounded-md px-2 py-1 font-medium transition-colors",
              filterMode === "pending"
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Pending ({rules.length - stats.completedCount})
          </button>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        {filteredRules.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p>No lessons found under this filter.</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {filteredRules.map((rule, idx) => {
              const isCurrent = rule.slug === currentRuleSlug;
              const completed = isCompleted(rule.id);
              const visited = isVisited(rule.id);
              const completedTimestamp = progress.completedTimestamps[rule.id];

              return (
                <div
                  key={rule.id}
                  className={cn(
                    "group relative rounded-xl border p-2.5 sm:p-3 transition-all duration-200",
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : completed
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
                  )}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                        Lesson {rule.order}
                      </span>
                      {completed && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Completed
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewRule(rule)}
                      title="Quick preview summary without leaving page"
                      className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-[10px] hidden sm:inline">Preview</span>
                    </button>
                  </div>

                  {/* Rule Title & Link */}
                  <Link
                    href={`/grammar/parts-of-speech/${category.slug}/${rule.slug}`}
                    className="block group-hover:text-primary transition-colors space-y-0.5"
                  >
                    <div className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                      {rule.titleEn}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-bengali line-clamp-1">
                      {rule.titleBn}
                    </div>
                  </Link>

                  {/* Metadata Row */}
                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            difficultyDotColors[rule.difficulty]
                          )}
                        />
                        <span>{rule.difficulty}</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {rule.estimatedMinutes}m
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Mark Completed Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCompleted(rule.id);
                        }}
                        className={cn(
                          "rounded p-0.5 text-xs transition-colors",
                          completed
                            ? "text-emerald-500 hover:text-emerald-600"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={
                          completed
                            ? "Marked as completed (Click to toggle)"
                            : "Click to mark completed"
                        }
                      >
                        <CheckCircle2
                          className={cn(
                            "h-3.5 w-3.5",
                            completed && "fill-emerald-500/20 text-emerald-500"
                          )}
                        />
                      </button>

                      <Link
                        href={`/grammar/parts-of-speech/${category.slug}/${rule.slug}`}
                        className="rounded p-0.5 hover:text-primary transition-colors"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Tools */}
      {stats.completedCount > 0 && (
        <div className="p-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {stats.completedCount} lessons previously finished
          </span>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Reset progress for ${category.titleEn} lessons?`
                )
              ) {
                resetCategoryProgress(rules);
              }
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      )}

      {/* Quick Preview Modal */}
      <GrammarRulePreviewModal
        rule={previewRule}
        open={Boolean(previewRule)}
        onOpenChange={(open) => !open && setPreviewRule(null)}
        isCompleted={previewRule ? isCompleted(previewRule.id) : false}
        onToggleCompleted={toggleCompleted}
      />
    </aside>
  );
}
