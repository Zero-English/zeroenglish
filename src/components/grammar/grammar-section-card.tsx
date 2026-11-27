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
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const SECTION_ICON_MAP: Record<string, React.ElementType> = {
  Layers: LayoutGrid,
  Clock: Clock,
  BookOpenCheck: PenLine,
  Split: Split,
  FileText: FileText,
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
}: GrammarSectionCardProps) {
  const t = useT();
  const IconComponent = SECTION_ICON_MAP[section.icon] || BookOpen;
  const isAvailable = section.status === "available";
  const titleBanglaRaw =
    section.titleBn.split("(")[1]?.replace(")", "") || section.titleBn;

  const totalRules = section.ruleCount || 0;
  const percent =
    totalRules > 0 ? Math.min(100, Math.round((completedRulesCount / totalRules) * 100)) : 0;

  const cardContent = (
    <div className="flex h-full flex-col justify-between space-y-4">
      {/* Top Block: Icon, Progress Pill & Title */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#f1f1ef] text-[#1c1c1e] dark:bg-[#252528] dark:text-[#f4f4f5] transition-transform duration-200 group-hover:scale-105 shadow-2xs">
            <IconComponent className="size-5" />
          </div>

          {/* Quiet Status Capsule */}
          {isAvailable ? (
            completedRulesCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                <CheckCircle2 className="size-3" />
                <span>
                  {completedRulesCount}/{totalRules}
                </span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold tabular-nums text-[#242423]/40 dark:text-zinc-500">
                {totalRules} {t("নিয়ম", "rules")}
              </span>
            )
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#242423]/40 dark:text-zinc-500">
              {t("শীঘ্রই আসছে", "Soon")}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-base sm:text-[17px] font-bold tracking-tight text-[#1c1c1e] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white transition-colors">
              {section.titleEn}
            </h3>
            <span className="text-xs text-[#242423]/50 dark:text-zinc-400 font-bengali">
              ({titleBanglaRaw})
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-[#242423]/60 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {t(section.descriptionBn, section.descriptionEn)}
          </p>
        </div>
      </div>

      {/* Bottom Block: Minimalist Meta & Clean Arrow Action */}
      <div className="space-y-2 pt-2">
        {/* Subtle Liquid Progress (Only when in progress) */}
        {completedRulesCount > 0 && totalRules > 0 && (
          <div className="h-1 w-full rounded-full bg-black/[0.05] dark:bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#242423]/50 dark:text-zinc-400 pt-1">
          <span className="tabular-nums font-medium text-[11px]">
            {section.categoryCount && `${section.categoryCount} ${t("টি শ্রেণি", "Classes")}`}
            {section.categoryCount && section.ruleCount && " · "}
            {section.ruleCount && `${section.ruleCount} ${t("টি নিয়ম", "Rules")}`}
          </span>

          <span className="inline-flex items-center gap-1 font-semibold text-[#1c1c1e] dark:text-[#f4f4f5] text-xs">
            <span>{t("দেখুন", "Explore")}</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );

  const containerClasses = cn(
    "group relative flex flex-col justify-between rounded-[22px] sm:rounded-[24px] border border-black/[0.06] bg-white p-4.5 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-[#1c1c1e] transition-all duration-150 hover:shadow-md hover:border-black/[0.1] dark:hover:border-white/[0.14] active:scale-[0.985] min-h-[180px]",
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
