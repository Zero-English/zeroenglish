"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  SlidersHorizontal,
  LayoutGrid,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  Circle,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowUpDown,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { formatCategoryLabel } from "@/lib/category";

export type FilterType =
  | "all"
  | "learned"
  | "not-learned"
  | "bookmarked"
  | "not-bookmarked";

export type SortType = "default" | "az" | "za";

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;

const filters: { value: FilterType; label: string; labelBn: string; icon: typeof SlidersHorizontal }[] = [
  { value: "all", label: "All", labelBn: "সব", icon: LayoutGrid },
  { value: "learned", label: "Learned", labelBn: "শেখা হয়েছে", icon: CheckCircle2 },
  { value: "not-learned", label: "Not Learned", labelBn: "শেখা হয়নি", icon: Circle },
  { value: "bookmarked", label: "Bookmarked", labelBn: "বুকমার্ক করা", icon: BookmarkCheck },
  { value: "not-bookmarked", label: "Not Bookmarked", labelBn: "বুকমার্ক করা হয়নি", icon: Bookmark },
];

const sorts: { value: SortType; label: string; labelBn: string; icon: typeof SlidersHorizontal }[] = [
  { value: "default", label: "Default order", labelBn: "ডিফল্ট ক্রম", icon: LayoutGrid },
  { value: "az", label: "A – Z", labelBn: "A – Z", icon: ArrowDownAZ },
  { value: "za", label: "Z – A", labelBn: "Z – A", icon: ArrowUpZA },
];

interface LevelFilterBarProps {
  filter: FilterType;
  sort: SortType;
  category: string;
  categories: string[];
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  onCategoryChange: (category: string) => void;
}

export function LevelFilterBar({
  filter,
  sort,
  category,
  categories,
  onFilterChange,
  onSortChange,
  onCategoryChange,
}: LevelFilterBarProps) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const activeFilter = filters.find((f) => f.value === filter) ?? filters[0];
  const activeSort = sorts.find((s) => s.value === sort) ?? sorts[0];

  return (
    <div className="py-3">
      <div className="hidden items-start gap-3 sm:flex">
        <div className="w-full overflow-x-auto">
          <div className="flex flex-1 items-center gap-1 pb-1">
            {filters.map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="level-filter-pill-desktop"
                      transition={spring}
                      className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-white"
                    />
                  )}
                  <Icon className="relative z-10 size-3.5" />
                  <span className="relative z-10">{t(f.labelBn, f.label)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ArrowUpDown className="size-3.5 text-zinc-400" />
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortType)}>
            <SelectTrigger className="w-28" size="sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t("ডিফল্ট", "Default")}</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => onCategoryChange(v)}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("সব বিভাগ", "All categories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {formatCategoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:hidden">
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="h-10 gap-2 rounded-xl px-3.5 text-sm font-medium"
        >
          <SlidersHorizontal className="size-4" />
          {t("ফিল্টার", "Filters")}
          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            {activeFilter.label}
          </span>
        </Button>

        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {t("সাজানো:", "Sorted:")}{" "}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            {activeSort.label}
          </span>
        </span>
      </div>

      <Drawer open={open} onOpenChange={setOpen} noBodyStyles>
        <DrawerContent className="mx-auto max-w-lg rounded-t-3xl">
          <div className="overflow-y-auto px-4 pb-6 pt-2">
            <DrawerTitle className="text-base">{t("শব্দ ফিল্টার করুন", "Filter words")}</DrawerTitle>
            <DrawerDescription className="mt-1">
              {t(
                "আপনি যেসব শব্দ রিভিউ করতে চান তার সাথে মিলে যাওয়া শব্দগুলোই দেখান।",
                "Show only the words that match what you want to review."
              )}
            </DrawerDescription>

            <div className="mt-5 space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("স্ট্যাটাস", "Status")}
              </p>
              {filters.map((f) => {
                const Icon = f.icon;
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => onFilterChange(f.value)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="level-filter-pill-mobile"
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-white"
                      />
                    )}
                    <Icon className="relative z-10 size-4" />
                    <span className="relative z-10 flex-1 text-left">{t(f.labelBn, f.label)}</span>
                    {isActive && <Check className="relative z-10 size-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("বিভাগ", "Category")}
              </p>
              {[{ value: "all", label: "All categories", labelBn: "সব বিভাগ" }, ...categories.map((c) => ({ value: c, label: formatCategoryLabel(c), labelBn: formatCategoryLabel(c) }))].map((c) => {
                const isActive = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => onCategoryChange(c.value)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="level-category-pill-mobile"
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-white"
                      />
                    )}
                    <span className="relative z-10 flex-1 text-left">{t(c.labelBn, c.label)}</span>
                    {isActive && <Check className="relative z-10 size-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {t("সাজান", "Sort by")}
              </p>
              {sorts.map((s) => {
                const Icon = s.icon;
                const isActive = sort === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => onSortChange(s.value)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="level-sort-pill-mobile"
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-zinc-900 dark:bg-white"
                      />
                    )}
                    <Icon className="relative z-10 size-4" />
                    <span className="relative z-10 flex-1 text-left">{t(s.labelBn, s.label)}</span>
                    {isActive && <Check className="relative z-10 size-4" />}
                  </button>
                );
              })}
            </div>

            <DrawerClose asChild>
              <Button className="mt-6 h-11 w-full rounded-xl gap-2 text-sm font-semibold">
                {t("সম্পন্ন", "Done")}
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}