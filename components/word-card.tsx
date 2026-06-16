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
  const learned = isLearned(word.id, word.word);
  const bookmarked = isBookmarked(word.id, word.word);
  const loaded = learnedLoaded && bookmarkLoaded;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5",
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
            : `${gradient} opacity-60 group-hover:opacity-100 group-hover:w-1.5`
        )}
      />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />
      <div className="pl-4 sm:pl-5">
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {word.word}
          </h2>
          <button
            onClick={() => speak(word.word)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Listen to pronunciation"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800/60 rounded-md px-2 py-0.5">
            {word.parts_of_speech}
          </span>
        </div>
        {word.meaning_bn !== "..." && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
            {word.meaning_bn}
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {`${word.definition_en} (${word.definition_bn})`}
        </p>
        {word.examples_en.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            {word.examples_en.map((ex, i) => (
              <p key={i} className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        )}
        {word.examples_bn.length > 0 && (
          <div className="mt-1 space-y-1.5 dark:border-zinc-800 pt-1">
            {word.examples_bn.map((ex, i) => (
              <p key={i} className="text-sm text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>

      {loaded && (
        <>
          <button
            onClick={() => toggleBookmark(word.id, word.word)}
            className={cn(
              "absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              bookmarked
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-300 dark:text-zinc-600 sm:opacity-0 sm:group-hover:opacity-100 hover:text-zinc-400 dark:hover:text-zinc-500"
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
            onClick={() => toggleLearned(word.id, word.word)}
            className={cn(
              "absolute top-12 right-3 p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              learned
                ? "text-emerald-500 hover:text-emerald-600"
                : "text-zinc-300 dark:text-zinc-600 sm:opacity-0 sm:group-hover:opacity-100 hover:text-zinc-400 dark:hover:text-zinc-500"
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
