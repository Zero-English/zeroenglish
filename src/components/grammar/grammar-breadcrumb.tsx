"use client";

import Link from "next/link";
import { ChevronRight, House, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  labelEn: string;
  labelBn: string;
  href?: string;
}

interface GrammarBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function GrammarBreadcrumb({ items, className }: GrammarBreadcrumbProps) {
  return (
    <nav aria-label="Grammar Breadcrumb" className={cn("min-w-0 py-2", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link
            href="/grammar"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground font-medium"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Grammar</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
                aria-hidden="true"
              />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                  title={item.labelEn}
                >
                  {item.labelEn}
                  {item.labelBn && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground hidden sm:inline">
                      ({item.labelBn})
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate max-w-[140px] sm:max-w-[220px] transition-colors hover:text-foreground"
                  title={item.labelEn}
                >
                  {item.labelEn}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
