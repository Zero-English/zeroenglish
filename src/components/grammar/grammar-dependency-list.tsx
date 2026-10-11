"use client";

import Link from "next/link";
import { type GrammarRule } from "@/data/grammar-data";
import { ArrowRight, BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  if (!prerequisites.length) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Prerequisites Section */}
      {prerequisites.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookMarked className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Prerequisite Knowledge
                <span className="text-xs font-normal text-muted-foreground">
                  (আগে জানা প্রয়োজন)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                We recommend understanding these concepts before mastering this rule.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {prerequisites.map((rule) => (
              <Link
                key={rule.id}
                href={`/grammar/parts-of-speech/${rule.categorySlug}/${rule.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 transition-all hover:border-amber-500/40 hover:shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 capitalize">
                      {rule.categorySlug}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {rule.difficulty}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {rule.titleEn}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {rule.titleBn}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-end text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  <span>Review rule</span>
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
