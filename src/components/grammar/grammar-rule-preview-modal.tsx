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
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-5 sm:p-6 gap-5 bg-card text-card-foreground border border-border shadow-xl">
        <DialogHeader className="gap-2 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {rule.categorySlug} • Lesson {rule.order}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
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
              {rule.estimatedMinutes} min
            </span>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {rule.titleEn}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground font-bengali">
            {rule.titleBn}
          </DialogDescription>
        </DialogHeader>

        {/* Status Pill if previously completed */}
        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>আগে এই নিয়মটি সম্পন্ন করেছেন (Previously Completed)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" />
            <span>নিয়মটি এখনো সম্পন্ন করা হয়নি (In progress / upcoming)</span>
          </div>
        )}

        {/* Quick summary & formula preview */}
        <div className="space-y-3 text-xs sm:text-sm">
          {rule.explanation.formulaOrPattern && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                <span>Pattern / Formula</span>
              </div>
              <div className="font-mono text-xs font-semibold text-foreground">
                {rule.explanation.formulaOrPattern}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 border border-border/60">
            <p className="text-foreground leading-relaxed">
              {rule.shortDescriptionEn}
            </p>
            <p className="text-muted-foreground font-bengali leading-relaxed text-xs">
              {rule.shortDescriptionBn}
            </p>
          </div>

          {rule.examples.length > 0 && (
            <div className="rounded-lg border border-border/80 bg-card p-3 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Quick Example
              </span>
              <p className="font-medium text-foreground">
                &ldquo;{rule.examples[0].sentenceEn}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground font-bengali">
                &ldquo;{rule.examples[0].sentenceBn}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-border/60">
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
                  Mark Incomplete
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  Mark as Done
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
              Close
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
                <span>Go to Lesson</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
