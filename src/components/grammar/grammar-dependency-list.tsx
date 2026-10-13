"use client";

import Link from "next/link";
import { type GrammarRule } from "@/data/grammar-data";
import { ArrowRight, BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface GrammarDependencyListProps {
  prerequisites: GrammarRule[];
  relatedRules?: GrammarRule[];
  className?: string;
}

export function GrammarDependencyList({
  prerequisites,
  className,
}: GrammarDependencyListProps) {
  const t = useT();

  if (!prerequisites.length) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-amber-500/15 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs">
            <BookMarked className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              <span>{t("পূর্বশর্তীয় জ্ঞান", "Prerequisite Knowledge")}</span>
              <span className="text-xs font-normal text-muted-foreground font-bengali">
                (আগে জানা প্রয়োজন)
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(
                "এই নিয়মটি ভালোভাবে বোঝার আগে নিচের কনসেপ্টগুলো পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে।",
                "We recommend understanding these concepts before mastering this rule."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {prerequisites.map((rule) => (
            <Link
              key={rule.id}
              href={`/grammar/${rule.sectionSlug || "parts-of-speech"}/${rule.categorySlug}/${rule.slug}`}
              className="group p-4 border-t border-amber-500/15 first:border-t-0 sm:border-l sm:[&:nth-child(odd)]:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0 hover:bg-amber-500/[0.08] transition-colors flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 capitalize">
                    {rule.categorySlug}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                    {rule.difficulty}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {rule.titleEn}
                </h4>
                <p className="text-xs text-muted-foreground font-bengali line-clamp-1">
                  {rule.titleBn}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end text-xs font-medium text-muted-foreground group-hover:text-foreground">
                <span>{t("নিয়ম পর্যালোচনা", "Review rule")}</span>
                <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

