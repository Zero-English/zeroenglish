"use client";

import Link from "next/link";
import {
  type GrammarCategory,
  type GrammarRule,
  type DifficultyLevel,
} from "@/data/grammar-data";
import { CATEGORY_GUIDES } from "@/data/grammar-category-guide";
import { useGrammarProgress } from "@/lib/grammar-progress";
import { useT } from "@/components/language-provider";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Layers,
  Zap,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  BookOpen,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarSubcategorySidebarProps {
  category: GrammarCategory;
  rules: GrammarRule[];
  allCategories?: GrammarCategory[];
  className?: string;
  onSelectCategory?: () => void;
}

export function GrammarSubcategorySidebar({
  category,
  rules,
  allCategories = [],
  className,
  onSelectCategory,
}: GrammarSubcategorySidebarProps) {
  const t = useT();
  const { getCategoryStats, resetCategoryProgress } = useGrammarProgress();

  const stats = getCategoryStats(rules);
  const guide = CATEGORY_GUIDES[category.slug] || CATEGORY_GUIDES[category.id];

  const totalMinutes = rules.reduce(
    (acc, r) => acc + (r.estimatedMinutes || 5),
    0
  );

  const beginnerCount = rules.filter((r) => r.difficulty === "Beginner").length;
  const intermediateCount = rules.filter(
    (r) => r.difficulty === "Intermediate"
  ).length;
  const advancedCount = rules.filter((r) => r.difficulty === "Advanced").length;

  return (
    <aside
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl p-4 sm:p-5 dark:border-white/[0.08] dark:bg-zinc-900/60 space-y-5 shadow-xs",
        className
      )}
    >

      {/* 4 Core Diagnostic Facts (Untruncated & Deep) */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
          <span>{t("মূল তথ্য ও বৈশিষ্ট্য", "Diagnostic Facts")}</span>
        </h4>

        {/* 1. Diagnostic Clue */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-1.5 dark:border-amber-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("চেনার উপায় (Diagnostic Clue)", "Diagnostic Clue")}</span>
          </div>

          <p className="text-xs font-medium text-foreground leading-snug">
            {guide
              ? t(
                  guide.identificationHacks.questionBn,
                  guide.identificationHacks.questionEn
                )
              : t("কে? বা কী? দিয়ে প্রশ্ন করুন", "Answers 'Who?' or 'What?'")}
          </p>

          {guide && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t(
                guide.identificationHacks.clueBn,
                guide.identificationHacks.clueEn
              )}
            </p>
          )}

          {guide?.identificationHacks.suffixes && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground block">
                {t("সাধারণ প্রত্যয় (Suffixes):", "Key Suffixes:")}
              </span>
              <div className="flex flex-wrap gap-1">
                {guide.identificationHacks.suffixes.map((sfx, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-[10px] font-mono px-1.5 py-0 bg-background/80"
                  >
                    {sfx}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Core Sentence Roles */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-3 space-y-2 dark:border-sky-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <Layers className="h-3.5 w-3.5" />
            <span>{t("বাক্যে মূল ভূমিকা (Core Roles)", "Sentence Roles")}</span>
          </div>

          {guide ? (
            <div className="space-y-1.5">
              {guide.sentenceRoles.map((role, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-background/70 p-2 text-xs border border-black/[0.04] dark:border-white/[0.04] space-y-0.5"
                >
                  <span className="text-[11px] font-semibold text-primary block">
                    {t(role.roleBn, role.roleEn)}
                  </span>
                  <p className="text-[11px] text-muted-foreground italic">
                    &quot;{role.exampleSentence}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("Subject, Object বা Prepositional Complement হিসেবে বসে।", "Functions as Subject, Object, or Complement.")}
            </p>
          )}
        </div>

        {/* 3. Varieties / Types Breakdown */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 space-y-2 dark:border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>{t("প্রকারভেদ (Varieties)", "Key Varieties")}</span>
            </div>
            {guide && (
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {guide.keyTypes.length} {t("টি শ্রেণি", "Types")}
              </span>
            )}
          </div>

          {guide ? (
            <div className="flex flex-wrap gap-1.5">
              {guide.keyTypes.map((type, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-background/80 border border-black/[0.05] dark:border-white/[0.05] px-2 py-1 text-xs"
                >
                  <span className="font-semibold text-foreground text-[11px]">
                    {type.nameEn}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1 font-bengali">
                    ({type.nameBn})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("বিভিন্ন ব্যাকরণিক উপবিভাগে বিভক্ত।", "Classified into diverse sub-types.")}
            </p>
          )}
        </div>

        {/* 4. Est. Study Time & Curriculum Stats */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3 space-y-2 dark:border-violet-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("পাঠের পরিধি ও সময়", "Curriculum & Time")}</span>
            </div>
            <span className="text-xs font-bold text-foreground font-mono">
              ~{totalMinutes} {t("মিনিট", "mins")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
            <div className="rounded-md bg-background/80 p-1.5 border border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[10px] text-muted-foreground block">
                {t("প্রাথমিক", "Beginner")}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {beginnerCount}
              </span>
            </div>
            <div className="rounded-md bg-background/80 p-1.5 border border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[10px] text-muted-foreground block">
                {t("মাঝারি", "Interm.")}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {intermediateCount}
              </span>
            </div>
            <div className="rounded-md bg-background/80 p-1.5 border border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[10px] text-muted-foreground block">
                {t("উন্নত", "Advanced")}
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {advancedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="rounded-xl border border-black/[0.06] bg-card/60 p-3 space-y-2 dark:border-white/[0.08]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t("শেখার অগ্রগতি", "Learning Progress")}</span>
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {stats.completedCount}/{stats.totalCount} ({stats.percent}%)
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        {stats.completedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  t(
                    `${category.titleEn} এর সম্পন্ন অগ্রগতি কি রিসেট করতে চান?`,
                    `Reset completed progress for ${category.titleEn}?`
                  )
                )
              ) {
                resetCategoryProgress(rules);
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-rose-500 transition-colors pt-0.5"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("অগ্রগতি রিসেট", "Reset Progress")}</span>
          </button>
        )}
      </div>

      {/* All 8 Parts of Speech Stepper */}
      {allCategories.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("পদ পরিক্রমা (৮টি শাখা)", "Parts of Speech (8 Classes)")}
            </span>
            <span className="text-[10px] text-primary font-mono font-semibold">
              {category.order}/8
            </span>
          </div>

          <div className="space-y-1">
            {allCategories.map((cat) => {
              const isActive = cat.slug === category.slug || cat.id === category.id;
              const catTitleBn =
                cat.titleBn.split("(")[1]?.replace(")", "") || cat.titleBn;

              return (
                <Link
                  key={cat.id}
                  href={`/grammar/parts-of-speech/${cat.slug}`}
                  onClick={onSelectCategory}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl text-xs transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cat.order}
                    </span>
                    <span>{cat.titleEn}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bengali",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"
                      )}
                    >
                      ({catTitleBn})
                    </span>
                  </div>

                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Exam Trap Reminder */}
      {guide && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-3 space-y-1.5 dark:border-rose-500/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("কমন পরীক্ষার ভুল", "Frequent Exam Trap")}</span>
          </div>
          <div className="text-[11px] space-y-1">
            <p className="line-through text-muted-foreground font-mono">
              {guide.commonTrap.incorrect}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {guide.commonTrap.correct}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
