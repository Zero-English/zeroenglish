"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import { formatCategoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";
import type { LevelPageSort } from "@/lib/data";

const SORT_OPTIONS: { value: LevelPageSort; label: string; labelBn: string }[] = [
  { value: "default", label: "Default order", labelBn: "ডিফল্ট ক্রম" },
  { value: "az", label: "A – Z", labelBn: "A – Z" },
  { value: "za", label: "Z – A", labelBn: "Z – A" },
];

const CONTROL =
  "h-9 rounded-lg border border-black/[0.06] bg-white/70 px-2.5 text-sm text-zinc-700 outline-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-white/[0.08] dark:bg-zinc-900/60 dark:text-zinc-200";

interface LevelServerFilterBarProps {
  basePath: string;
  search: string;
  sort: LevelPageSort;
  category: string;
  categories: string[];
}

/**
 * Filter controls for the server-rendered level list. Every control is a real
 * form control inside a GET form pointing at the level root, so the resulting
 * URLs are crawlable and shareable and the page still works without JS.
 *
 * The learned/bookmarked pills of `LevelFilterBar` are intentionally absent
 * here: they can only ever act on the 10 words currently in the HTML.
 */
export function LevelServerFilterBar({
  basePath,
  search,
  sort,
  category,
  categories,
}: LevelServerFilterBarProps) {
  const t = useT();
  const router = useRouter();

  const buildHref = (next: { q?: string; sort?: string; category?: string }) => {
    const params = new URLSearchParams();
    const q = (next.q ?? search).trim();
    if (q) params.set("q", q);
    if ((next.sort ?? sort) !== "default") params.set("sort", next.sort ?? sort);
    if ((next.category ?? category) !== "all") {
      params.set("category", next.category ?? category);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const push = (next: { q?: string; sort?: string; category?: string }) => {
    router.push(buildHref(next));
  };

  const hasFilters = Boolean(search.trim()) || sort !== "default" || category !== "all";

  return (
    <form
      action={basePath}
      method="get"
      className="py-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        push({ q: String(data.get("q") ?? "") });
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            name="q"
            defaultValue={search}
            placeholder={t("এই লেভেলে খুঁজুন", "Search this level")}
            aria-label={t("এই লেভেলে খুঁজুন", "Search this level")}
            className={cn(CONTROL, "h-9 pl-8")}
          />
        </div>

        <label className="sr-only" htmlFor="level-server-sort">
          {t("সাজান", "Sort by")}
        </label>
        <select
          id="level-server-sort"
          name="sort"
          value={sort}
          onChange={(e) => push({ sort: e.target.value })}
          className={cn(CONTROL, "pr-7")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelBn, o.label)}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="level-server-category">
          {t("বিভাগ", "Category")}
        </label>
        <select
          id="level-server-category"
          name="category"
          value={category}
          onChange={(e) => push({ category: e.target.value })}
          className={cn(CONTROL, "max-w-[10rem] pr-7")}
        >
          <option value="all">{t("সব বিভাগ", "All categories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {formatCategoryLabel(c)}
            </option>
          ))}
        </select>

        <Button type="submit" size="sm" variant="outline" className="h-9 gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          {t("ফিল্টার", "Filter")}
        </Button>

        {hasFilters ? (
          <Button asChild size="sm" variant="ghost" className="h-9 gap-1.5">
            <Link href={basePath}>
              <X className="size-3.5" />
              {t("মুছুন", "Clear")}
            </Link>
          </Button>
        ) : null}
      </div>

      {hasFilters ? (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {t("ফিল্টার সার্ভারে প্রয়োগ হয়েছে।", "Filters are applied on the server.")}
        </p>
      ) : null}
    </form>
  );
}
