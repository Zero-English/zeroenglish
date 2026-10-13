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
  MessageCircleHeart,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  MessageCircleHeart,
};

const COLOR_MAP: Record<
  string,
  {
    chipBg: string;
    chipText: string;
    chipBorder: string;
  }
> = {
  blue: {
    chipBg: "bg-blue-500/10",
    chipText: "text-blue-600 dark:text-blue-400",
    chipBorder: "border-blue-500/20",
  },
  emerald: {
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-600 dark:text-emerald-400",
    chipBorder: "border-emerald-500/20",
  },
  amber: {
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-600 dark:text-amber-400",
    chipBorder: "border-amber-500/20",
  },
  rose: {
    chipBg: "bg-rose-500/10",
    chipText: "text-rose-600 dark:text-rose-400",
    chipBorder: "border-rose-500/20",
  },
  violet: {
    chipBg: "bg-violet-500/10",
    chipText: "text-violet-600 dark:text-violet-400",
    chipBorder: "border-violet-500/20",
  },
  cyan: {
    chipBg: "bg-cyan-500/10",
    chipText: "text-cyan-600 dark:text-cyan-400",
    chipBorder: "border-cyan-500/20",
  },
  orange: {
    chipBg: "bg-orange-500/10",
    chipText: "text-orange-600 dark:text-orange-400",
    chipBorder: "border-orange-500/20",
  },
  pink: {
    chipBg: "bg-pink-500/10",
    chipText: "text-pink-600 dark:text-pink-400",
    chipBorder: "border-pink-500/20",
  },
};

interface GrammarCategoryCardProps {
  category: GrammarCategory;
  className?: string;
  isGridCell?: boolean;
}

export function GrammarCategoryCard({
  category,
  className,
  isGridCell = true,
}: GrammarCategoryCardProps) {
  const t = useT();
  const IconComponent =
    category.icon === "MessageCircleHeart"
      ? MessageSquareQuote
      : ICON_MAP[category.icon] || BookOpen;

  const colors = COLOR_MAP[category.accentColor] || COLOR_MAP.blue;
  const { progress } = useGrammarProgress();
  const completedInCategory = progress.completedRuleIds.filter(
    (id) => id.startsWith(category.id) || id.startsWith(category.slug)
  ).length;

  const titleBanglaRaw =
    category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn;

  return (
    <Link
      href={`/grammar/parts-of-speech/${category.slug}`}
      className={cn(
        "group relative flex flex-col justify-between p-4 sm:p-5 transition-colors",
        isGridCell
          ? "border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0 hover:bg-black/[0.02] active:bg-black/[0.03] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
          : "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs hover:border-primary/40",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header: Icon Chip + Badge */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 shadow-2xs",
              colors.chipBg,
              colors.chipText,
              colors.chipBorder
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          {completedInCategory > 0 ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-[11px] font-medium px-2 py-0.5"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {completedInCategory}/{category.ruleCount} {t("সম্পন্ন", "Done")}
            </Badge>
          ) : (
            <span className="font-mono text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
              {category.ruleCount} {t("টি নিয়ম", "Rules")}
            </span>
          )}
        </div>

        {/* Title & Bengali label */}
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {category.titleEn}
            </h3>
            <span className="text-xs text-muted-foreground font-bengali">
              ({titleBanglaRaw})
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {t(category.descriptionBn, category.descriptionEn)}
          </p>
        </div>
      </div>

      {/* Footer: Difficulty level indicators + View Rules trigger */}
      <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {category.levels.beginner > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{category.levels.beginner} Beg</span>
            </span>
          )}
          {category.levels.intermediate > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{category.levels.intermediate} Int</span>
            </span>
          )}
          {category.levels.advanced > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>{category.levels.advanced} Adv</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
          <span>{t("নিয়মাবলি", "View Rules")}</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

