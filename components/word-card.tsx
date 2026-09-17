"use client";

import { useLearnedWords } from "@/lib/use-learned-words";
import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useSpeak } from "@/lib/use-speak";
import { Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Bookmark, BookmarkCheck, Volume2 } from "lucide-react";

interface WordCardProps {
  word: Word;
  gradient: string;
}

export function WordCard({ word, gradient }: WordCardProps) {
  const speak = useSpeak();
  const { isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const { isBookmarked, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const learned = isLearned(word.id);
  const bookmarked = isBookmarked(word.id);
  const loaded = learnedLoaded && bookmarkLoaded;

  return (
    <div
      onDoubleClick={() => loaded && toggleLearned(word.id)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5 sm:p-6 transition-all duration-300",
        "shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)]",
        "hover:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_16px_40px_-12px_rgba(16,24,40,0.14)]",
        "active:shadow-[0_2px_4px_rgba(16,24,40,0.05),0_16px_40px_-12px_rgba(16,24,40,0.14)]",
        learned
          ? "border-emerald-300/70 dark:border-emerald-700/70 bg-emerald-500/[0.04] dark:bg-emerald-950/20"
          : "border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b transition-all duration-300",
          learned
            ? "from-emerald-400 to-emerald-500 opacity-100"
            : `${gradient} opacity-60 group-hover:opacity-100 group-hover:w-1.5 group-active:opacity-100 group-active:w-1.5`
        )}
      />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
      <div className="pl-4 sm:pl-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 mb-1.5">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {word.word}
          </h2>
          <button
            onClick={() => speak(word.word)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 active:text-zinc-600 hover:bg-black/[0.04] active:bg-black/[0.04] dark:hover:text-zinc-300 dark:active:text-zinc-300 dark:hover:bg-white/[0.06] dark:active:bg-white/[0.06] transition-colors self-center"
            title="Listen to pronunciation"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono bg-black/[0.04] dark:bg-white/[0.06] rounded-md px-2 py-0.5">
            {word.wordType.join(", ")}
          </span>
          {word.category && (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-500/10 rounded-md px-2 py-0.5">
              {word.category.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </span>
          )}
        </div>
        {word.meaningBn.length > 0 && word.meaningBn[0] !== "..." && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 font-medium">
            {word.meaningBn.join("; ")}
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {`${word.definitionEn} (${word.definitionBn})`}
        </p>
        {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
            {word.synonyms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Synonyms
                </span>
                {word.synonyms.map((syn, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300"
                  >
                    {syn}
                  </span>
                ))}
              </div>
            )}
            {word.antonyms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Antonyms
                </span>
                {word.antonyms.map((ant, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs text-rose-700 dark:text-rose-300"
                  >
                    {ant}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {word.examplesEn.length > 0 && word.examples_bn.length > 0 ? (
          <div className="mt-3 space-y-3 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
            {Array.from({
              length: Math.max(word.examplesEn.length, word.examples_bn.length),
            }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                {word.examplesEn[i] && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                    &ldquo;{word.examplesEn[i]}&rdquo;
                  </p>
                )}
                {word.examples_bn[i] && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                    &ldquo;{word.examples_bn[i]}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : word.examplesEn.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
            {word.examplesEn.map((ex, i) => (
              <p key={i} className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        ) : word.examples_bn.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
            {word.examples_bn.map((ex, i) => (
              <p key={i} className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {loaded && (
        <>
          <button
            onClick={() => toggleBookmark(word.id)}
            className={cn(
              "absolute top-3 right-3 p-1.5 rounded-full ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08] transition-all duration-200 hover:scale-110 active:scale-110",
              bookmarked
                ? "text-amber-500 bg-amber-500/10 hover:text-amber-600 active:text-amber-600"
                : "text-zinc-300 dark:text-zinc-500 bg-black/[0.03] dark:bg-white/[0.06] hover:text-zinc-500 active:text-zinc-500 dark:hover:text-zinc-300 dark:active:text-zinc-300"
            )}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => toggleLearned(word.id)}
            className={cn(
              "absolute top-12 right-3 p-1.5 rounded-full ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08] transition-all duration-200 hover:scale-110 active:scale-110",
              learned
                ? "text-emerald-500 bg-emerald-500/10 hover:text-emerald-600 active:text-emerald-600"
                : "text-zinc-300 dark:text-zinc-500 bg-black/[0.03] dark:bg-white/[0.06] hover:text-zinc-500 active:text-zinc-500 dark:hover:text-zinc-300 dark:active:text-zinc-300"
            )}
            title={learned ? "Mark as unlearned" : "Mark as learned"}
          >
            {learned ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        </>
      )}
    </div>
  );
}