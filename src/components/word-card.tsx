"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useSpeak } from "@/lib/use-speak";
import type { Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import {
  Check,
  Bookmark,
  Volume2,
  ArrowUpRight,
} from "lucide-react";

interface WordCardProps {
  word: Word;
  gradient?: string;
  isFirst?: boolean;
}

export function WordCard({ word, isFirst }: WordCardProps) {
  const speak = useSpeak();
  const t = useT();
  const { isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const learned = isLearned(word.id);
  const bookmarked = isBookmarked(word.id);
  const loaded = learnedLoaded && bookmarkLoaded;

  const primaryMeanings = useMemo(
    () => word.meaningBn.filter((m) => m && m !== "..."),
    [word.meaningBn]
  );

  // Highlight the target word inside example sentences
  const renderHighlightedSentence = (sentence: string, targetWord: string) => {
    if (!sentence || !targetWord) return sentence;
    const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    const parts = sentence.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === targetWord.toLowerCase() ? (
        <mark
          key={i}
          className="rounded-[5px] bg-[#242423]/[0.08] px-1 py-0.5 font-semibold text-[#242423] dark:bg-white/[0.14] dark:text-white"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const wordSlug = encodeURIComponent(word.word.toLowerCase());
  const formattedCategory = word.category
    ? word.category.replace(/([a-z])([A-Z])/g, "$1 $2")
    : "";

  return (
    <article
      onDoubleClick={() => loaded && toggleLearned(word.id)}
      {...(isFirst ? { "data-tour": "word-card" } : {})}
      className={cn(
        "group relative rounded-[24px] border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04),0_18px_40px_-14px_rgba(0,0,0,0.09)] dark:bg-[#1c1c1e] sm:rounded-[28px] sm:p-5",
        learned
          ? "border-emerald-500/35 ring-1 ring-emerald-500/15 dark:border-emerald-500/30 dark:ring-emerald-500/10"
          : "border-black/[0.06] dark:border-white/[0.08]"
      )}
    >
      {/* Header Row: Audio + Word + Metadata + Compact Action Discs */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(word.word);
            }}
            className="mt-0.5 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423] transition-all duration-150 hover:bg-[#242423] hover:text-white active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-white dark:hover:text-[#242423]"
            title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
            aria-label={`Listen to ${word.word}`}
          >
            <Volume2 className="size-[18px]" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="text-[21px] font-bold leading-tight tracking-tight text-[#242423] dark:text-[#f3f3f2] sm:text-[24px]">
                <Link
                  href={`/vocabulary/${wordSlug}`}
                  className="transition-colors hover:text-black dark:hover:text-white"
                >
                  {word.word}
                </Link>
              </h2>

              {learned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {t("আয়ত্ত", "Mastered")}
                </span>
              )}
            </div>

            {/* Quiet Metadata Line: Part of Speech · Category */}
            {(word.wordType.length > 0 || formattedCategory) && (
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-[#242423]/55 dark:text-zinc-400">
                {word.wordType.length > 0 && (
                  <span className="font-mono text-[11.5px] font-medium text-[#242423]/70 dark:text-zinc-300">
                    {word.wordType.join(" · ")}
                  </span>
                )}
                {word.wordType.length > 0 && formattedCategory && (
                  <span aria-hidden="true" className="text-[#242423]/25 dark:text-zinc-600">
                    •
                  </span>
                )}
                {formattedCategory && (
                  <span className="truncate">{formattedCategory}</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Circular Tactile Action Controls */}
        {loaded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            {...(isFirst ? { "data-tour": "card-actions" } : {})}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(word.id);
              }}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? t("সংরক্ষণ সরান", "Remove bookmark") : t("সংরক্ষণ করুন", "Save word")}
              title={bookmarked ? t("সংরক্ষণ সরান", "Remove bookmark") : t("সংরক্ষণ করুন", "Save word")}
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-150 active:scale-90",
                bookmarked
                  ? "bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400"
                  : "bg-[#f1f1ef] text-[#242423]/55 hover:bg-[#e7e7e4] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-400 dark:hover:bg-[#2e2e32] dark:hover:text-zinc-200"
              )}
            >
              <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleLearned(word.id);
              }}
              aria-pressed={learned}
              aria-label={learned ? t("শেখা বাতিল করুন", "Mark unlearned") : t("আয়ত্ত হিসেবে চিহ্নিত করুন", "Mark as learned")}
              title={learned ? t("শেখা বাতিল করুন", "Mark unlearned") : t("আয়ত্ত হিসেবে চিহ্নিত করুন", "Mark as learned")}
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-150 active:scale-90",
                learned
                  ? "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600 dark:bg-emerald-500 dark:text-white"
                  : "bg-[#f1f1ef] text-[#242423]/55 hover:bg-[#e7e7e4] hover:text-[#242423] dark:bg-[#252528] dark:text-zinc-400 dark:hover:bg-[#2e2e32] dark:hover:text-zinc-200"
              )}
            >
              <Check className="size-4 stroke-[2.4]" />
            </button>
          </div>
        )}
      </div>

      {/* Inset Bengali Meaning Module */}
      {(primaryMeanings.length > 0 || word.definitionBn) && (
        <div className="mt-3.5 rounded-[18px] bg-[#f1f1ef] px-4 py-3 dark:bg-[#252528] sm:rounded-[20px]">
          {primaryMeanings.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              {primaryMeanings.map((meaning, idx) => (
                <span
                  key={idx}
                  className="text-[17px] font-bold leading-snug text-[#242423] dark:text-[#f3f3f2] sm:text-[18px]"
                >
                  {meaning}
                  {idx < primaryMeanings.length - 1 && (
                    <span className="ml-2.5 font-normal text-[#242423]/25 dark:text-zinc-600">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {word.definitionBn && (
            <p
              className={cn(
                "text-[13px] leading-relaxed text-[#242423]/70 dark:text-zinc-300",
                primaryMeanings.length > 0 &&
                  "mt-2 border-t border-black/[0.05] pt-2 dark:border-white/[0.06]"
              )}
            >
              {word.definitionBn}
            </p>
          )}
        </div>
      )}

      {/* English Definition & Example */}
      {(word.definitionEn || word.examplesEn.length > 0) && (
        <div className="mt-3.5 space-y-2.5 px-0.5">
          {word.definitionEn && (
            <p className="text-[13.5px] leading-relaxed text-[#242423]/80 dark:text-zinc-200 sm:text-[14px]">
              {word.definitionEn}
            </p>
          )}

          {word.examplesEn.length > 0 && (
            <div className="rounded-[14px] bg-[#f8f8f6] px-3.5 py-2.5 ring-1 ring-black/[0.04] dark:bg-white/[0.03] dark:ring-white/[0.06]">
              <p className="text-[13px] leading-relaxed text-[#242423]/90 dark:text-zinc-200 sm:text-[13.5px]">
                &ldquo;{renderHighlightedSentence(word.examplesEn[0], word.word)}&rdquo;
              </p>
              {word.examples_bn?.[0] && (
                <p className="mt-1 text-[12px] leading-relaxed text-[#242423]/55 dark:text-zinc-400">
                  {word.examples_bn[0]}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quiet Synonyms & Antonyms Row */}
      {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 px-0.5">
          {word.synonyms.slice(0, 3).map((syn, i) => (
            <Link
              key={`syn-${i}`}
              href={`/vocabulary/${encodeURIComponent(syn.toLowerCase())}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.035] px-2.5 py-1 text-[11px] font-medium text-[#242423]/75 transition-colors hover:bg-black/[0.07] hover:text-[#242423] active:scale-95 dark:bg-white/[0.05] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
              title={t("সমার্থক শব্দ", "Synonym")}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{syn}</span>
            </Link>
          ))}

          {word.antonyms.slice(0, 3).map((ant, i) => (
            <Link
              key={`ant-${i}`}
              href={`/vocabulary/${encodeURIComponent(ant.toLowerCase())}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.035] px-2.5 py-1 text-[11px] font-medium text-[#242423]/75 transition-colors hover:bg-black/[0.07] hover:text-[#242423] active:scale-95 dark:bg-white/[0.05] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
              title={t("বিপরীত শব্দ", "Antonym")}
            >
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span>{ant}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Minimal Footer */}
      <div className="mt-3.5 flex items-center justify-between border-t border-black/[0.05] pt-3 dark:border-white/[0.06]">
        <span className="text-[11px] text-[#242423]/40 dark:text-zinc-500">
          <span className="hidden sm:inline">
            {t("ডাবল-ট্যাপ করে শেখা মার্ক করুন", "Double-tap to mark mastered")}
          </span>
          <span className="sm:hidden">
            {t("ট্যাপ করে বিস্তারিত দেখুন", "Tap word for full details")}
          </span>
        </span>

        <Link
          href={`/vocabulary/${wordSlug}`}
          className="group/link inline-flex items-center gap-1 rounded-full bg-[#f1f1ef] px-3 py-1 text-[11.5px] font-semibold text-[#242423] transition-all hover:bg-[#242423] hover:text-white active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-white dark:hover:text-[#242423]"
        >
          <span>{t("বিস্তারিত", "Details")}</span>
          <ArrowUpRight className="size-3.5 transition-transform duration-150 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
