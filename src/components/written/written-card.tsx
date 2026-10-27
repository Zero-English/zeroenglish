"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, CheckCircle2, Bookmark, FileText } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export type WrittenCardItem = {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  metaDescription?: string | null;
  writtenType: {
    id: number;
    name: string;
  };
  writtenBy?: {
    id: number;
    name: string | null;
    user_name: string;
    image?: string | null;
  } | null;
  contentEnEasy?: string;
  contentEnMedium?: string;
  contentEnHard?: string;
  contentBnEasy?: string;
  contentBnMedium?: string;
  contentBnHard?: string;
  createdAt: string | Date;
};

function estimateReadingTime(words: number): string {
  const minutes = Math.max(1, Math.ceil(words / 150));
  return `${minutes} min`;
}

function countWords(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WrittenCard({
  item,
  className,
}: {
  item: WrittenCardItem;
  className?: string;
}) {
  const t = useT();
  const [isLearned, setIsLearned] = useState(false);

  // Check learned status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zeroenglish_learned_writings");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(item.slug)) {
          setIsLearned(true);
        }
      }
    } catch {
      // Ignore
    }
  }, [item.slug]);

  const hasEasy = Boolean(item.contentEnEasy?.trim() || item.contentBnEasy?.trim());
  const hasMedium = Boolean(item.contentEnMedium?.trim() || item.contentBnMedium?.trim());
  const hasHard = Boolean(item.contentEnHard?.trim() || item.contentBnHard?.trim());

  // Estimate words from medium tier (or first available tier)
  const sampleContent =
    item.contentEnMedium ||
    item.contentEnEasy ||
    item.contentEnHard ||
    item.contentBnMedium ||
    item.contentBnEasy ||
    "";
  const words = countWords(sampleContent);
  const readingTime = estimateReadingTime(words);

  const excerpt =
    item.metaDescription?.trim() ||
    sampleContent
      .replace(/[#*`_~>\-[\]()|]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 130) + "...";

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden",
        isLearned && "border-emerald-500/30 bg-emerald-500/[0.02]",
        className
      )}
    >
      {/* Notebook Ruled Red Margin Guide (Visual cue of lined paper notebook) */}
      <div
        className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-rose-400/40 dark:bg-rose-500/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Notebook Binder Punch Dots along the left edge */}
      <div
        className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity"
        aria-hidden="true"
      >
        <span className="size-1.5 rounded-full bg-border shadow-inner" />
        <span className="size-1.5 rounded-full bg-border shadow-inner" />
        <span className="size-1.5 rounded-full bg-border shadow-inner" />
      </div>

      <div className="pl-4">
        {/* Top Note Header: Category Badge, Note #, and Learned Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="text-xs font-semibold bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-md"
            >
              {item.writtenType.name}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
              #{item.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLearned && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold"
                title="You marked this note as studied!"
              >
                <CheckCircle2 className="size-3" />
                <span>{t("পড়া শেষ", "Learned")}</span>
              </span>
            )}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              <span>{readingTime}</span>
            </div>
          </div>
        </div>

        {/* Titles: English & Bengali in clean student notebook typography */}
        <Link href={`/written/${item.slug}`} className="block focus:outline-none">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {item.titleEn}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 line-clamp-1">
            {item.titleBn}
          </p>
        </Link>

        {/* Excerpt Snippet */}
        {excerpt && (
          <p className="mt-2.5 text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Multi-Tier Difficulty Level Indicators */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-2 border-t border-border/40 text-[11px]">
          <span className="text-muted-foreground/60 mr-1 text-[10px] uppercase font-semibold">
            {t("লেভেল:", "Tiers:")}
          </span>
          {hasEasy && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Easy
            </span>
          )}
          {hasMedium && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Medium
            </span>
          )}
          {hasHard && (
            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-400 border border-rose-500/20">
              <span className="size-1.5 rounded-full bg-rose-500" />
              Hard
            </span>
          )}
        </div>
      </div>

      {/* Footer: Author byline & Page Turn CTA */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-3 pl-4">
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar
            id={item.writtenBy?.id || 1}
            name={item.writtenBy?.name || item.writtenBy?.user_name || "Zero English"}
            image={item.writtenBy?.image || null}
            className="size-5 shrink-0"
          />
          <span className="text-[11px] text-muted-foreground truncate">
            {item.writtenBy?.name || item.writtenBy?.user_name || "Zero English"}
          </span>
        </div>

        <Link
          href={`/written/${item.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0 group-hover:translate-x-0.5 transition-transform"
        >
          <span>{t("নোট খুলুন", "Open Note")}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
