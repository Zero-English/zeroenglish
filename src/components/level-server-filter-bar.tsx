"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ArrowUpDown,
  Bookmark,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  Tags,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useT } from "@/components/language-provider";
import { formatCategoryLabel } from "@/lib/category";
import { cn } from "@/lib/utils";
import type { LevelPageSort } from "@/lib/data";

const SORT_OPTIONS: {
  value: LevelPageSort;
  label: string;
  labelBn: string;
}[] = [
  { value: "default", label: "Curriculum Order", labelBn: "কারিকুলাম ক্রম" },
  { value: "az", label: "A → Z (Alphabetical)", labelBn: "A → Z" },
  { value: "za", label: "Z → A (Reverse)", labelBn: "Z → A" },
];

const POS_OPTIONS = [
  { value: "all", label: "All Types", labelBn: "সব ধরন" },
  { value: "noun", label: "Noun", labelBn: "বিশেষ্য" },
  { value: "verb", label: "Verb", labelBn: "ক্রিয়া" },
  { value: "adjective", label: "Adjective", labelBn: "বিশেষণ" },
  { value: "adverb", label: "Adverb", labelBn: "ক্রিয়াবিশেষণ" },
  { value: "preposition", label: "Preposition", labelBn: "অব্যয়" },
  { value: "conjunction", label: "Conjunction", labelBn: "সংযোজক" },
  { value: "pronoun", label: "Pronoun", labelBn: "সর্বনাম" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Words", labelBn: "সব শব্দ", icon: Sparkles },
  { value: "unlearned", label: "Needs Study", labelBn: "শেখা বাকি", icon: Circle },
  { value: "learned", label: "Mastered", labelBn: "আয়ত্ত", icon: CheckCircle2 },
  { value: "bookmarked", label: "Saved", labelBn: "সংরক্ষিত", icon: Bookmark },
] as const;

interface LevelServerFilterBarProps {
  basePath: string;
  search: string;
  sort: LevelPageSort;
  category: string;
  categories: string[];
  wordType?: string;
  status?: string;
}

export function LevelServerFilterBar({
  basePath,
  search,
  sort,
  category,
  categories,
  wordType = "all",
  status = "all",
}: LevelServerFilterBarProps) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Uncommitted dialog state
  const [pending, setPending] = useState({
    sort,
    category,
    wordType,
    status,
  });

  const [seen, setSeen] = useState({
    sort,
    category,
    wordType,
    status,
  });

  if (
    seen.sort !== sort ||
    seen.category !== category ||
    seen.wordType !== wordType ||
    seen.status !== status
  ) {
    setSeen({ sort, category, wordType, status });
    setPending({ sort, category, wordType, status });
  }

  const buildHref = (next: {
    q?: string;
    sort?: string;
    category?: string;
    wordType?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    const q = (next.q !== undefined ? next.q : search).trim();
    if (q) params.set("q", q);

    const s = next.sort !== undefined ? next.sort : sort;
    if (s && s !== "default") params.set("sort", s);

    const c = next.category !== undefined ? next.category : category;
    if (c && c !== "all") params.set("category", c);

    const wt = next.wordType !== undefined ? next.wordType : wordType;
    if (wt && wt !== "all") params.set("type", wt);

    const st = next.status !== undefined ? next.status : status;
    if (st && st !== "all") params.set("status", st);

    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const push = (next: {
    q?: string;
    sort?: string;
    category?: string;
    wordType?: string;
    status?: string;
  }) => {
    setOpen(false);
    router.push(buildHref(next));
  };

  const hasFilters =
    Boolean(search.trim()) ||
    sort !== "default" ||
    category !== "all" ||
    wordType !== "all" ||
    status !== "all";

  const activeCount =
    (sort !== "default" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (wordType !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0);

  const pendingActiveCount =
    (pending.sort !== "default" ? 1 : 0) +
    (pending.category !== "all" ? 1 : 0) +
    (pending.wordType !== "all" ? 1 : 0) +
    (pending.status !== "all" ? 1 : 0);

  const categoryChoices = [
    { value: "all", label: "All Categories", labelBn: "সব বিভাগ" },
    ...categories.map((c) => ({
      value: c,
      label: formatCategoryLabel(c),
      labelBn: formatCategoryLabel(c),
    })),
  ];

  return (
    <div className="mb-5 mt-2">
      {/* Search Input and Filter Trigger */}
      <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-black/[0.06] bg-white p-2 shadow-xs dark:border-white/[0.08] dark:bg-[#1c1c1e] sm:rounded-[26px] sm:p-2.5">
        <form
          className="relative min-w-[12rem] flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            push({ q: String(data.get("q") ?? "") });
          }}
        >
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#242423]/40 dark:text-zinc-500"
            aria-hidden
          />
          <Input
            type="search"
            name="q"
            defaultValue={search}
            placeholder={t("এই লেভেলে খুঁজুন...", "Search this level...")}
            aria-label={t("এই লেভেলে খুঁজুন", "Search this level")}
            className="h-9.5 rounded-full border-0 bg-[#f1f1ef] pl-10 pr-4 text-[13px] font-medium text-[#242423] placeholder:text-[#242423]/40 focus-visible:ring-1 focus-visible:ring-[#242423]/30 dark:bg-[#252528] dark:text-[#f3f3f2] dark:placeholder:text-zinc-500"
          />
        </form>

        <button
          type="button"
          onClick={() => {
            setPending({ sort, category, wordType, status });
            setOpen(true);
          }}
          className={cn(
            "inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-[12.5px] font-semibold transition-all active:scale-95",
            activeCount > 0
              ? "border-[#242423] bg-[#242423] text-white dark:border-white dark:bg-white dark:text-[#242423]"
              : "border-black/[0.06] bg-[#f1f1ef] text-[#242423] hover:bg-[#eaeae8] dark:border-white/[0.08] dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2c2c30]"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          <span>{t("ফিল্টার", "Filter")}</span>
          {activeCount > 0 && (
            <span
              className={cn(
                "flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold",
                activeCount > 0
                  ? "bg-white text-[#242423] dark:bg-[#1c1c1e] dark:text-[#f3f3f2]"
                  : "bg-[#242423] text-white"
              )}
            >
              {activeCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              push({
                q: "",
                sort: "default",
                category: "all",
                wordType: "all",
                status: "all",
              })
            }
            className="inline-flex h-9.5 items-center gap-1 rounded-full px-3 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 active:scale-95 dark:text-rose-400"
            title={t("সব ফিল্টার মুছুন", "Clear all filters")}
          >
            <X className="size-3.5" />
            <span>{t("রিসেট", "Reset")}</span>
          </button>
        )}
      </div>

      {/* Active Filter Quick-Dismiss Chips */}
      {hasFilters && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#242423]/40 dark:text-zinc-500 mr-1">
            {t("সক্রিয় ফিল্টার:", "Active:")}
          </span>

          {search.trim() && (
            <button
              type="button"
              onClick={() => push({ q: "" })}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
            >
              <span>&ldquo;{search}&rdquo;</span>
              <X className="size-3 opacity-60" />
            </button>
          )}

          {status !== "all" && (
            <button
              type="button"
              onClick={() => push({ status: "all" })}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 hover:bg-rose-50 hover:text-rose-600 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
            >
              <span>
                {STATUS_OPTIONS.find((s) => s.value === status)
                  ? t(
                      STATUS_OPTIONS.find((s) => s.value === status)!.labelBn,
                      STATUS_OPTIONS.find((s) => s.value === status)!.label
                    )
                  : status}
              </span>
              <X className="size-3 opacity-60" />
            </button>
          )}

          {wordType !== "all" && (
            <button
              type="button"
              onClick={() => push({ wordType: "all" })}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
            >
              <span>
                {POS_OPTIONS.find((p) => p.value === wordType)
                  ? t(
                      POS_OPTIONS.find((p) => p.value === wordType)!.labelBn,
                      POS_OPTIONS.find((p) => p.value === wordType)!.label
                    )
                  : wordType}
              </span>
              <X className="size-3 opacity-60" />
            </button>
          )}

          {category !== "all" && (
            <button
              type="button"
              onClick={() => push({ category: "all" })}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
            >
              <span>{formatCategoryLabel(category)}</span>
              <X className="size-3 opacity-60" />
            </button>
          )}

          {sort !== "default" && (
            <button
              type="button"
              onClick={() => push({ sort: "default" })}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#242423] ring-1 ring-black/5 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:ring-white/10 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
            >
              <span>{sort === "az" ? "A → Z" : "Z → A"}</span>
              <X className="size-3 opacity-60" />
            </button>
          )}
        </div>
      )}

      {/* Redesigned Clean Modal Filter Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md sm:max-w-lg rounded-[28px] sm:rounded-[32px] bg-white p-5 sm:p-6 shadow-2xl dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-[#242423] dark:text-[#f3f3f2]">
                {t("ফিল্টার ও বাছাই", "Filter Words")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[#242423]/55 dark:text-zinc-400">
                {t(
                  "শেখার স্ট্যাটাস, পদের ধরন ও বিষয় নির্বাচন করুন।",
                  "Refine words by study status, part of speech, and topic."
                )}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-5 pt-3">
            {/* 1. Study Status Filter */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                <Bookmark className="size-3.5" />
                <span>{t("শেখার স্ট্যাটাস (Study Status)", "Study Status")}</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {STATUS_OPTIONS.map((st) => {
                  const Icon = st.icon;
                  const isActive = pending.status === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPending((p) => ({ ...p, status: st.value }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-full py-2 px-2.5 text-xs font-semibold transition-all active:scale-95",
                        isActive
                          ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                          : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]"
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span>{t(st.labelBn, st.label)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Parts of Speech */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                <Tags className="size-3.5" />
                <span>{t("পদের ধরন (Part of Speech)", "Parts of Speech")}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POS_OPTIONS.map((pos) => {
                  const isActive = pending.wordType === pos.value;
                  return (
                    <button
                      key={pos.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPending((p) => ({ ...p, wordType: pos.value }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                        isActive
                          ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                          : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]"
                      )}
                    >
                      {t(pos.labelBn, pos.label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Category / Topics */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                <Layers className="size-3.5" />
                <span>{t("বিষয় বা ক্যাটাগরি", "Category / Topic")}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                {categoryChoices.map((c) => {
                  const isActive = pending.category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPending((p) => ({ ...p, category: c.value }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5",
                        isActive
                          ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                          : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]"
                      )}
                    >
                      <span>{t(c.labelBn, c.label)}</span>
                      {isActive && <Check className="size-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Sort Order */}
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#242423]/50 dark:text-zinc-400 mb-2">
                <ArrowUpDown className="size-3.5" />
                <span>{t("সাজানোর ক্রম", "Sort Order")}</span>
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {SORT_OPTIONS.map((s) => {
                  const isActive = pending.sort === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPending((p) => ({ ...p, sort: s.value }))}
                      className={cn(
                        "rounded-full p-2 text-center text-xs font-semibold transition-all active:scale-95",
                        isActive
                          ? "bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]"
                          : "bg-[#f1f1ef] text-[#242423]/70 hover:bg-[#eaeae8] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-300 dark:hover:bg-[#2c2c30]"
                      )}
                    >
                      {t(s.labelBn, s.label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setPending({
                    sort: "default",
                    category: "all",
                    wordType: "all",
                    status: "all",
                  });
                }}
                className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-black/[0.08] px-5 text-xs font-semibold text-[#242423]/70 hover:bg-[#f1f1ef] hover:text-[#242423] active:scale-95 dark:border-white/[0.1] dark:text-zinc-300 dark:hover:bg-[#252528] dark:hover:text-white"
              >
                <RotateCcw className="size-3.5" />
                <span>{t("রিসেট", "Reset")}</span>
              </button>

              <button
                type="button"
                onClick={() => push(pending)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#242423] px-6 text-xs font-bold text-white shadow-xs hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200 transition-all"
              >
                <span>
                  {t(
                    `প্রয়োগ করুন ${pendingActiveCount > 0 ? `(${pendingActiveCount})` : ""}`,
                    `Apply Filters ${pendingActiveCount > 0 ? `(${pendingActiveCount})` : ""}`
                  )}
                </span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
