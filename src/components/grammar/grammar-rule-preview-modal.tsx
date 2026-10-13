"use client";

import Link from "next/link";
import { type GrammarRule } from "@/data/grammar-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarRulePreviewModalProps {
  rule: GrammarRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompleted?: boolean;
  onToggleCompleted?: (ruleId: string) => void;
}

export function GrammarRulePreviewModal({
  rule,
  open,
  onOpenChange,
  isCompleted = false,
  onToggleCompleted,
}: GrammarRulePreviewModalProps) {
  const t = useT();

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5 sm:p-6 gap-4 bg-card text-card-foreground border border-black/[0.08] dark:border-white/[0.08] shadow-xl rounded-2xl">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
              {rule.categorySlug} • {t("লেসন", "Lesson")} {rule.order}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-medium px-2 py-0.5",
                rule.difficulty === "Beginner" &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                rule.difficulty === "Intermediate" &&
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                rule.difficulty === "Advanced" &&
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              )}
            >
              {rule.difficulty}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              <span>{rule.estimatedMinutes} {t("মিনিট", "min")}</span>
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground pt-1">
            {rule.titleEn}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground font-bengali">
            {rule.titleBn}
          </DialogDescription>
        </DialogHeader>

        {/* Status Pill if previously completed */}
        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{t("আগে এই নিয়মটি সম্পন্ন করেছেন", "Previously Completed Lesson")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-black/[0.06] dark:border-white/[0.08] px-3 py-2 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            <span>{t("নিয়মটি এখনো সম্পন্ন করা হয়নি", "In progress / upcoming")}</span>
          </div>
        )}

        {/* Quick summary & formula preview */}
        <div className="space-y-3 text-xs sm:text-sm">
          {rule.explanation.formulaOrPattern && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                <span>{t("প্যাটার্ন / সূত্র", "Pattern / Formula")}</span>
              </div>
              <div className="font-mono text-xs font-semibold text-foreground">
                {rule.explanation.formulaOrPattern}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-muted/40 p-3 space-y-1 border border-black/[0.06] dark:border-white/[0.08]">
            <p className="text-foreground leading-relaxed text-xs sm:text-sm">
              {rule.shortDescriptionEn}
            </p>
            <p className="text-muted-foreground font-bengali leading-relaxed text-xs">
              {rule.shortDescriptionBn}
            </p>
          </div>

          {rule.examples.length > 0 && (
            <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-card/60 p-3 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                {t("সংক্ষিপ্ত উদাহরণ", "Quick Example")}
              </span>
              <p className="font-medium text-foreground text-xs sm:text-sm">
                &ldquo;{rule.examples[0].sentenceEn}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground font-bengali">
                &ldquo;{rule.examples[0].sentenceBn}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
          {onToggleCompleted && (
            <Button
              type="button"
              variant={isCompleted ? "outline" : "secondary"}
              size="sm"
              onClick={() => onToggleCompleted(rule.id)}
              className="w-full sm:w-auto text-xs"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{t("অসম্পূর্ণ রাখুন", "Mark Incomplete")}</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  <span>{t("সম্পন্ন চিহ্নিত করুন", "Mark as Done")}</span>
                </>
              )}
            </Button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              {t("বন্ধ করুন", "Close")}
            </Button>
            <Button
              asChild
              size="sm"
              className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link
                href={`/grammar/parts-of-speech/${rule.categorySlug}/${rule.slug}`}
                onClick={() => onOpenChange(false)}
              >
                <span>{t("মূল পাঠে যান", "Go to Lesson")}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

