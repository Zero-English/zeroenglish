"use client";

import Link from "next/link";
import { ChevronRight, Home, BookOpen } from "lucide-react";
import { useT } from "@/components/language-provider";
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
  const t = useT();

  return (
    <nav aria-label="Grammar Breadcrumb" className={cn("min-w-0 py-1.5", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            title={t("হোম পেজে ফিরে যান", "Go to Home")}
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:inline-block font-medium">
              {t("হোম", "Home")}
            </span>
          </Link>
        </li>

        <li className="flex items-center gap-1.5">
          <ChevronRight
            className="h-3 w-3 shrink-0 text-muted-foreground/40"
            aria-hidden="true"
          />
          <Link
            href="/grammar"
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground"
          >
            <BookOpen className="h-3 w-3 text-primary" aria-hidden="true" />
            <span>{t("ব্যাকরণ", "Grammar")}</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = t(item.labelBn || item.labelEn, item.labelEn);

          return (
            <li key={index} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight
                className="h-3 w-3 shrink-0 text-muted-foreground/40"
                aria-hidden="true"
              />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                  title={item.labelEn}
                >
                  {label}
                  {item.labelBn && item.labelBn !== item.labelEn && (
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground hidden md:inline">
                      ({item.labelEn})
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate max-w-[140px] sm:max-w-[220px] font-medium transition-colors hover:text-foreground"
                  title={item.labelEn}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

