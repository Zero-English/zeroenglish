"use client";

import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { useT } from "@/components/language-provider";
import { setSelectedLevel } from "@/lib/level-store";
import { buildTrail, type Crumb } from "@/lib/breadcrumb-trail";
import { cn } from "@/lib/utils";

/**
 * The visible half of the breadcrumb. Client-side so it can follow the
 * language toggle via `useT()`; the matching `BreadcrumbList` schema is
 * rendered separately by the server-side `Breadcrumb` component.
 */
export function BreadcrumbTrail({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  const t = useT();
  const trail = buildTrail(items);
  const lastIndex = trail.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {trail.map((c, i) => {
          const isLast = i === lastIndex;
          const label = t(c.nameBn, c.nameEn);
          const icon = i === 0 && <House className="mr-1 inline h-3 w-3 align-[-2px]" aria-hidden />;

          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-600"
                  aria-hidden
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="truncate font-medium text-zinc-700 dark:text-zinc-200"
                >
                  {icon}
                  {label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  onClick={
                    (c.clearLevel ?? c.href === "/vocabulary")
                      ? () => setSelectedLevel(null)
                      : undefined
                  }
                  className="inline-flex items-center truncate transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {icon}
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
