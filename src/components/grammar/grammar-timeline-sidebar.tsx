"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { GrammarRulePreviewModal } from "./grammar-rule-preview-modal";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  ChevronRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarTimelineSidebarProps {
  category: GrammarCategory;
  rules: GrammarRule[];
  currentRuleSlug?: string;
  className?: string;
  onSelectRule?: (rule: GrammarRule) => void;
  sectionSlug?: string;
}

export function GrammarTimelineSidebar({
  category,
  rules,
  currentRuleSlug,
  className,
  onSelectRule,
  sectionSlug,
}: GrammarTimelineSidebarProps) {
  const t = useT();
  const targetSectionSlug =
    sectionSlug || category.sectionId || "parts-of-speech";
  const {
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

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Category Header Card */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3 bg-muted/20">
        <div className="flex items-center justify-between">
          <Link
            href={`/grammar/${targetSectionSlug}/${category.slug}`}
            className="group flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shadow-2xs">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{category.titleEn}</span>
                <span className="text-xs font-normal text-muted-foreground font-bengali">
                  ({titleBanglaRaw})
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t("টাইমলাইন", "Timeline")} • {rules.length} {t("টি পাঠ", "Lessons")}
              </p>
            </div>
          </Link>

          <Link
            href={`/grammar/${targetSectionSlug}`}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("সকল পাঠ", "All Topics")}
          </Link>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5 rounded-xl bg-card/60 p-2.5 border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t("সম্পন্ন", "Completed")}</span>
            </span>
            <span className="font-semibold text-foreground text-xs font-mono">
              {stats.completedCount} / {stats.totalCount}{" "}
              <span className="text-muted-foreground font-normal text-[11px]">
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
        <div className="flex items-center gap-1 text-[11px] pt-0.5">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "rounded-lg px-2 py-0.5 font-medium transition-colors",
              filterMode === "all"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {t("সব", "All")} ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("completed")}
            className={cn(
              "rounded-lg px-2 py-0.5 font-medium transition-colors",
              filterMode === "completed"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {t("সম্পন্ন", "Done")} ({stats.completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("pending")}
            className={cn(
              "rounded-lg px-2 py-0.5 font-medium transition-colors",
              filterMode === "pending"
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {t("বাকি", "Pending")} ({rules.length - stats.completedCount})
          </button>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="p-3 space-y-2">
        {filteredRules.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p>{t("কোনো পাঠ পাওয়া যায়নি।", "No lessons found under this filter.")}</p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isCurrent = rule.slug === currentRuleSlug;
            const completed = isCompleted(rule.id);

            return (
              <div
                key={rule.id}
                className={cn(
                  "group relative rounded-xl border p-2.5 transition-all duration-150",
                  isCurrent
                    ? "border-primary/50 bg-primary/10 shadow-2xs ring-1 ring-primary/25"
                    : completed
                    ? "border-emerald-500/25 bg-emerald-500/[0.04] hover:border-emerald-500/40"
                    : "border-black/[0.06] dark:border-white/[0.08] bg-card/60 hover:bg-muted/40 hover:border-border"
                )}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                      {t("লেসন", "Lesson")} {rule.order}
                    </span>
                    {completed && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {t("সম্পন্ন", "Done")}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-0.2 text-[9px] font-semibold text-primary">
                        {t("বর্তমান", "Current")}
                      </span>
                    )}
                  </div>

                  {/* Quick Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewRule(rule)}
                    title={t("দ্রুত প্রিভিউ দেখুন", "Quick preview")}
                    className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="text-[10px] hidden sm:inline">
                      {t("প্রিভিউ", "Preview")}
                    </span>
                  </button>
                </div>

                {/* Rule Title & Link */}
                <Link
                  href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                  onClick={() => onSelectRule?.(rule)}
                  className="block group-hover:text-primary transition-colors space-y-0.5"
                >
                  <div className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                    {rule.titleEn}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-bengali line-clamp-1">
                    {rule.titleBn}
                  </div>
                </Link>

                {/* Metadata Row */}
                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px]">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          difficultyDotColors[rule.difficulty]
                        )}
                      />
                      <span>{rule.difficulty}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px]">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{rule.estimatedMinutes}m</span>
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
                        "rounded p-0.5 transition-colors",
                        completed
                          ? "text-emerald-500 hover:text-emerald-600"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title={
                        completed
                          ? t("সম্পন্ন হিসাবে চিহ্নিত (ক্লিক করে পরিবর্তন করুন)", "Completed (Click to toggle)")
                          : t("সম্পন্ন করতে ক্লিক করুন", "Click to mark done")
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
                      href={`/grammar/${targetSectionSlug}/${category.slug}/${rule.slug}`}
                      className="rounded p-0.5 hover:text-primary transition-colors"
                      aria-label={t("পাঠটি খুলুন", "Open lesson")}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Tools */}
      {stats.completedCount > 0 && (
        <div className="p-2.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-muted/20 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {stats.completedCount} {t("টি পাঠ ইতিমধ্যে সম্পন্ন", "lessons finished")}
          </span>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  t(
                    `${category.titleEn} এর অগ্রগতি কি রিসেট করতে চান?`,
                    `Reset progress for ${category.titleEn} lessons?`
                  )
                )
              ) {
                resetCategoryProgress(rules);
              }
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("রিসেট", "Reset")}</span>
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

