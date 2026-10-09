"use client";

import { useBookmarkedWords } from "@/lib/use-bookmarked-words";
import { useLearnedWords } from "@/lib/use-learned-words";
import { useStillLearningWords } from "@/lib/use-still-learning-words";
import type { Word } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSpeak } from "@/lib/use-speak";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StaggerContainer, StaggerItem } from "@/components/stagger";
import { DailyGoalCard } from "@/components/daily-goal";
import { useActiveTab, setActiveTab } from "@/lib/profile-tab-store";
import { useQuizActivity } from "@/lib/use-quiz-activity";
import { Classic } from "@/components/classic";
import { ProfileActivityChart } from "@/components/profile-activity-chart";
import { QuizExamHistoryPanel } from "@/components/profile-quiz-exam-history";
import { useQuizHistory } from "@/lib/use-quiz-history";
import { useQuizExamHistoryStore } from "@/lib/quiz-exam-history-store";
import { CombinedExamResultsPanel } from "@/components/vocabulary-exam-results-panel";
import { QuizPracticeResultsPanel } from "@/components/quiz-practice-results-panel";
import { useSession } from "next-auth/react";
import { useT } from "@/components/language-provider";
import { useAuthStore } from "@/lib/auth-store";
import {
  BookmarkCheck, CheckCircle2, Bookmark, Circle,
  BookOpen, BookOpenCheck, BarChart3, Award, TrendingUp, RefreshCw, X, GraduationCap, Volume2, ClipboardList, Settings, SquarePen,
} from "lucide-react";
import { ProfileSettings } from "@/components/profile-settings";

const ITEMS_PER_PAGE = 10;

const levelColors: Record<string, { bg: string; border: string; text: string; gradient: string; label: string; labelBn: string }> = {
  A1: { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", gradient: "from-emerald-500 to-teal-500", label: "Beginner", labelBn: "শিক্ষানবিস" },
  A2: { bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800", text: "text-sky-700 dark:text-sky-300", gradient: "from-sky-500 to-blue-500", label: "Elementary", labelBn: "প্রাথমিক" },
  B1: { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", gradient: "from-amber-500 to-orange-500", label: "Intermediate", labelBn: "মাঝারি" },
  B2: { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", gradient: "from-rose-500 to-pink-500", label: "Upper Intermediate", labelBn: "উচ্চ-মাঝারি" },
  C1: { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", gradient: "from-violet-500 to-purple-500", label: "Advanced", labelBn: "উন্নত" },
  C2: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40", border: "border-fuchsia-200 dark:border-fuchsia-800", text: "text-fuchsia-700 dark:text-fuchsia-300", gradient: "from-fuchsia-500 to-pink-500", label: "Mastery", labelBn: "পারদর্শী" },
};

const CARD =
  "rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] dark:border-white/[0.08] dark:bg-zinc-900/60";

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
  color?: string;
}) {
  return (
    <StaggerItem className={cn(CARD, "p-5 transition-all duration-300 hover:border-black/[0.12] dark:hover:border-white/[0.15]")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]">
          {icon}
        </div>
        <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">{value}</div>
      {sub && (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium">{sub}</div>
      )}
    </StaggerItem>
  );
}

function WordCardDetails({ word }: { word: Word }) {
  const speak = useSpeak();
  const t = useT();
  const colorCfg = levelColors[word.level];

  return (
    <div className="pl-3 sm:pl-4 pr-16">
      <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {word.word}
        </h2>
        <button
          onClick={() => speak(word.word)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors bg-black/[0.03] dark:bg-white/[0.05] hover:bg-orange-50 dark:hover:bg-orange-950/30"
          title={t("উচ্চারণ শুনুন", "Listen to pronunciation")}
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] rounded-lg px-2 py-0.5">
          {word.wordType.join(", ")}
        </span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg border", colorCfg?.bg, colorCfg?.text, colorCfg?.border)}>
          {word.level}
        </span>
      </div>
      {word.meaningBn.length > 0 && word.meaningBn[0] !== "..." && (
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t("সমার্থক শব্দ", "Synonyms")}
              </span>
              {word.synonyms.map((syn, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
          {word.antonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t("বিপরীত শব্দ", "Antonyms")}
              </span>
              {word.antonyms.map((ant, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300"
                >
                  {ant}
                </span>
              ))}
            </div>
          )}
        </div>
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
  const t = useT();

  return (
    <StaggerItem
      onDoubleClick={onToggleLearned}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300 backdrop-blur-xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-12px_rgba(16,24,40,0.10)] cursor-pointer",
        isLearned
          ? "border-emerald-300/80 dark:border-emerald-700/80 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-600"
          : "border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/60 hover:border-black/[0.12] dark:hover:border-white/[0.15]"
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
      <WordCardDetails word={word} />

      <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl p-1 border border-black/[0.04] dark:border-white/[0.06]">
        <button
          onClick={onToggleBookmark}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95",
            isBookmarked
              ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
          title={isBookmarked ? t("বুকমার্ক সরান", "Remove bookmark") : t("বুকমার্ক করুন", "Bookmark")}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
        <button
          onClick={onToggleLearned}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95",
            isLearned
              ? "text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
          title={isLearned ? t("শেখা থেকে সরান", "Mark as unlearned") : t("শেখা হিসেবে চিহ্নিত করুন", "Mark as learned")}
        >
          {isLearned ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>
      </div>
    </StaggerItem>
  );
}

function EmptyWordState({ type }: { type: "bookmark" | "learned" | "still-learning" }) {
  const t = useT();
  const Icon = type === "bookmark" ? Bookmark : type === "learned" ? Circle : RefreshCw;
  const messages: Record<string, { title: string; desc: string }> = {
    bookmark: { title: t("এখনো কোনো বুকমার্ক করা শব্দ নেই।", "No bookmarked words yet."), desc: t("ব্রাউজ করার সময় শব্দ বুকমার্ক করলে সেগুলো এখানে দেখা যাবে।", "Bookmark words while browsing to save them here.") },
    learned: { title: t("এখনো কোনো শেখা শব্দ নেই।", "No learned words yet."), desc: t("অগ্রগতি ট্র্যাক করতে শব্দগুলোকে শেখা হিসেবে চিহ্নিত করুন।", "Mark words as learned to track your progress.") },
    "still-learning": { title: t("পর্যালোচনা করার কোনো শব্দ নেই।", "No words to review."), desc: t("কুইজে ভুল উত্তর দেওয়া শব্দগুলো অতিরিক্ত অনুশীলনের জন্য এখানে দেখা যাবে।", "Quiz incorrect answers will appear here for extra practice.") },
  };
  const msg = messages[type];
  return (
    <div className="text-center py-20">
      <Icon className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{msg.title}</p>
      <p className="text-zinc-400 dark:text-zinc-500 text-xs">{msg.desc}</p>
    </div>
  );
}

function PaginatedWordList({
  idSet,
  page,
  onPageChange,
  emptyType,
  onToggleBookmark,
  onToggleLearned,
  isBookmarked,
  isLearned,
}: {
  idSet: Set<string>;
  page: number;
  onPageChange: (p: number) => void;
  emptyType: "bookmark" | "learned" | "still-learning";
  onToggleBookmark: (id: number) => void;
  onToggleLearned: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  isLearned: (id: number) => boolean;
}) {
  const t = useT();
  const idsArray = useMemo(
    () => Array.from(idSet).map(Number).filter((n) => Number.isInteger(n) && n > 0),
    [idSet]
  );
  const totalCount = idsArray.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageIds = useMemo(
    () => idsArray.slice(start, start + ITEMS_PER_PAGE),
    [idsArray, start]
  );

  const [wordsMap, setWordsMap] = useState<Map<number, Word>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pageIds.length === 0) return;
    const missing = pageIds.filter((id) => !wordsMap.has(id));
    if (missing.length === 0) return;

    setLoading(true);
    fetch(`/api/v1/words/by-ids?ids=${missing.join(",")}`)
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: Word[] }) => {
        if (json.success && Array.isArray(json.data)) {
          setWordsMap((prev) => {
            const next = new Map(prev);
            for (const w of json.data!) next.set(w.id, w);
            return next;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageIds, wordsMap]);

  if (totalCount === 0) return <EmptyWordState type={emptyType} />;

  const pageWords = pageIds.map((id) => wordsMap.get(id)).filter(Boolean) as Word[];

  return (
    <>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        {emptyType === "bookmark"
          ? t(`${totalCount}টি বুকমার্ক করা শব্দ`, `${totalCount} bookmarked word${totalCount !== 1 ? "s" : ""}`)
          : emptyType === "learned"
          ? t(`${totalCount}টি শেখা শব্দ`, `${totalCount} learned word${totalCount !== 1 ? "s" : ""}`)
          : t(`${totalCount}টি শব্দ পর্যালোচনা করতে হবে`, `${totalCount} word${totalCount !== 1 ? "s" : ""} to review`)}
      </p>

      {loading && pageWords.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: Math.min(4, pageIds.length) }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StaggerContainer className="contents">
            {pageWords.map((word) => (
              <WordItem
                key={word.id}
                word={word}
                isLearned={isLearned(word.id)}
                isBookmarked={isBookmarked(word.id)}
                onToggleBookmark={() => onToggleBookmark(word.id)}
                onToggleLearned={() => onToggleLearned(word.id)}
              />
            ))}
          </StaggerContainer>
        </div>
      )}

      <p className="mt-8 mb-5 text-center text-sm text-zinc-400 dark:text-zinc-500">
        {t(
          `মোট ${totalCount}টির মধ্যে ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, totalCount)} দেখানো হচ্ছে`,
          `Showing ${start + 1}–${Math.min(start + ITEMS_PER_PAGE, totalCount)} of ${totalCount}`
        )}
      </p>

      {totalPages > 1 && (
        <Pagination>
          <div className="flex items-center gap-0.5 max-w-full">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={cn(currentPage <= 1 ? "pointer-events-none opacity-50" : "")}
              />
            </PaginationItem>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(p);
                      }}
                      isActive={p === currentPage}
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
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={cn(currentPage >= totalPages ? "pointer-events-none opacity-50" : "")}
              />
            </PaginationItem>
          </div>
        </Pagination>
      )}
    </>
  );
}

export interface ProfileTabsProps {
  levelStats?: { level: string; count: number }[];
  totalWords?: number;
}

export function ProfileTabs({ levelStats = [], totalWords = 0 }: ProfileTabsProps) {
  const activeTab = useActiveTab();
  const normalizedTab = activeTab === "still-learning" ? "quiz" : activeTab;
  const authStatus = useAuthStore((s) => s.status);
  const { data: session } = useSession();
  const isContributor =
    session?.user?.role === "admin" || session?.user?.role === "contributor";
  const effectiveTab = normalizedTab === "submits" && !isContributor ? "overview" : normalizedTab;
  const [quizSubTab, setQuizSubTab] = useState<"exams" | "vocab" | "still-learning">(
    activeTab === "still-learning" ? "still-learning" : "vocab"
  );
  const quizCount = useQuizHistory().entries.length;
  const examCount = useQuizExamHistoryStore((s) => s.entries.length);
  const { bookmarkedIds, isBookmarked, toggleBookmark, loaded: bookmarkLoaded } = useBookmarkedWords();
  const { learnedIds, isLearned, toggleLearned, loaded: learnedLoaded } = useLearnedWords();
  const { stillLearningIds, removeStillLearning, toggleStillLearning, loaded: stillLearningLoaded } = useStillLearningWords();
  const { totalCorrectAnswers, loaded: quizLoaded } = useQuizActivity();
  const loaded = bookmarkLoaded && learnedLoaded && stillLearningLoaded;
  const t = useT();

  const [bookmarkedPage, setBookmarkedPage] = useState(1);
  const [stillLearningPage, setStillLearningPage] = useState(1);
  const [learnedPage, setLearnedPage] = useState(1);

  const handleMarkLearned = (id: number) => {
    const k = String(id);
    if (!learnedIds.has(k)) toggleLearned(id);
    if (stillLearningIds.has(k)) removeStillLearning(id);
  };

  const handleMarkStillLearning = (id: number) => {
    const k = String(id);
    if (learnedIds.has(k)) toggleLearned(id);
    if (!stillLearningIds.has(k)) toggleStillLearning(id);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <Classic className="size-6" />
      </div>
    );
  }

  const total = totalWords;
  const learnedCount = learnedIds.size;
  const bookmarkedCount = bookmarkedIds.size;
  const stillLearningCount = stillLearningIds.size;
  const overallProgress = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

  return (
    <Tabs value={effectiveTab} onValueChange={setActiveTab}>
      <div className="overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {t("সারসংক্ষেপ", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="flex items-center gap-1.5">
            <BookmarkCheck className="h-4 w-4" />
            {t("বুকমার্ক করা", "Bookmarked")}
            {bookmarkedCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {bookmarkedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="learned" className="flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            {t("শেখা হয়েছে", "Learned")}
            {learnedCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {learnedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            {t("কুইজ", "Quiz")}
            {quizCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {quizCount}
              </span>
            )}
          </TabsTrigger>
          {isContributor && (
            <TabsTrigger value="submits" className="flex items-center gap-1.5">
              <SquarePen className="h-4 w-4" />
              {t("অবদান", "Submits")}
            </TabsTrigger>
          )}
          {authStatus === "google" && (
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              {t("সেটিংস", "Settings")}
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="overview">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-sky-600" />}
            label={t("মোট শব্দ", "Total Words")}
            value={total}
            color="bg-sky-100 dark:bg-sky-900/30"
          />
          <StatCard
            icon={<BookmarkCheck className="h-5 w-5 text-amber-600" />}
            label={t("বুকমার্ক করা", "Bookmarked")}
            value={bookmarkedCount}
            sub={total > 0 ? t(`মোটের ${Math.round((bookmarkedCount / total) * 100)}%`, `${Math.round((bookmarkedCount / total) * 100)}% of total`) : undefined}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            icon={<RefreshCw className="h-5 w-5 text-orange-600" />}
            label={t("শিখছে", "Still Learning")}
            value={stillLearningCount}
            sub={total > 0 ? t(`মোটের ${Math.round((stillLearningCount / total) * 100)}%`, `${Math.round((stillLearningCount / total) * 100)}% of total`) : undefined}
            color="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            icon={<Award className="h-5 w-5 text-emerald-600" />}
            label={t("শেখা হয়েছে", "Learned")}
            value={learnedCount}
            sub={t(`মোটের ${overallProgress}%`, `${overallProgress}% of total`)}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StaggerItem className="col-span-2 lg:col-span-4">
            <ProfileActivityChart />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StaggerContainer className="contents">
          <StaggerItem className="lg:col-span-1">
            <DailyGoalCard />
          </StaggerItem>

          <StaggerItem className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quiz Progress */}
            <div className={cn(CARD, "p-6 transition-all duration-300 hover:border-black/[0.12] dark:hover:border-white/[0.15]")}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]">
                  <GraduationCap className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t("কুইজের অগ্রগতি", "Quiz Progress")}
                  </h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {t("সব কুইজজুড়ে নির্ভুলতা", "accuracy across all quizzes")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t("সঠিক উত্তর", "Correct Answers")}</div>
                      <div className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {quizLoaded ? totalCorrectAnswers : "—"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <X className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t("ভুল / পুনর্বিবেচনা", "Mistakes / Review")}</div>
                      <div className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {stillLearningCount}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t("মোট কুইজ প্রশ্ন", "Total Quiz Questions")}</div>
                      <div className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {quizLoaded ? totalCorrectAnswers + stillLearningCount : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress by level */}
            <div className={cn(CARD, "p-6 transition-all duration-300 hover:border-black/[0.12] dark:hover:border-white/[0.15]")}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t("লেভেল অনুযায়ী অগ্রগতি", "Progress by Level")}
                  </h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {t("CEFR কাঠামো অনুযায়ী বিস্তার", "CEFR level breakdown")}
                  </p>
                </div>
              </div>
              <div className="space-y-3.5">
                {levelStats.map(({ level, count: totalInLevel }) => {
                  const c = levelColors[level] ?? levelColors.A1;
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", c.bg, c.text, c.border)}>{level}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t(c.labelBn, c.label)}</span>
                        </div>
                        <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                          {totalInLevel} {t("শব্দ", "words")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall progress bar */}
              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("সব মিলিয়ে সম্পন্ন", "Overall Completion")}</span>
                  <span className="text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{overallProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-700"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </StaggerItem>
          </StaggerContainer>
        </div>
      </TabsContent>

      <TabsContent value="bookmarked">
        <PaginatedWordList
          idSet={bookmarkedIds}
          page={bookmarkedPage}
          onPageChange={setBookmarkedPage}
          emptyType="bookmark"
          onToggleBookmark={toggleBookmark}
          onToggleLearned={handleMarkLearned}
          isBookmarked={isBookmarked}
          isLearned={isLearned}
        />
      </TabsContent>

      <TabsContent value="learned">
        <PaginatedWordList
          idSet={learnedIds}
          page={learnedPage}
          onPageChange={setLearnedPage}
          emptyType="learned"
          onToggleBookmark={toggleBookmark}
          onToggleLearned={handleMarkStillLearning}
          isBookmarked={isBookmarked}
          isLearned={isLearned}
        />
      </TabsContent>

      <TabsContent value="quiz">
        <Tabs value={quizSubTab} onValueChange={(v) => setQuizSubTab(v as "exams" | "vocab" | "still-learning")}>
          <TabsList>
            <TabsTrigger value="vocab" className="flex items-center gap-1.5">
              <BookOpenCheck className="h-4 w-4" />
              {t("প্র্যাকটিস", "Practice")}
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              {t("পরীক্ষা", "Exams")}
              {examCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {examCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="still-learning" className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              {t("শিখছে", "Still Learning")}
              {stillLearningCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {stillLearningCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vocab">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300 uppercase">
                    {t("শব্দ কুইজ", "Vocabulary Quizzes")}
                  </span>
                </div>
                <div className={cn(CARD, "p-5 sm:p-6")}>
                  <CombinedExamResultsPanel />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-300 uppercase">
                    {t("গ্রামার ও শ্রেণি কুইজ", "Grammar & Class Quizzes")}
                  </span>
                </div>
                <div className={cn(CARD, "p-5 sm:p-6")}>
                  <QuizPracticeResultsPanel />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exams">
            <QuizExamHistoryPanel />
          </TabsContent>

          <TabsContent value="still-learning">
            <PaginatedWordList
              idSet={stillLearningIds}
              page={stillLearningPage}
              onPageChange={setStillLearningPage}
              emptyType="still-learning"
              onToggleBookmark={toggleBookmark}
              onToggleLearned={handleMarkLearned}
              isBookmarked={isBookmarked}
              isLearned={isLearned}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {isContributor && (
        <TabsContent value="submits">
          <div className={cn(CARD, "p-5 sm:p-6")}>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 uppercase">
                {t("আমার অবদান", "My Contributions")}
              </span>
            </div>
          </div>
        </TabsContent>
      )}

      {authStatus === "google" && (
        <TabsContent value="settings">
          <div className={cn(CARD, "p-5 sm:p-6")}>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
                {t("অ্যাকাউন্ট সেটিংস", "Account Settings")}
              </span>
            </div>
            <ProfileSettings />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
