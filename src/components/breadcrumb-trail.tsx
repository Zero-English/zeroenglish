"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { useT } from "@/components/language-provider";
import { setSelectedLevel } from "@/lib/level-store";
import { buildTrail, type Crumb } from "@/lib/breadcrumb-trail";
import { useAuthStatus } from "@/lib/auth-store";
import { useLevelPage, useLevelPageHydrated } from "@/lib/level-pagination-store";
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

  // Logged-out readers page by URL, so the server-rendered crumb stays true.
  // For guest/Google the page is client state, so follow the store once the
  // auth identity and the pagination store have both hydrated.
  const { status } = useAuthStatus();
  const pathname = usePathname();
  const pageHydrated = useLevelPageHydrated();

  // Once bank mode has dropped the page segment, a "Page 23" leaf would point at
  // a URL the reader can no longer reach, so it leaves the trail too.
  const urlHasPageSegment = /\/\d+\/?$/.test(pathname);
  const trail = buildTrail(
    items.filter((c) => !(c.livePage && !urlHasPageSegment))
  );
  const lastIndex = trail.length - 1;

  const leaf = trail[lastIndex];
  const storedPage = useLevelPage(leaf?.livePage?.level ?? "");
  const showLivePage = !!leaf?.livePage && status !== "none" && pageHydrated;
  const livePageNumber = showLivePage ? storedPage : leaf?.livePage?.page;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {trail.map((c, i) => {
          const isLast = i === lastIndex;
          const liveLabel =
            isLast && livePageNumber != null
              ? t(`পৃষ্ঠা ${livePageNumber}`, `Page ${livePageNumber}`)
              : null;
          const label = liveLabel ?? t(c.nameBn, c.nameEn);
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
