"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { useT } from "@/components/language-provider";
import { formatCategoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";
import type { LevelPageSort } from "@/lib/data";

const SORT_OPTIONS: { value: LevelPageSort; label: string; labelBn: string; icon: typeof Search }[] = [
  { value: "default", label: "Default order", labelBn: "ডিফল্ট ক্রম", icon: Search },
  { value: "az", label: "A – Z", labelBn: "A – Z", icon: Search },
  { value: "za", label: "Z – A", labelBn: "Z – A", icon: Search },
];

const CONTROL =
  "h-9 rounded-lg border border-black/[0.06] bg-white/70 px-2.5 text-sm text-zinc-700 outline-none transition-colors focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:border-white/[0.08] dark:bg-zinc-900/60 dark:text-zinc-200";

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;

interface LevelServerFilterBarProps {
  basePath: string;
  search: string;
  sort: LevelPageSort;
  category: string;
  categories: string[];
}

/**
 * Filter controls for the server-rendered level list. Category and sort live in
 * a drawer, mirroring the cached-bank bar, and the search box stays inline
 * because it is the control people reach for first.
 *
 * The whole thing is still a real GET form pointing at the level root, so the
 * resulting URLs stay crawlable and shareable, and the drawer is a `<noscript>`
 * pair with a plain select form for anyone without JS — vaul renders nothing
 * until it is opened, so the two never submit duplicate parameters.
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
  const [open, setOpen] = useState(false);

  // Uncommitted drawer state, so choosing a category does not navigate before
  // the reader has picked a sort too.
  const [pending, setPending] = useState({ sort, category });
  const [seen, setSeen] = useState({ sort, category });
  // Adjust state during render rather than in an effect: after the drawer
  // applies, the server sends the new values back down as new props.
  if (seen.sort !== sort || seen.category !== category) {
    setSeen({ sort, category });
    setPending({ sort, category });
  }

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
    setOpen(false);
    router.push(buildHref(next));
  };

  const hasFilters = Boolean(search.trim()) || sort !== "default" || category !== "all";
  const activeCount =
    (sort !== "default" ? 1 : 0) + (category !== "all" ? 1 : 0);

  const categoryChoices = [
    { value: "all", label: "All categories", labelBn: "সব বিভাগ" },
    ...categories.map((c) => ({
      value: c,
      label: formatCategoryLabel(c),
      labelBn: formatCategoryLabel(c),
    })),
  ];

  return (
    <>
      <form
        id="level-server-filter-form"
        action={basePath}
        method="get"
        className="py-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          push({
            q: String(data.get("q") ?? ""),
            sort: String(data.get("sort") ?? sort),
            category: String(data.get("category") ?? category),
          });
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

          {/* Carried by the drawer pills; a GET submit turns them into the URL. */}
          <input type="hidden" name="sort" value={pending.sort} />
          <input type="hidden" name="category" value={pending.category} />

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-9 gap-1.5"
          >
            <SlidersHorizontal className="size-3.5" />
            {t("ফিল্টার", "Filter")}
            {activeCount > 0 ? (
              <span className="rounded-full bg-zinc-100 px-1.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {activeCount}
              </span>
            ) : null}
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

      <Drawer open={open} onOpenChange={setOpen} noBodyStyles>
        <DrawerContent className="mx-auto max-w-lg rounded-t-3xl">
          <div className="overflow-y-auto px-4 pb-6 pt-2">
            <DrawerTitle className="text-base">
              {t("শব্দ ফিল্টার করুন", "Filter words")}
            </DrawerTitle>
            <DrawerDescription className="mt-1">
              {t(
                "ফিল্টারগুলো সার্ভারে প্রয়োগ হয়, তাই ফলাফল লিংক করা যায়।",
                "Filters run on the server, so the result stays linkable."
              )}
            </DrawerDescription>

            <div className="mt-5 space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("বিভাগ", "Category")}
              </p>
              {categoryChoices.map((c) => {
                const isActive = pending.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setPending((p) => ({ ...p, category: c.value }))}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="level-server-category-pill"
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-white"
                      />
                    )}
                    <span className="relative z-10 flex-1 text-left">
                      {t(c.labelBn, c.label)}
                    </span>
                    {isActive && <Check className="relative z-10 size-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("সাজান", "Sort by")}
              </p>
              {SORT_OPTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = pending.sort === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setPending((p) => ({ ...p, sort: s.value }))}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="level-server-sort-pill"
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-white"
                      />
                    )}
                    <Icon className="relative z-10 size-4" />
                    <span className="relative z-10 flex-1 text-left">
                      {t(s.labelBn, s.label)}
                    </span>
                    {isActive && <Check className="relative z-10 size-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-2">
              {hasFilters ? (
                <Button asChild variant="outline" className="h-11 flex-1 rounded-xl text-sm">
                  <Link href={basePath} onClick={() => setOpen(false)}>
                    {t("মুছুন", "Clear")}
                  </Link>
                </Button>
              ) : null}
              <DrawerClose asChild>
                <Button
                  type="submit"
                  form="level-server-filter-form"
                  className="h-11 flex-1 rounded-xl gap-2 text-sm font-semibold"
                >
                  {t("প্রয়োগ করুন", "Apply")}
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Without JS the drawer never mounts, so the same two filters are offered
          as a plain GET form. Kept a sibling rather than nested, and carrying
          the search term, so it submits on its own without duplicating names. */}
      <noscript>
        <form action={basePath} method="get" className="flex flex-wrap items-end gap-2 pb-3">
          {search ? <input type="hidden" name="q" value={search} /> : null}
          <div>
            <label className="sr-only" htmlFor="level-server-sort-ns">
              {t("সাজান", "Sort by")}
            </label>
            <select
              id="level-server-sort-ns"
              name="sort"
              defaultValue={sort}
              className={cn(CONTROL, "pr-7")}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelBn, o.label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="level-server-category-ns">
              {t("বিভাগ", "Category")}
            </label>
            <select
              id="level-server-category-ns"
              name="category"
              defaultValue={category}
              className={cn(CONTROL, "max-w-[10rem] pr-7")}
            >
              {categoryChoices.map((c) => (
                <option key={c.value} value={c.value}>
                  {t(c.labelBn, c.label)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-9">
            {t("প্রয়োগ করুন", "Apply")}
          </Button>
        </form>
      </noscript>
    </>
  );
}
