"use client";

import Link from "next/link";
import { type GrammarCategory } from "@/data/grammar-data";
import {
  User,
  Users,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Link2,
  MessageSquareQuote,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  Users,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Link2,
  MessageSquareQuote,
  MessageCircleHeart: MessageSquareQuote,
};

interface GrammarCategoryCardProps {
  category: GrammarCategory;
  sectionSlug?: string;
  completedCount?: number;
  className?: string;
  isGridCell?: boolean;
}

export function GrammarCategoryCard({
  category,
  sectionSlug,
  completedCount,
  className,
}: GrammarCategoryCardProps) {
  const t = useT();
  const IconComponent =
    ICON_MAP[category.icon] || BookOpen;

  const { progress } = useGrammarProgress();
  const completedInCategory =
    completedCount !== undefined
      ? completedCount
      : progress.completedRuleIds.filter(
          (id) =>
            id.startsWith(category.id) ||
            id.startsWith(category.slug) ||
            id.includes(`-${category.slug}`)
        ).length;

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  const targetSectionSlug =
    sectionSlug || category.sectionId || "parts-of-speech";

  const totalRules = category.ruleCount || 0;
  const isAllDone = totalRules > 0 && completedInCategory === totalRules;

  return (
    <Link
      href={`/grammar/${targetSectionSlug}/${category.slug}`}
      className={cn(
        "group relative flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.06] bg-white p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] transition-all duration-150 hover:shadow-md hover:border-black/[0.1] dark:hover:border-white/[0.14] active:scale-[0.985] min-h-[175px]",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header: Tactile Squircle Icon + Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#f1f1ef] text-[#1c1c1e] dark:bg-[#252528] dark:text-[#f4f4f5] transition-transform duration-200 group-hover:scale-105 shadow-2xs">
            <IconComponent className="size-5" />
          </div>

          {completedInCategory > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              <CheckCircle2 className="size-3" />
              <span>
                {completedInCategory}/{totalRules} {isAllDone ? t("সম্পন্ন", "Done") : ""}
              </span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold tabular-nums text-[#242423]/40 dark:text-zinc-500">
              {totalRules} {t("নিয়ম", "rules")}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-base sm:text-[17px] font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white transition-colors">
              {category.titleEn}
            </h3>
            <span className="text-xs text-[#242423]/50 dark:text-zinc-400 font-bengali">
              ({titleBanglaRaw})
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-[#242423]/60 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {t(category.descriptionBn, category.descriptionEn)}
          </p>
        </div>
      </div>

      {/* Footer: Level Pills + Action */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#242423]/50 dark:text-zinc-400">
        <div className="flex items-center gap-2 text-[11px] font-medium tabular-nums">
          {category.levels.beginner > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{category.levels.beginner} Beg</span>
            </span>
          )}
          {category.levels.intermediate > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>{category.levels.intermediate} Int</span>
            </span>
          )}
          {category.levels.advanced > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              <span>{category.levels.advanced} Adv</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c1c1e] dark:text-[#f4f4f5]">
          <span>{t("দেখুন", "Explore")}</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
