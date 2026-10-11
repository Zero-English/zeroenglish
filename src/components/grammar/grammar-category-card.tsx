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
  MessageCircleHeart,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  Users,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Link2,
  MessageCircleHeart,
};

const COLOR_MAP: Record<
  string,
  {
    bg: string;
    border: string;
    iconText: string;
    badgeBg: string;
  }
> = {
  blue: {
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/40",
    iconText: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "group-hover:border-emerald-500/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "group-hover:border-amber-500/40",
    iconText: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "group-hover:border-rose-500/40",
    iconText: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "group-hover:border-violet-500/40",
    iconText: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "group-hover:border-cyan-500/40",
    iconText: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "group-hover:border-orange-500/40",
    iconText: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "group-hover:border-pink-500/40",
    iconText: "text-pink-600 dark:text-pink-400",
    badgeBg: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
};

interface GrammarCategoryCardProps {
  category: GrammarCategory;
  className?: string;
}

export function GrammarCategoryCard({
  category,
  className,
}: GrammarCategoryCardProps) {
  const IconComponent = ICON_MAP[category.icon] || BookOpen;
  const colors = COLOR_MAP[category.accentColor] || COLOR_MAP.blue;
  const { progress } = useGrammarProgress();
  const completedInCategory = progress.completedRuleIds.filter(
    (id) => id.startsWith(category.id) || id.startsWith(category.slug)
  ).length;

  return (
    <Link
      href={`/grammar/parts-of-speech/${category.slug}`}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        colors.border,
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
              colors.bg,
              colors.iconText
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          {completedInCategory > 0 ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {completedInCategory}/{category.ruleCount} Done
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-mono text-xs font-semibold">
              {category.ruleCount} {category.ruleCount === 1 ? "Rule" : "Rules"}
            </Badge>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {category.titleEn}
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              ({category.titleBn.split("(")[1]?.replace(")", "") || category.titleBn})
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {category.descriptionEn}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {category.levels.beginner > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {category.levels.beginner} Beg
            </span>
          )}
          {category.levels.intermediate > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {category.levels.intermediate} Int
            </span>
          )}
          {category.levels.advanced > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {category.levels.advanced} Adv
            </span>
          )}
        </div>

        <span className="inline-flex items-center font-medium text-muted-foreground group-hover:text-primary transition-colors">
          <span>View Rules</span>
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
