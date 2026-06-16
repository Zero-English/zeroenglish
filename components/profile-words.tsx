"use client";

import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BookmarkCheck, CheckCircle2, Bookmark, Circle } from "lucide-react";
import Link from "next/link";

const levelColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  A1: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", gradient: "from-emerald-500 to-teal-500" },
  A2: { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800", text: "text-sky-700 dark:text-sky-300", gradient: "from-sky-500 to-blue-500" },
  B1: { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", gradient: "from-amber-500 to-orange-500" },
  B2: { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", gradient: "from-rose-500 to-pink-500" },
};

function wordKey(w: Word) {
  return `${w.id}|${w.word}`;
}

export function ProfileWords({ words }: { words: Word[] }) {
  const { bookmarkedIds, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const { isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const loaded = bookmarkLoaded && learnedLoaded;

  const bookmarked = words.filter((w) => bookmarkedIds.has(wordKey(w)));

  if (!loaded) {
    return (
      <div className="text-center py-20 text-zinc-400 text-sm">
        Loading...
      </div>
    );
  }

  if (bookmarked.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
          No bookmarked words yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          &larr; Browse vocabulary
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        {bookmarked.length} bookmarked word{bookmarked.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-4">
        {bookmarked.map((word) => {
          const learned = isLearned(word.id, word.word);
          return (
            <div
              key={word.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5 sm:p-6 transition-all duration-300",
                learned
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/30"
                  : "border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60"
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b transition-all duration-300",
                  learned
                    ? "from-emerald-400 to-emerald-500 opacity-100"
                    : `${levelColors[word.level]?.gradient} opacity-60`
                )}
              />
              <div className="pl-4 sm:pl-5 pr-16">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {word.word}
                  </h2>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 rounded-md px-2 py-0.5">
                    {word.parts_of_speech}
                  </span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", levelColors[word.level]?.bg, levelColors[word.level]?.text)}>
                    {word.level}
                  </span>
                </div>
                {word.meaning_bn !== "..." && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                    {word.meaning_bn}
                  </p>
                )}
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {word.definition_en}
                </p>
              </div>

              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => toggleBookmark(word.id, word.word)}
                  className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 text-amber-500 hover:text-amber-600"
                  title="Remove bookmark"
                >
                  <BookmarkCheck className="h-5 w-5" />
                </button>
                <button
                  onClick={() => toggleLearned(word.id, word.word)}
                  className={cn(
                    "p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                    learned
                      ? "text-emerald-500 hover:text-emerald-600"
                      : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
                  )}
                  title={learned ? "Mark as unlearned" : "Mark as learned"}
                >
                  {learned ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
