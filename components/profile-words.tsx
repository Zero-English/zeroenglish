"use client";

import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { Word } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookmarkCheck, CheckCircle2, Bookmark, Circle,
  BookOpen, BarChart3, Award, TrendingUp,
} from "lucide-react";
import Link from "next/link";

const levelColors: Record<string, { bg: string; border: string; text: string; gradient: string; label: string }> = {
  A1: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", gradient: "from-emerald-500 to-teal-500", label: "Beginner" },
  A2: { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800", text: "text-sky-700 dark:text-sky-300", gradient: "from-sky-500 to-blue-500", label: "Elementary" },
  B1: { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", gradient: "from-amber-500 to-orange-500", label: "Intermediate" },
  B2: { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", gradient: "from-rose-500 to-pink-500", label: "Upper Intermediate" },
};

function wordKey(w: Word) {
  return `${w.id}|${w.word}`;
}

const levelOrder = ["A1", "A2", "B1", "B2"];

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-xl", color)}>
          {icon}
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      {sub && (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</div>
      )}
    </div>
  );
}

export function ProfileTabs({ words }: { words: Word[] }) {
  const { bookmarkedIds, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const { learnedIds, isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const loaded = bookmarkLoaded && learnedLoaded;

  const bookmarked = words.filter((w) => bookmarkedIds.has(wordKey(w)));
  const learned = words.filter((w) => learnedIds.has(wordKey(w)));
  const total = words.length;

  if (!loaded) {
    return (
      <div className="text-center py-20 text-zinc-400 text-sm">
        Loading...
      </div>
    );
  }

  const levelStats = levelOrder.map((lvl) => {
    const totalInLevel = words.filter((w) => w.level === lvl).length;
    const learnedInLevel = learned.filter((w) => w.level === lvl).length;
    return { level: lvl, total: totalInLevel, learned: learnedInLevel };
  });

  const overallProgress = total > 0 ? Math.round((learned.length / total) * 100) : 0;

  function WordItem({ word }: { word: Word }) {
    const learned = isLearned(word.id, word.word);
    const bookmarked = bookmarkedIds.has(wordKey(word));

    return (
      <div
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
            className={cn(
              "p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              bookmarked
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
            )}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
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
            {learned ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>
        </div>
      </div>
    );
  }

  const emptyState = (type: "bookmark" | "learned") => {
    const Icon = type === "bookmark" ? Bookmark : Circle;
    const href = type === "bookmark" ? "/" : "/";
    return (
      <div className="text-center py-20">
        <Icon className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
          {type === "bookmark"
            ? "No bookmarked words yet."
            : "No learned words yet."}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          &larr; Browse vocabulary
        </Link>
      </div>
    );
  };

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview" className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="bookmarked" className="flex items-center gap-1.5">
          <BookmarkCheck className="h-4 w-4" />
          Bookmarked
          {bookmarked.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {bookmarked.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="learned" className="flex items-center gap-1.5">
          <Award className="h-4 w-4" />
          Learned
          {learned.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {learned.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-sky-600" />}
            label="Total Words"
            value={total}
            color="bg-sky-100 dark:bg-sky-900/30"
          />
          <StatCard
            icon={<BookmarkCheck className="h-5 w-5 text-amber-600" />}
            label="Bookmarked"
            value={bookmarked.length}
            sub={total > 0 ? `${Math.round((bookmarked.length / total) * 100)}% of total` : undefined}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            icon={<Award className="h-5 w-5 text-emerald-600" />}
            label="Learned"
            value={learned.length}
            sub={`${overallProgress}% of total`}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>

        {/* Progress by level */}
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Progress by Level
            </h3>
          </div>
          <div className="space-y-4">
            {levelStats.map(({ level, total: t, learned: l }) => {
              const pct = t > 0 ? Math.round((l / t) * 100) : 0;
              const c = levelColors[level];
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold", c.text)}>{level}</span>
                      <span className="text-xs text-zinc-400">{c.label}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {l}/{t} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", c.gradient)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Overall</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{overallProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-700 dark:from-zinc-400 dark:to-zinc-200 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bookmarked">
        {bookmarked.length > 0 ? (
          <>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
              {bookmarked.length} bookmarked word{bookmarked.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {bookmarked.map((word) => (
                <WordItem key={wordKey(word)} word={word} />
              ))}
            </div>
          </>
        ) : (
          emptyState("bookmark")
        )}
      </TabsContent>

      <TabsContent value="learned">
        {learned.length > 0 ? (
          <>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
              {learned.length} learned word{learned.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {learned.map((word) => (
                <WordItem key={wordKey(word)} word={word} />
              ))}
            </div>
          </>
        ) : (
          emptyState("learned")
        )}
      </TabsContent>
    </Tabs>
  );
}
