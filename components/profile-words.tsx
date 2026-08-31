"use client";

import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import { Word } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DailyGoalCard } from "@/components/daily-goal";
import { useActiveTab, setActiveTab } from "@/lib/profile-tab-store";
import { useQuizActivity } from "@/lib/use-quiz-activity";
import { Classic } from "@/components/classic";

const ITEMS_PER_PAGE = 10;
import {
  BookmarkCheck, CheckCircle2, Bookmark, Circle,
  BookOpen, BarChart3, Award, TrendingUp, RefreshCw, X, GraduationCap,
} from "lucide-react";


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

function WordItem({
  word,
  isLearned,
  isBookmarked,
  onToggleBookmark,
  onToggleLearned,
}: {
  word: Word;
  isLearned: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onToggleLearned: () => void;
}) {
  const colorCfg = levelColors[word.level];

  return (
    <div
      onDoubleClick={onToggleLearned}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-sm p-5 sm:p-6 transition-all duration-300",
        isLearned
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/30"
          : "border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b transition-all duration-300",
          isLearned
            ? "from-emerald-400 to-emerald-500 opacity-100"
            : `${colorCfg?.gradient} opacity-60`
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
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", colorCfg?.bg, colorCfg?.text)}>
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
          onClick={onToggleBookmark}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
            isBookmarked
              ? "text-amber-500 hover:text-amber-600"
              : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
          )}
          title={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
        <button
          onClick={onToggleLearned}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
            isLearned
              ? "text-emerald-500 hover:text-emerald-600"
              : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
          )}
          title={isLearned ? "Mark as unlearned" : "Mark as learned"}
        >
          {isLearned ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export function ProfileTabs({ words }: { words: Word[] }) {
  const activeTab = useActiveTab();
  const { bookmarkedIds, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const { learnedIds, isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const { stillLearningIds, removeStillLearning, loaded: stillLearningLoaded } = useStillLearningWords();
  const { totalCorrectAnswers, loaded: quizLoaded } = useQuizActivity();
  const loaded = bookmarkLoaded && learnedLoaded && stillLearningLoaded;

  const bookmarked = words.filter((w) => bookmarkedIds.has(wordKey(w)));
  const learned = words.filter((w) => learnedIds.has(wordKey(w)));
  const stillLearning = words.filter((w) => stillLearningIds.has(wordKey(w)));
  const total = words.length;

  const [bookmarkedPage, setBookmarkedPage] = useState(1);
  const [stillLearningPage, setStillLearningPage] = useState(1);
  const [learnedPage, setLearnedPage] = useState(1);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <Classic className="size-6" />
      </div>
    );
  }

  const levelStats = levelOrder.map((lvl) => {
    const totalInLevel = words.filter((w) => w.level === lvl).length;
    const learnedInLevel = learned.filter((w) => w.level === lvl).length;
    const stillLearningInLevel = stillLearning.filter((w) => w.level === lvl).length;
    return { level: lvl, total: totalInLevel, learned: learnedInLevel, stillLearning: stillLearningInLevel };
  });

  const overallProgress = total > 0 ? Math.round((learned.length / total) * 100) : 0;

  const emptyState = (type: "bookmark" | "learned" | "still-learning") => {
    const Icon = type === "bookmark" ? Bookmark : type === "learned" ? Circle : RefreshCw;
    const messages: Record<string, { title: string; desc: string }> = {
      bookmark: { title: "No bookmarked words yet.", desc: "Bookmark words while browsing to save them here." },
      learned: { title: "No learned words yet.", desc: "Mark words as learned to track your progress." },
      "still-learning": { title: "No words to review.", desc: "Quiz incorrect answers will appear here for extra practice." },
    };
    const msg = messages[type];
    return (
      <div className="text-center py-20">
        <Icon className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{msg.title}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs">{msg.desc}</p>
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
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
          <TabsTrigger value="still-learning" className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Still Learning
            {stillLearning.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {stillLearning.length}
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
      </div>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            icon={<RefreshCw className="h-5 w-5 text-orange-600" />}
            label="Still Learning"
            value={stillLearning.length}
            sub={total > 0 ? `${Math.round((stillLearning.length / total) * 100)}% of total` : undefined}
            color="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            icon={<Award className="h-5 w-5 text-emerald-600" />}
            label="Learned"
            value={learned.length}
            sub={`${overallProgress}% of total`}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>

        <div className="mb-8">
          <DailyGoalCard />
        </div>

        {/* Quiz Progress */}
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="h-5 w-5 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Quiz Progress
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {quizLoaded ? totalCorrectAnswers : "—"}
                </div>
                <div className="text-xs text-zinc-400">Correct Answers</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stillLearning.length}
                </div>
                <div className="text-xs text-zinc-400">Wrong Words</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {quizLoaded ? totalCorrectAnswers + stillLearning.length : "—"}
                </div>
                <div className="text-xs text-zinc-400">Total Quiz</div>
              </div>
            </div>
          </div>
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
        {bookmarked.length > 0 ? (() => {
          const totalPagesB = Math.max(1, Math.ceil(bookmarked.length / ITEMS_PER_PAGE));
          const currentPageB = Math.min(bookmarkedPage, totalPagesB);
          const startB = (currentPageB - 1) * ITEMS_PER_PAGE;
          const pageWordsB = bookmarked.slice(startB, startB + ITEMS_PER_PAGE);
          return (
            <>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                {bookmarked.length} bookmarked word{bookmarked.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {pageWordsB.map((word) => (
                  <WordItem
                    key={wordKey(word)}
                    word={word}
                    isLearned={isLearned(word.id, word.word)}
                    isBookmarked={true}
                    onToggleBookmark={() => toggleBookmark(word.id, word.word)}
                    onToggleLearned={() => toggleLearned(word.id, word.word)}
                  />
                ))}
              </div>
              <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Showing {startB + 1}&ndash;{Math.min(startB + ITEMS_PER_PAGE, bookmarked.length)} of {bookmarked.length}
              </p>
              {totalPagesB > 1 && (
                <Pagination>
                  <div className="flex items-center gap-0.5 max-w-full">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageB > 1) setBookmarkedPage(currentPageB - 1); }}
                        className={cn(currentPageB <= 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                      <PaginationContent>
                        {Array.from({ length: totalPagesB }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); setBookmarkedPage(p); }}
                              isActive={p === currentPageB}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      </PaginationContent>
                    </div>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageB < totalPagesB) setBookmarkedPage(currentPageB + 1); }}
                        className={cn(currentPageB >= totalPagesB ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                  </div>
                </Pagination>
              )}
            </>
          );
        })() : (
          emptyState("bookmark")
        )}
      </TabsContent>

      <TabsContent value="still-learning">
        {stillLearning.length > 0 ? (() => {
          const totalPagesS = Math.max(1, Math.ceil(stillLearning.length / ITEMS_PER_PAGE));
          const currentPageS = Math.min(stillLearningPage, totalPagesS);
          const startS = (currentPageS - 1) * ITEMS_PER_PAGE;
          const pageWordsS = stillLearning.slice(startS, startS + ITEMS_PER_PAGE);
          return (
            <>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                {stillLearning.length} word{stillLearning.length !== 1 ? "s" : ""} to review
              </p>
              <div className="space-y-4">
                {pageWordsS.map((word) => (
                  <div
                    key={wordKey(word)}
                    onDoubleClick={() => toggleLearned(word.id, word.word)}
                    className="relative overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300"
                  >
                    <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-gradient-to-b from-orange-400 to-amber-500 opacity-60" />
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
                          bookmarkedIds.has(wordKey(word))
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
                        )}
                        title={bookmarkedIds.has(wordKey(word)) ? "Remove bookmark" : "Bookmark"}
                      >
                        {bookmarkedIds.has(wordKey(word)) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => toggleLearned(word.id, word.word)}
                        className={cn(
                          "p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                          learnedIds.has(wordKey(word))
                            ? "text-emerald-500 hover:text-emerald-600"
                            : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
                        )}
                        title={learnedIds.has(wordKey(word)) ? "Mark as unlearned" : "Mark as learned"}
                      >
                        {learnedIds.has(wordKey(word)) ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => removeStillLearning(word.id, word.word)}
                        className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
                        title="Remove from still learning"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Showing {startS + 1}&ndash;{Math.min(startS + ITEMS_PER_PAGE, stillLearning.length)} of {stillLearning.length}
              </p>
              {totalPagesS > 1 && (
                <Pagination>
                  <div className="flex items-center gap-0.5 max-w-full">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageS > 1) setStillLearningPage(currentPageS - 1); }}
                        className={cn(currentPageS <= 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                      <PaginationContent>
                        {Array.from({ length: totalPagesS }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); setStillLearningPage(p); }}
                              isActive={p === currentPageS}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      </PaginationContent>
                    </div>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageS < totalPagesS) setStillLearningPage(currentPageS + 1); }}
                        className={cn(currentPageS >= totalPagesS ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                  </div>
                </Pagination>
              )}
            </>
          );
        })() : (
          emptyState("still-learning")
        )}
      </TabsContent>

      <TabsContent value="learned">
        {learned.length > 0 ? (() => {
          const totalPagesL = Math.max(1, Math.ceil(learned.length / ITEMS_PER_PAGE));
          const currentPageL = Math.min(learnedPage, totalPagesL);
          const startL = (currentPageL - 1) * ITEMS_PER_PAGE;
          const pageWordsL = learned.slice(startL, startL + ITEMS_PER_PAGE);
          return (
            <>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
                {learned.length} learned word{learned.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-4">
                {pageWordsL.map((word) => (
                  <WordItem
                    key={wordKey(word)}
                    word={word}
                    isLearned={true}
                    isBookmarked={bookmarkedIds.has(wordKey(word))}
                    onToggleBookmark={() => toggleBookmark(word.id, word.word)}
                    onToggleLearned={() => toggleLearned(word.id, word.word)}
                  />
                ))}
              </div>
              <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Showing {startL + 1}&ndash;{Math.min(startL + ITEMS_PER_PAGE, learned.length)} of {learned.length}
              </p>
              {totalPagesL > 1 && (
                <Pagination>
                  <div className="flex items-center gap-0.5 max-w-full">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageL > 1) setLearnedPage(currentPageL - 1); }}
                        className={cn(currentPageL <= 1 ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                      <PaginationContent>
                        {Array.from({ length: totalPagesL }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => { e.preventDefault(); setLearnedPage(p); }}
                              isActive={p === currentPageL}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      </PaginationContent>
                    </div>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPageL < totalPagesL) setLearnedPage(currentPageL + 1); }}
                        className={cn(currentPageL >= totalPagesL ? "pointer-events-none opacity-50" : "")}
                      />
                    </PaginationItem>
                  </div>
                </Pagination>
              )}
            </>
          );
        })() : (
          emptyState("learned")
        )}
      </TabsContent>
    </Tabs>
  );
}
