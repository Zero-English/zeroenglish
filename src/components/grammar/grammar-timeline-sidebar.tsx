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
import {
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  ChevronRight,
  RotateCcw,
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
    toggleCompleted,
    getCategoryStats,
    resetCategoryProgress,
  } = useGrammarProgress();

  const [previewRule, setPreviewRule] = useState<GrammarRule | null>(null);

  const stats = getCategoryStats(rules);

  const difficultyDotColors: Record<DifficultyLevel, string> = {
    Beginner: "bg-emerald-500",
    Intermediate: "bg-amber-500",
    Advanced: "bg-rose-500",
  };

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  return (
    <aside
      className={cn(
        "flex flex-col rounded-[22px] border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Category Header Card */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3 bg-muted/10">
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
                {rules.length} {t("টি নিয়ম", "Rules")}
              </p>
            </div>
          </Link>

          <Link
            href={`/grammar/${targetSectionSlug}`}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("সকল বিষয়", "All Topics")}
          </Link>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5 rounded-xl bg-card/60 p-2.5 border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t("অগ্রগতি", "Progress")}</span>
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
      </div>

      {/* Timeline Scroll Area */}
      <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {rules.map((r) => {
          const isCurrent = r.slug === currentRuleSlug;
          const completed = isCompleted(r.id);

          return (
            <div
              key={r.id}
              className={cn(
                "group relative rounded-[16px] border p-2.5 transition-all duration-150",
                isCurrent
                  ? "border-primary/40 bg-primary/[0.06] shadow-2xs ring-1 ring-primary/20"
                  : completed
                  ? "border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/35"
                  : "border-black/[0.06] dark:border-white/[0.08] bg-card hover:bg-muted/30"
              )}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                    #{r.order}
                  </span>
                  {completed && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.2 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {t("সম্পন্ন", "Done")}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-2 py-0.2 text-[9px] font-semibold text-primary">
                      {t("বর্তমান", "Current")}
                    </span>
                  )}
                </div>

                {/* Quick Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewRule(r)}
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
                href={`/grammar/${targetSectionSlug}/${category.slug}/${r.slug}`}
                onClick={() => onSelectRule?.(r)}
                className="block group-hover:text-primary transition-colors space-y-0.5"
              >
                <div className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                  {r.titleEn}
                </div>
                <div className="text-[11px] text-muted-foreground font-bengali line-clamp-1">
                  {r.titleBn}
                </div>
              </Link>

              {/* Metadata Row */}
              <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px]">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        difficultyDotColors[r.difficulty]
                      )}
                    />
                    <span>{r.difficulty}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px]">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{r.estimatedMinutes}m</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Mark Completed Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleCompleted(r.id);
                    }}
                    className={cn(
                      "rounded p-0.5 transition-colors",
                      completed
                        ? "text-emerald-500 hover:text-emerald-600"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title={
                      completed
                        ? t("সম্পন্ন (ক্লিক করে পরিবর্তন করুন)", "Completed")
                        : t("সম্পন্ন করতে ক্লিক করুন", "Mark as done")
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
                    href={`/grammar/${targetSectionSlug}/${category.slug}/${r.slug}`}
                    className="rounded p-0.5 hover:text-primary transition-colors"
                    aria-label={t("পাঠটি খুলুন", "Open lesson")}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Tools */}
      {stats.completedCount > 0 && (
        <div className="p-2.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-muted/10 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {stats.completedCount} {t("টি সম্পন্ন", "done")}
          </span>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  t(
                    `${category.titleEn} এর অগ্রগতি কি রিসেট করতে চান?`,
                    `Reset progress for ${category.titleEn}?`
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
