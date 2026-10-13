"use client";

import Link from "next/link";
import { type GrammarSection } from "@/data/grammar-data";
import {
  LayoutGrid,
  Clock,
  PenLine,
  Split,
  FileText,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const SECTION_ICON_MAP: Record<string, React.ElementType> = {
  Layers: LayoutGrid,
  Clock: Clock,
  BookOpenCheck: PenLine,
  Split: Split,
  FileText: FileText,
};

const SECTION_COLOR_MAP: Record<
  string,
  {
    chipBg: string;
    chipText: string;
    chipBorder: string;
  }
> = {
  "parts-of-speech": {
    chipBg: "bg-primary/10",
    chipText: "text-primary",
    chipBorder: "border-primary/20",
  },
  tenses: {
    chipBg: "bg-sky-500/10",
    chipText: "text-sky-600 dark:text-sky-400",
    chipBorder: "border-sky-500/20",
  },
  "articles-determiners": {
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-600 dark:text-amber-400",
    chipBorder: "border-amber-500/20",
  },
  "sentence-structure": {
    chipBg: "bg-violet-500/10",
    chipText: "text-violet-600 dark:text-violet-400",
    chipBorder: "border-violet-500/20",
  },
  punctuation: {
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-600 dark:text-emerald-400",
    chipBorder: "border-emerald-500/20",
  },
};

interface GrammarSectionCardProps {
  section: GrammarSection;
  completedRulesCount?: number;
  className?: string;
  isGridCell?: boolean;
}

export function GrammarSectionCard({
  section,
  completedRulesCount = 0,
  className,
  isGridCell = true,
}: GrammarSectionCardProps) {
  const t = useT();
  const IconComponent = SECTION_ICON_MAP[section.icon] || BookOpen;
  const colors =
    SECTION_COLOR_MAP[section.id] || SECTION_COLOR_MAP["parts-of-speech"];

  const isAvailable = section.status === "available";
  const titleBanglaRaw =
    section.titleBn.split("(")[1]?.replace(")", "") || section.titleBn;

  const cardContent = (
    <>
      <div className="space-y-3.5">
        {/* Header: Icon Chip & Badges */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 shadow-2xs",
              isAvailable && "group-hover:scale-105",
              colors.chipBg,
              colors.chipText,
              colors.chipBorder
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isAvailable ? (
              completedRulesCount > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-[11px] font-medium px-2 py-0.5"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {completedRulesCount}/{section.ruleCount} {t("সম্পন্ন", "Done")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium px-2 py-0.5"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("মূল ভিত্তি", section.badgeText || "Core")}
                </Badge>
              )
            ) : (
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5"
              >
                {t("শীঘ্রই আসছে", section.badgeText || "Coming Soon")}
              </Badge>
            )}
          </div>
        </div>

        {/* Title, Subtitle & Description */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3
              className={cn(
                "text-base sm:text-lg font-semibold tracking-tight text-foreground transition-colors",
                isAvailable && "group-hover:text-primary"
              )}
            >
              {section.titleEn}
            </h3>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground font-bengali">
              ({titleBanglaRaw})
            </span>
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {t(section.descriptionBn, section.descriptionEn)}
          </p>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="mt-5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          {section.categoryCount && (
            <span>
              {section.categoryCount} {t("টি শ্রেণি", "Word Classes")}
            </span>
          )}
          {section.categoryCount && section.ruleCount && <span>•</span>}
          {section.ruleCount && (
            <span>
              {section.ruleCount} {t("টি নিয়ম", "Rules")}
            </span>
          )}
        </div>

        {isAvailable ? (
          <span className="inline-flex items-center text-xs font-semibold text-primary transition-colors">
            <span>{t("পাঠ্যক্রম দেখুন", "View Categories")}</span>
            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground/80 italic font-sans">
            {t("পরিকল্পিত মডিউল", "Planned Module")}
          </span>
        )}
      </div>
    </>
  );

  const containerClasses = cn(
    "group relative flex flex-col justify-between p-5 sm:p-6 transition-colors",
    isGridCell
      ? "border-t border-black/[0.06] dark:border-white/[0.08] first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0 hover:bg-black/[0.02] active:bg-black/[0.03] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.04]"
      : "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/60 shadow-xs",
    className
  );

  if (isAvailable) {
    return (
      <Link href={`/grammar/${section.slug}`} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={containerClasses}>{cardContent}</div>;
}
